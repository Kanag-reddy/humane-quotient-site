import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { score as calculateScore, scoreQuick, totalQuestions, quickTotalQuestions } from '../data/huqData';
import { useAuth } from './AuthContext';

const TestContext = createContext();
const TestRoutingContext = createContext();
const TestResultContext = createContext();

function readSessionJson(key, fallback) {
  try {
    const saved = sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    console.error(`Could not restore ${key} from this browser session.`, error);
    return fallback;
  }
}

function readSessionText(key, fallback = '') {
  try {
    return sessionStorage.getItem(key) || fallback;
  } catch (error) {
    console.error(`Could not restore ${key} from this browser session.`, error);
    return fallback;
  }
}

function writeSession(key, value) {
  try {
    sessionStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch (error) {
    console.error(`Could not persist ${key} in this browser session.`, error);
  }
}

export function TestProvider({ children }) {
  const { user, token } = useAuth();
  const [testMode, setTestModeState] = useState(() => {
    const saved = readSessionText('huq_testMode', 'full');
    return saved === 'quick' ? 'quick' : 'full';
  });
  const activeQuestionCount = testMode === 'quick' ? quickTotalQuestions : totalQuestions;

  const [answers, setAnswers] = useState(() => {
    const parsed = readSessionJson('huq_answers', null);
    const mode = readSessionText('huq_testMode', 'full');
    const expected = mode === 'quick' ? quickTotalQuestions : totalQuestions;
    if (Array.isArray(parsed) && parsed.length === expected) return parsed;
    return Array(expected).fill(0);
  });

  const [demographics, setDemographics] = useState(() => {
    const saved = readSessionJson('huq_demographics', null);
    if (saved) return saved;
    return {
      name: '',
      email: '',
      age: '',
      gender: '',
      role: '',
      roleOther: '',
      organization: '',
      qualification: '',
      qualificationOther: '',
      course: '',
      stage: ''
    };
  });

  const [result, setResult] = useState(() => readSessionJson('huq_result', null));

  const [step, setStep] = useState(() => {
    const saved = Number(window.history.state?.huqStep);
    return Number.isInteger(saved) && saved >= 0 && saved < 8 ? saved : 0;
  });
  const [phase, setPhase] = useState(() => window.history.state?.huqPhase === 'step' ? 'step' : 'intro');
  const [submissionId, setSubmissionId] = useState(() => readSessionText('huq_subId'));
  const [isSubmitted, setIsSubmitted] = useState(() => readSessionText('huq_submitted') === 'true');
  const [emailed, setEmailed] = useState(() => readSessionText('huq_emailed') === 'true');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync logged in user name and email to demographics if available
  useEffect(() => {
    if (user && !demographics.email) {
      setDemographics((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const setAnswer = useCallback((index, mark) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[index] = mark;
      writeSession('huq_answers', updated);
      return updated;
    });
  }, []);

  const updateDemographics = useCallback((fields) => {
    setDemographics((prev) => {
      const updated = { ...prev, ...fields };
      writeSession('huq_demographics', updated);
      return updated;
    });
  }, []);

  const isComplete = answers.every((x) => x >= 1 && x <= 5);

  const computeAndSetResult = (answerOverride = null) => {
    const effectiveAnswers = Array.isArray(answerOverride) ? answerOverride : answers;
    const complete = effectiveAnswers.every((x) => x >= 1 && x <= 5);
    if (complete) {
      const res = testMode === 'quick' ? scoreQuick(effectiveAnswers) : calculateScore(effectiveAnswers);
      setResult(res);
      writeSession('huq_result', res);
      return res;
    }
    return null;
  };

  const submitTest = async (sendEmail = true, answerOverride = null) => {
    const effectiveAnswers = Array.isArray(answerOverride) ? answerOverride : answers;
    const computed = computeAndSetResult(effectiveAnswers);
    if (!computed) {
      throw new Error(`Test incomplete. All ${activeQuestionCount} questions must be answered.`);
    }

    setIsSubmitting(true);
    try {
      const payload = {
        version: testMode,
        answers: effectiveAnswers,
        demographics,
        name: demographics.name || (user && user.name) || 'Anonymous',
        email: demographics.email || (user && user.email) || '',
        submissionId: submissionId || undefined,
        sendEmail
      };

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/submit', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.error || 'Failed to submit test.');
      }

      const finalResult = data.result
        ? { ...data.result, version: testMode }
        : { ...computed, version: testMode };
      setResult(finalResult);
      writeSession('huq_result', finalResult);

      setSubmissionId(data.id);
      setIsSubmitted(true);
      setEmailed(!!data.emailed);
      writeSession('huq_subId', data.id);
      writeSession('huq_submitted', 'true');
      writeSession('huq_emailed', String(!!data.emailed));

      return data;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetTest = useCallback(() => {
    const freshAnswers = Array(testMode === 'quick' ? quickTotalQuestions : totalQuestions).fill(0);
    setAnswers(freshAnswers);
    setResult(null);
    setStep(0);
    setPhase('intro');
    setSubmissionId('');
    setIsSubmitted(false);
    setEmailed(false);
    ['huq_answers', 'huq_result', 'huq_subId', 'huq_submitted', 'huq_emailed'].forEach((key) => {
      try {
        sessionStorage.removeItem(key);
      } catch (error) {
        console.error(`Could not clear ${key} from this browser session.`, error);
      }
    });
  }, [testMode]);

  const setTestMode = useCallback((mode) => {
    const nextMode = mode === 'quick' ? 'quick' : 'full';
    setTestModeState(nextMode);
    writeSession('huq_testMode', nextMode);
    const freshAnswers = Array(nextMode === 'quick' ? quickTotalQuestions : totalQuestions).fill(0);
    setAnswers(freshAnswers);
    setResult(null);
    setStep(0);
    setPhase('intro');
    setSubmissionId('');
    setIsSubmitted(false);
    setEmailed(false);
    writeSession('huq_answers', freshAnswers);
    ['huq_result', 'huq_subId', 'huq_submitted', 'huq_emailed'].forEach((key) => {
      try { sessionStorage.removeItem(key); } catch (error) { console.error(`Could not clear ${key} from this browser session.`, error); }
    });
  }, []);

  const loadSavedResult = (savedResult, savedAnswers = null, savedDemo = null) => {
    setResult(savedResult);
    if (savedAnswers) setAnswers(savedAnswers);
    if (savedDemo) setDemographics(savedDemo);
    setPhase('profile');
  };

  const value = {
    testMode,
    setTestMode,
    activeQuestionCount,
    answers,
    demographics,
    result,
    step,
    phase,
    submissionId,
    isSubmitted,
    emailed,
    isSubmitting,
    isComplete,
    setAnswer,
    updateDemographics,
    setStep,
    setPhase,
    computeAndSetResult,
    submitTest,
    resetTest,
    loadSavedResult
  };
  const routingValue = useMemo(
    () => ({ result, step, phase, setStep, setPhase, resetTest }),
    [result, step, phase, resetTest]
  );
  const resultValue = useMemo(() => ({ result }), [result]);

  return (
    <TestResultContext.Provider value={resultValue}>
      <TestRoutingContext.Provider value={routingValue}>
        <TestContext.Provider value={value}>{children}</TestContext.Provider>
      </TestRoutingContext.Provider>
    </TestResultContext.Provider>
  );
}

export function useTest() {
  const context = useContext(TestContext);
  if (!context) throw new Error('useTest must be used within TestProvider');
  return context;
}

export function useTestRouting() {
  const context = useContext(TestRoutingContext);
  if (!context) throw new Error('useTestRouting must be used within TestProvider');
  return context;
}

export function useTestResult() {
  const context = useContext(TestResultContext);
  if (!context) throw new Error('useTestResult must be used within TestProvider');
  return context;
}

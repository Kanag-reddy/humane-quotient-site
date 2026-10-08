import React, { createContext, useContext, useState, useEffect } from 'react';
import { score as calculateScore, totalQuestions } from '../data/huqData';
import { useAuth } from './AuthContext';

const TestContext = createContext();

export function TestProvider({ children }) {
  const { user, token } = useAuth();

  const [answers, setAnswers] = useState(() => {
    try {
      const saved = sessionStorage.getItem('huq_answers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === totalQuestions) return parsed;
      }
    } catch (e) {}
    return Array(totalQuestions).fill(0);
  });

  const [demographics, setDemographics] = useState(() => {
    try {
      const saved = sessionStorage.getItem('huq_demographics');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
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

  const [result, setResult] = useState(() => {
    try {
      const saved = sessionStorage.getItem('huq_result');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState('intro'); // 'intro', 'step', 'saving', 'profile'
  const [submissionId, setSubmissionId] = useState(() => sessionStorage.getItem('huq_subId') || '');
  const [isSubmitted, setIsSubmitted] = useState(() => sessionStorage.getItem('huq_submitted') === 'true');
  const [emailed, setEmailed] = useState(() => sessionStorage.getItem('huq_emailed') === 'true');
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

  const setAnswer = (index, mark) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[index] = mark;
      sessionStorage.setItem('huq_answers', JSON.stringify(updated));
      return updated;
    });
  };

  const updateDemographics = (fields) => {
    setDemographics((prev) => {
      const updated = { ...prev, ...fields };
      sessionStorage.setItem('huq_demographics', JSON.stringify(updated));
      return updated;
    });
  };

  const isComplete = answers.every((x) => x >= 1 && x <= 5);

  const computeAndSetResult = () => {
    if (isComplete) {
      const res = calculateScore(answers);
      setResult(res);
      sessionStorage.setItem('huq_result', JSON.stringify(res));
      return res;
    }
    return null;
  };

  const submitTest = async (sendEmail = true) => {
    const computed = computeAndSetResult();
    if (!computed) {
      throw new Error('Test incomplete. All 96 questions must be answered.');
    }

    setIsSubmitting(true);
    try {
      const payload = {
        answers,
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

      setSubmissionId(data.id);
      setIsSubmitted(true);
      setEmailed(!!data.emailed);
      sessionStorage.setItem('huq_subId', data.id);
      sessionStorage.setItem('huq_submitted', 'true');
      sessionStorage.setItem('huq_emailed', String(!!data.emailed));

      return data;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetTest = () => {
    const freshAnswers = Array(totalQuestions).fill(0);
    setAnswers(freshAnswers);
    setResult(null);
    setStep(0);
    setPhase('intro');
    setSubmissionId('');
    setIsSubmitted(false);
    setEmailed(false);
    sessionStorage.removeItem('huq_answers');
    sessionStorage.removeItem('huq_result');
    sessionStorage.removeItem('huq_subId');
    sessionStorage.removeItem('huq_submitted');
    sessionStorage.removeItem('huq_emailed');
  };

  const loadSavedResult = (savedResult, savedAnswers = null, savedDemo = null) => {
    setResult(savedResult);
    if (savedAnswers) setAnswers(savedAnswers);
    if (savedDemo) setDemographics(savedDemo);
    setPhase('profile');
  };

  const value = {
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

  return <TestContext.Provider value={value}>{children}</TestContext.Provider>;
}

export function useTest() {
  const context = useContext(TestContext);
  if (!context) throw new Error('useTest must be used within TestProvider');
  return context;
}

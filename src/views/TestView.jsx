import React, { memo, useCallback, useState, useEffect, useRef } from 'react';
import { useTest } from '../context/TestContext';
import { useAuth } from '../context/AuthContext';
import { values, questions, options, profileOptions, totalQuestions } from '../data/huqData';
import { ValueIcon } from '../components/Icons';

const loaderPetalColors = ['var(--gold)', 'var(--amber)', 'var(--crimson)', 'var(--rust)'];

const QuestionCard = memo(function QuestionCard({ question, valueKey, answer, index, onSelect }) {
  return (
    <div
      id={`q-card-${question.index}`}
      className={`q ${answer ? 'ans' : ''}`}
      style={{ '--k': index }}
    >
      <span className="qn" aria-hidden="true">
        <ValueIcon name={valueKey} size={18} />
      </span>
      <p className="qt" id={`qt-${question.index}`}>
        {question.text}
      </p>
      <div className="scale" role="radiogroup" aria-labelledby={`qt-${question.index}`}>
        {options.map((option) => (
          <label key={option.marks} className={`opt o${option.marks}`}>
            <input
              type="radio"
              name={`q-${question.index}`}
              value={option.marks}
              checked={answer === option.marks}
              onChange={() => onSelect(question.index, option.marks)}
            />
            <span className="dot" />
            <span className="lbl">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
});

export function TestView({ onFinishTest, onGoProfile, onStepChange }) {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const {
    answers,
    demographics,
    step,
    phase,
    result,
    isComplete,
    setAnswer,
    updateDemographics,
    setStep,
    setPhase,
    submitTest,
    resetTest
  } = useTest();

  const [formErr, setFormErr] = useState('');
  const [savingErr, setSavingErr] = useState('');
  const scrollTimeoutRef = useRef(null);
  const finishTimeoutRef = useRef(null);
  const latestAnswersRef = useRef(answers);
  const latestStepRef = useRef(step);
  latestAnswersRef.current = answers;
  latestStepRef.current = step;

  useEffect(() => () => {
    clearTimeout(scrollTimeoutRef.current);
    clearTimeout(finishTimeoutRef.current);
  }, []);

  useEffect(() => {
    if (phase !== 'step') return undefined;
    const frame = requestAnimationFrame(() => {
      document.querySelector('.step-head h1')?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [phase, step]);

  // Sync user info into demographics if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      updateDemographics({
        name: demographics.name || user.name || '',
        email: demographics.email || user.email || ''
      });
    }
  }, [isAuthenticated, user]);

  const handleDemographicsChange = (field, val) => {
    updateDemographics({ [field]: val });
    setFormErr('');
  };

  const handleStartQuestions = (e) => {
    e.preventDefault();
    const d = demographics;
    const isOtherRole = d.role === profileOptions.other;
    const isOtherQual = d.qualification === profileOptions.other;
    const ac = profileOptions.academic[d.role];

    if (!d.name?.trim()) {
      setFormErr('Full name is required.');
      return;
    }
    if (!d.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) {
      setFormErr('A valid email address is required.');
      return;
    }
    if (!d.age) {
      setFormErr('Please select your age group.');
      return;
    }
    if (!d.gender) {
      setFormErr('Please select your gender.');
      return;
    }
    if (!d.role) {
      setFormErr('Please select your role.');
      return;
    }
    if (isOtherRole && !d.roleOther?.trim()) {
      setFormErr('Please specify your role.');
      return;
    }
    if (!d.organization?.trim()) {
      setFormErr('Please enter your organization or institution.');
      return;
    }
    if (!d.qualification) {
      setFormErr('Please select your qualification.');
      return;
    }
    if (isOtherQual && !d.qualificationOther?.trim()) {
      setFormErr('Please specify your qualification.');
      return;
    }
    if (ac && (!d.course?.trim() || !d.stage)) {
      setFormErr(`Please provide your ${ac.course} and ${ac.stageLabel}.`);
      return;
    }

    // Start at first incomplete step
    let startStep = 0;
    for (let s = 0; s < 8; s++) {
      if (answers.slice(s * 12, s * 12 + 12).some((a) => !a)) {
        startStep = s;
        break;
      }
    }
    if (onStepChange) onStepChange(startStep, 'step');
    else {
      setStep(startStep);
      setPhase('step');
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleOptionSelect = useCallback((qIndex, mark) => {
    setAnswer(qIndex, mark);

    // Debounced smooth scroll to the next unanswered question in this step
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      const stepStart = latestStepRef.current * 12;
      const stepEnd = stepStart + 12;
      let nextUnanswered = null;

      for (let i = stepStart; i < stepEnd; i++) {
        if (i !== qIndex && !latestAnswersRef.current[i]) {
          nextUnanswered = i;
          break;
        }
      }

      if (nextUnanswered !== null) {
        const el = document.getElementById(`q-card-${nextUnanswered}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 400);
  }, [setAnswer]);

  const handleNextStep = async () => {
    if (step < 7) {
      if (onStepChange) onStepChange(step + 1, 'step');
      else setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      // Completed all 8 steps! Submit test
      setPhase('saving');
      setSavingErr('');
      try {
        await submitTest(true);
        finishTimeoutRef.current = setTimeout(() => {
          onFinishTest();
        }, 1100);
      } catch (err) {
        setSavingErr(err.message || 'We could not reach the server.');
      }
    }
  };

  const handlePrevStep = () => {
    if (step === 0) {
      if (onStepChange) onStepChange(step, 'intro');
      else setPhase('intro');
    } else {
      if (onStepChange) onStepChange(step - 1, 'step');
      else setStep(step - 1);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Phase: SAVING / SUBMITTING
  if (phase === 'saving') {
    return (
      <div className="test saving-screen" style={{ padding: '60px 20px', minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
        {savingErr ? (
          <div className="saving">
            <div className="state-logo">
              <img className="state-mark" src="/img/huq-mark.webp" width="100" height="100" alt="" />
            </div>
            <h2>We couldn't save your response</h2>
            <p role="alert">{savingErr} Your answers are safe on this device.</p>
            <div className="cta-row" style={{ justifyContent: 'center', marginTop: '24px' }}>
              <button
                className="btn primary"
                onClick={async () => {
                  setSavingErr('');
                  try {
                    await submitTest(true);
                    onFinishTest();
                  } catch (e) {
                    setSavingErr(e.message);
                  }
                }}
              >
                Try again
              </button>
              <button className="btn ghost" onClick={onGoProfile}>
                View my profile without saving
              </button>
            </div>
          </div>
        ) : (
          <div className="saving state-loading" role="status">
            <div className="state-logo">
              <img className="state-mark" src="/img/huq-mark.webp" width="100" height="100" alt="" />
            </div>
            <h2>Preparing your Humane Quotient Profile…</h2>
            <p>Bringing your eight quotients together.</p>
            <div className="flower-loader" aria-hidden="true">
              {Array.from({ length: 8 }, (_, i) => (
                <i
                  key={i}
                  style={{
                    '--petal-color': loaderPetalColors[i % loaderPetalColors.length],
                    '--petal-rotation': `${i * 45}deg`
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Phase: INTRO / DEMOGRAPHICS
  if (phase === 'intro') {
    const ac = profileOptions.academic[demographics.role];

    return (
      <div className="test">
        <div className="t-narrow">
          {result && (
            <div
              className="card"
              style={{
                marginBottom: '22px',
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap'
              }}
            >
              <span>
                <b>You have already completed the test in this session.</b>
              </span>
              <span style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button className="btn primary" onClick={onGoProfile}>
                  View my profile
                </button>
                <button className="btn ghost" onClick={resetTest}>
                  Retake
                </button>
              </span>
            </div>
          )}

          <div className="intro-card">
            <span className="eyebrow">Before you begin</span>
            <h1>Test your Humane Quotient</h1>
            <p className="lead" style={{ fontSize: '1.1rem' }}>
              Eight steps, twelve statements each. Think of a <b>typical week</b> in your life and answer as you truly are — not as you wish to be. There are no right or wrong answers. It takes about 12 minutes.
            </p>

            {/* Auth / Guest Option Banner */}
            {!isAuthenticated ? (
              <div
                style={{
                  background: 'rgba(224,172,39,0.15)',
                  border: '1px solid var(--tan)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  marginBottom: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                  flexWrap: 'wrap'
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--crimson)' }}>Taking the test as a Guest</span>
                  <div style={{ fontSize: '0.9rem', color: 'var(--maroon)' }}>
                    You can complete the test and view your results without an account. Sign in to save your history.
                  </div>
                </div>
                <button
                  type="button"
                  className="btn gold"
                  style={{ padding: '8px 18px', fontSize: '0.9rem' }}
                  onClick={() => openAuthModal('login')}
                >
                  Sign In / Register
                </button>
              </div>
            ) : (
              <div
                style={{
                  background: 'rgba(71,5,0,0.06)',
                  border: '1px solid var(--sand)',
                  borderRadius: '12px',
                  padding: '12px 18px',
                  marginBottom: '22px',
                  fontSize: '0.92rem'
                }}
              >
                Logged in as <b>{user.name}</b> ({user.email}). Your results will be saved to your personal history.
              </div>
            )}

            <div className="privacy">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#A8450F" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
                <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
              </svg>
              <div>
                <b>Confidentiality & Privacy.</b> Your responses are stored confidentially for self-evaluation and academic research on the Humane Quotient.
              </div>
            </div>

            <form onSubmit={handleStartQuestions}>
              <div className="fields f2">
                <div className="field">
                  <label htmlFor="f-name">
                    Full Name <span className="req">*</span>
                  </label>
                  <input
                    id="f-name"
                    type="text"
                    required
                    maxLength="80"
                    value={demographics.name || ''}
                    onChange={(e) => handleDemographicsChange('name', e.target.value)}
                    placeholder="e.g. Priyanshu Sharma"
                  />
                </div>

                <div className="field">
                  <label htmlFor="f-email">
                    Email Address <span className="req">*</span>
                  </label>
                  <input
                    id="f-email"
                    type="email"
                    required
                    maxLength="254"
                    value={demographics.email || ''}
                    onChange={(e) => handleDemographicsChange('email', e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="fields f2">
                <div className="field">
                  <label htmlFor="f-age">
                    Age Group <span className="req">*</span>
                  </label>
                  <select
                    id="f-age"
                    required
                    value={demographics.age || ''}
                    onChange={(e) => handleDemographicsChange('age', e.target.value)}
                  >
                    <option value="">Select…</option>
                    {['Below 18', '18–24', '25–34', '35–44', '45–54', '55–64', '65+'].map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="f-gender">
                    Gender <span className="req">*</span>
                  </label>
                  <select
                    id="f-gender"
                    required
                    value={demographics.gender || ''}
                    onChange={(e) => handleDemographicsChange('gender', e.target.value)}
                  >
                    <option value="">Select…</option>
                    {['Female', 'Male', 'Non-binary / Other', 'Prefer not to say'].map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="fields f2">
                <div className="field">
                  <label htmlFor="f-role">
                    Role <span className="req">*</span>
                  </label>
                  <select
                    id="f-role"
                    required
                    value={demographics.role || ''}
                    onChange={(e) => handleDemographicsChange('role', e.target.value)}
                  >
                    <option value="">Select…</option>
                    {profileOptions.roles.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="f-org">
                    Organization / Institution <span className="req">*</span>
                  </label>
                  <input
                    id="f-org"
                    type="text"
                    required
                    maxLength="80"
                    value={demographics.organization || ''}
                    onChange={(e) => handleDemographicsChange('organization', e.target.value)}
                    placeholder="e.g. University / Company name"
                  />
                </div>
              </div>

              {demographics.role === profileOptions.other && (
                <div className="fields f2">
                  <div className="field">
                    <label htmlFor="f-roleother">
                      Please specify your role <span className="req">*</span>
                    </label>
                    <input
                      id="f-roleother"
                      type="text"
                      required
                      maxLength="80"
                      value={demographics.roleOther || ''}
                      onChange={(e) => handleDemographicsChange('roleOther', e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="fields f2">
                <div className="field">
                  <label htmlFor="f-qual">
                    Qualification <span className="req">*</span>
                  </label>
                  <select
                    id="f-qual"
                    required
                    value={demographics.qualification || ''}
                    onChange={(e) => handleDemographicsChange('qualification', e.target.value)}
                  >
                    <option value="">Select…</option>
                    {profileOptions.qualifications.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                {demographics.qualification === profileOptions.other && (
                  <div className="field">
                    <label htmlFor="f-qualother">
                      Please specify qualification <span className="req">*</span>
                    </label>
                    <input
                      id="f-qualother"
                      type="text"
                      required
                      maxLength="80"
                      value={demographics.qualificationOther || ''}
                      onChange={(e) => handleDemographicsChange('qualificationOther', e.target.value)}
                    />
                  </div>
                )}
              </div>

              {ac && (
                <div className="fields f2">
                  <div className="field">
                    <label htmlFor="f-course">
                      {ac.course} <span className="req">*</span>
                    </label>
                    <input
                      id="f-course"
                      type="text"
                      required
                      maxLength="80"
                      value={demographics.course || ''}
                      onChange={(e) => handleDemographicsChange('course', e.target.value)}
                      placeholder="e.g. Computer Science / Humanities"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="f-stage">
                      {ac.stageLabel} <span className="req">*</span>
                    </label>
                    <select
                      id="f-stage"
                      required
                      value={demographics.stage || ''}
                      onChange={(e) => handleDemographicsChange('stage', e.target.value)}
                    >
                      <option value="">Select…</option>
                      {ac.stages.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {formErr && (
                <p className="fine" role="alert" style={{ color: 'var(--crimson)', fontWeight: 600 }}>
                  {formErr}
                </p>
              )}

              <p className="fine" style={{ marginTop: '14px' }}>
                Your email is used to send your personal report. Responses are evaluated confidentially.
              </p>

              <div className="note" style={{ marginBottom: '26px' }}>
                HuQ is designed for honest <b>self-evaluation and personal growth</b>. HuQ is not for judging, comparing or labelling individuals.
              </div>

              <button className="btn primary" type="submit">
                I understand — begin the test →
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Phase: STEP (Questions)
  const currentVal = values[step];
  const stepStart = step * 12;
  const stepQuestions = questions.slice(stepStart, stepStart + 12);
  const stepAnsweredCount = answers.slice(stepStart, stepStart + 12).filter(Boolean).length;
  const totalAnsweredCount = answers.filter(Boolean).length;
  const isStepDone = stepAnsweredCount === 12;

  return (
    <>
      <div className="stepper">
        <div className="row">
          {values.map((v, i) => {
            const dn = answers.slice(i * 12, i * 12 + 12).every(Boolean);
            const isCur = i === step;
            return (
              <div
                key={v.key}
                className={`sd ${isCur ? 'cur' : dn ? 'done' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (onStepChange) onStepChange(i, 'step');
                  else setStep(i);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    if (onStepChange) onStepChange(i, 'step');
                    else setStep(i);
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }
                }}
                aria-label={`Step ${i + 1}: ${v.name}`}
              >
                <i>
                  <ValueIcon name={v.key} size={18} />
                </i>
              </div>
            );
          })}
        </div>

        <div
          className="bar"
          role="progressbar"
          aria-label="Test progress"
          aria-valuemin={0}
          aria-valuemax={totalQuestions}
          aria-valuenow={totalAnsweredCount}
        >
          <i style={{ '--progress': totalAnsweredCount / totalQuestions }} />
        </div>
      </div>

      <div className="test" style={{ paddingTop: 0 }}>
        <div className="t-narrow">
          <div className="step-head">
            <div className="ico">
              <ValueIcon name={currentVal.key} size={36} color="var(--crimson)" />
            </div>
            <span className="eyebrow" style={{ marginBottom: '.4rem' }}>
              {currentVal.facet}
            </span>
            <h1>{currentVal.name}</h1>
            <p>
              {currentVal.definition} Think of a typical week.
            </p>
          </div>

          {stepQuestions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              valueKey={currentVal.key}
              answer={answers[question.index]}
              index={index}
              onSelect={handleOptionSelect}
            />
          ))}

          <div className="nav-row">
            <button className="btn ghost" type="button" onClick={handlePrevStep}>
              ← {step === 0 ? 'Back to demographics' : 'Previous step'}
            </button>

            <span className="counter" role="img" aria-label={`${stepAnsweredCount} of 12 questions answered`}>
              {Array.from({ length: 12 }, (_, i) => (
                <i key={i} className={i < stepAnsweredCount ? 'on' : i === stepAnsweredCount ? 'next' : ''} />
              ))}
            </span>

            <button
              className="btn primary"
              type="button"
              disabled={!isStepDone}
              onClick={handleNextStep}
            >
              {step === 7 ? 'See my HuQ profile →' : 'Next step →'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

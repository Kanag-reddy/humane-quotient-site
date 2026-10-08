import React, { useEffect } from 'react';
import { useTest } from '../context/TestContext';
import { values, levels } from '../data/huqData';
import { ValueIcon, DownloadIcon } from '../components/Icons';

export function ActionPlanView({ onBackProfile, onRetake }) {
  const { result } = useTest();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  if (!result) {
    return (
      <div className="state-page">
        <div className="wrap">
          <div className="state state-empty">
            <div className="state-logo">
              <img className="state-mark" src="/img/huq-mark.webp" width="120" height="120" alt="" />
            </div>
            <span className="eyebrow">No data yet</span>
            <h1>Your action plan is waiting for your answers</h1>
            <p className="lead">
              Finish the test and your tailored personal action plan will appear here.
            </p>
            <div className="state-actions">
              <button className="btn primary" onClick={onRetake}>
                Begin the test →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentLevel = levels[result.level];
  const strongestKey = (result.strongest && result.strongest[0]) || 'se';
  const topVal = values.find((v) => v.key === strongestKey) || values[0];
  const topScoreObj = result.values.find((v) => v.key === topVal.key) || result.values[0];

  // Map 7 steps from strongest value to remaining values, sorted by greatest room for growth (lowest score first)
  const growthSteps = Object.keys(topVal.plan || {})
    .map((k) => {
      const targetVal = values.find((v) => v.key === k);
      const targetScore = result.values.find((v) => v.key === k);
      return {
        targetVal,
        scoreObj: targetScore,
        text: topVal.plan[k]
      };
    })
    .filter((item) => item.targetVal && item.scoreObj)
    .sort((a, b) => a.scoreObj.score - b.scoreObj.score);

  const ladderStages = [
    {
      levelIdx: 0,
      title: 'Self-Care',
      actions: [
        'Notice one need around you each day and act on it.',
        'Practise listening fully before replying.',
        'Do small acts of help without expecting anything back.'
      ]
    },
    {
      levelIdx: 1,
      title: 'Socio-Care',
      actions: [
        'Extend the loyalty you give family and friends to new people and strangers.',
        'Make decisions that consider your whole community.',
        'Welcome differences of background, belief and opinion.'
      ]
    },
    {
      levelIdx: 2,
      title: 'Universal Care',
      actions: [
        'Put collective well-being first as a natural instinct.',
        'Work to remove barriers and share power and influence.',
        'Steward people, society, nature and future generations.'
      ]
    }
  ];

  return (
    <>
      <section className="plan-hero">
        <picture className="hero-bg" aria-hidden="true">
          <source media="(min-width:768px)" srcSet="/img/hero-red-desktop.webp" width="1920" height="1300" />
          <img src="/img/hero-red-mobile.webp" width="1000" height="1300" alt="" />
        </picture>
        <div className="wrap">
          <span className="eyebrow">Action plan</span>
          <h1>Grow your Humane Quotient</h1>
          <p>
            Use your strongest humane value as the foundation for growing the others. Your steps below are ordered so the values with the most room to grow come first.
          </p>
        </div>
      </section>

      <div className="wrap pull">
        <div className="lev-card">
          <div className="ring">
            {(Math.round(topScoreObj.quotient * 10) / 10).toFixed(1)}
          </div>
          <div>
            <span className="eyebrow" style={{ color: 'var(--maroon)', opacity: 0.8, marginBottom: '.3rem' }}>
              Your strongest foundation value
            </span>
            <h2>{topVal.name} · {topVal.facet}</h2>
            <p>
              <b>Leverage:</b> {topVal.leverage}
            </p>
          </div>
        </div>
      </div>

      <section style={{ paddingTop: '44px' }}>
        <div className="wrap">
          <div>
            <span className="eyebrow">How to use your strongest value to build the others</span>
            <h2>Seven steps from {topVal.name}</h2>
          </div>

          <div className="tips">
            {growthSteps.map((it, n) => {
              const l = levels[it.scoreObj.level];
              const isFocus = n < 2;

              return (
                <div key={it.targetVal.key} className={`tip ${isFocus ? 'focus' : ''}`}>
                  <div className="ic">
                    <ValueIcon name={it.targetVal.key} size={26} color="var(--crimson)" />
                  </div>
                  <div>
                    <h4>
                      {topVal.name} → {it.targetVal.name}{' '}
                      <span style={{ color: 'var(--bronze)', fontWeight: 500 }}>
                        · {it.targetVal.facet}
                      </span>
                    </h4>
                    <p>{it.text}</p>
                  </div>
                  <span className="st" style={{ background: l.color, color: l.ink }}>
                    {(Math.round(it.scoreObj.quotient * 10) / 10).toFixed(1)}/10
                  </span>
                  {isFocus && <span className="ff">Focus First</span>}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '64px' }}>
            <span className="eyebrow">Evolution of Care</span>
            <h2>Moving up the journey</h2>
            <p style={{ maxWidth: '64ch' }}>
              Your overall HuQ places you at <b>{currentLevel.name}</b>. Growth is a continuous movement from Self-Care to Socio-Care to Universal Care — like drops of water expanding from stream to ocean.
            </p>
          </div>

          <div className="ladder">
            {ladderStages.map((s) => {
              const isCur = s.levelIdx === result.level;
              return (
                <div key={s.levelIdx} className={`card ${isCur ? 'cur' : ''}`}>
                  {isCur && <span className="you">You are here</span>}
                  <h3>{s.title}</h3>
                  <ul>
                    {s.actions.map((act, idx) => (
                      <li key={idx}>{act}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="note" style={{ marginTop: '40px' }}>
            <b>Keep growing.</b> Revisit the test after a few months to observe how your care is evolving. HuQ is designed for personal development and self-understanding.
          </div>

          <div className="cta-row" style={{ marginTop: '36px' }}>
            <button className="btn primary" onClick={onBackProfile}>
              ← Back to my profile
            </button>
            <button className="btn ghost" onClick={() => window.print()}>
              <DownloadIcon size={16} /> Print / Save as PDF
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

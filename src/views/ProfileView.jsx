import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useTest } from '../context/TestContext';
import { useAuth } from '../context/AuthContext';
import { values, levels, VALUE_MIN, VALUE_MAX, TOTAL_MIN, TOTAL_MAX, huqAssessment } from '../data/huqData';
import { FlowerSVG } from '../components/FlowerSVG';
import { BudSVG } from '../components/BudSVG';
import { ShareModal } from '../components/ShareModal';
import { ValueIcon, DownloadIcon, MailIcon } from '../components/Icons';

export function ProfileView({ onGoPlan, onRetake }) {
  const { result, demographics } = useTest();
  const { user } = useAuth();

  const [revealed, setRevealed] = useState(false);
  const [budOpen, setBudOpen] = useState(false);
  const [bloomActive, setBloomActive] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const animationTimersRef = useRef([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    return () => {
      animationTimersRef.current.forEach(clearTimeout);
      animationTimersRef.current = [];
    };
  }, []);

  const clearAnimationTimers = () => {
    animationTimersRef.current.forEach(clearTimeout);
    animationTimersRef.current = [];
  };

  const scheduleAnimation = (callback, delay) => {
    const timer = setTimeout(callback, delay);
    animationTimersRef.current.push(timer);
  };

  const handleReveal = () => {
    clearAnimationTimers();
    setBudOpen(true);
    scheduleAnimation(() => {
      setRevealed(true);
      setBloomActive(true);
      if (result && result.level >= 1) {
        confetti({
          particleCount: 12,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#E0AC27', '#C97F1C', '#A8450F', '#850500', '#FFFDE9']
        });
      }
    }, 500);
  };

  const handleReplayBloom = () => {
    clearAnimationTimers();
    setBloomActive(false);
    scheduleAnimation(() => setBloomActive(true), 150);
  };

  if (!result) {
    return (
      <div className="state-page">
        <div className="wrap">
          <div className="state state-empty">
            <div className="state-logo">
              <img className="state-mark" src="/img/huq-mark.webp" width="120" height="120" alt="" />
            </div>
            <span className="eyebrow">No data yet</span>
            <h1>Your profile is waiting for your answers</h1>
            <p className="lead">
              Your profile appears here once you have answered all 96 questions. It takes about 12 minutes.
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
  const strongestKeys = result.strongest || [];
  const topValues = strongestKeys.map((k) => values.find((v) => v.key === k)).filter(Boolean);
  const primaryTop = topValues[0] || values[0];
  const sortedValues = [...result.values].sort((a, b) => b.score - a.score);

  const totalPct = Math.max(0, Math.min(100, ((result.total - TOTAL_MIN) / (TOTAL_MAX - TOTAL_MIN)) * 100));

  const displayName = demographics.name || (user && user.name) || 'Your';

  return (
    <>
      <section className="prof-hero">
        <picture className="hero-bg" aria-hidden="true">
          <source media="(min-width:768px)" srcSet="/img/hero-red-desktop.webp" width="1920" height="1300" />
          <img src="/img/hero-red-mobile.webp" width="1000" height="1300" alt="" />
        </picture>

        <div className="wrap">
          <span className="eyebrow">Your Humane Quotient Profile</span>
          <h1>{displayName === 'Your' ? 'Your HuQ' : `${displayName}’s HuQ`}</h1>

          {!revealed ? (
            <div className="hx hx-wait">
              <p className="d">Your results are ready. Open the flower below to reveal them.</p>
            </div>
          ) : (
            <div className="hx hx-res" style={{ display: 'block' }}>
              <div className="sc">
                <b>{(Math.round(result.huq * 10) / 10).toFixed(1)}</b>
                <span>/ 10</span>
              </div>
              <br />
              <span className="lvl">{currentLevel.name} is your priority</span>
              <p className="d">{huqAssessment[result.level]}</p>
            </div>
          )}
        </div>
      </section>

      {/* Flower Card (Gated or Revealed) */}
      <div className="wrap pull">
        <div className={`big-card fl-card ${!revealed ? 'locked' : ''}`} id="flCard">
          <div className="fl-res">
            <div className="fl-flower">
              <div className="fl-stack">
                {!revealed ? (
                  <>
                    <BudSVG isOpen={budOpen} />
                    <span className="reveal-cta">
                      Click / Tap to reveal your profile
                    </span>
                    <button
                      className="reveal-hit"
                      type="button"
                      aria-label="Click to reveal your profile"
                      onClick={handleReveal}
                    />
                  </>
                ) : (
                  <FlowerSVG result={result} onReplay={handleReplayBloom} isBlooming={bloomActive} />
                )}
              </div>

              {revealed && (
                <div className="legend">
                  {levels.map((l) => (
                    <span key={l.key}>
                      <i style={{ background: l.color }} />
                      {l.name}
                    </span>
                  ))}
                  <span>★ strongest</span>
                </div>
              )}
            </div>

            {revealed && (
              <div className="fl-details">
                <div className="strong">
                  <span className="eyebrow">
                    Your strongest quotient{topValues.length > 1 ? 's' : ''}
                  </span>
                  <h3>{topValues.map((v) => v.name).join(' & ')}</h3>
                  <div className="fc">
                    {topValues.map((v) => v.facet).join(' · ')} — {(Math.round((result.max / 6) * 10) / 10).toFixed(1)}/10
                  </div>
                  <p>
                    {topValues.length > 1 ? 'You are equally strong across these values. ' : ''}
                    {primaryTop.leverage}
                  </p>
                </div>

                <h3 style={{ margin: '26px 0 8px' }}>Your quotients, ranked</h3>
                {sortedValues.map((v) => {
                  const valDef = values.find((x) => x.key === v.key);
                  const valLvl = levels[v.level];
                  const barWidth = Math.max(0, Math.min(100, ((v.score - 12) / 48) * 100));

                  return (
                    <div
                      key={v.key}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '130px 1fr 46px',
                        gap: '10px',
                        alignItems: 'center',
                        margin: '7px 0',
                        fontSize: '.92rem'
                      }}
                    >
                      <span>
                        <b>{valDef.name}</b>
                      </span>
                      <span style={{ height: '9px', background: 'var(--sand)', borderRadius: '9px', overflow: 'hidden' }}>
                        <i
                          style={{
                            display: 'block',
                            height: '100%',
                            width: `${barWidth}%`,
                            background: valLvl.color,
                            borderRadius: '9px'
                          }}
                        />
                      </span>
                      <span style={{ textAlign: 'right', color: 'var(--bronze)', fontWeight: 600 }}>
                        {(Math.round(v.quotient * 10) / 10).toFixed(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Extended Profile Content (Rendered upon reveal) */}
      {revealed && (
        <section style={{ paddingTop: '36px' }}>
          <div className="wrap">
            {/* Journey Spectrum */}
            <div className="big-card">
              <h2>Your journey from Self-Care to Universal Care</h2>
              <p style={{ color: '#6b3a33', marginBottom: '16px' }}>
                Overall HuQ score <b>{result.total}</b> out of 480. The marker indicates where your care currently rests on the Evolution of Care.
              </p>

              <div className="spectrum" role="img" aria-label={`HuQ Total ${result.total}: Between Self-Care, Socio-Care, and Universal Care`}>
                <div className="zones">
                  <span className="z z1" style={{ width: '34.4%' }}>Self-Care</span>
                  <span className="z z2" style={{ width: '33.3%' }}>Socio-Care</span>
                  <span className="z z3" style={{ width: '32.3%' }}>Universal Care</span>
                </div>
                <div className="mk go" style={{ '--pct': `${totalPct}%`, left: `${totalPct}%` }}>
                  <b>{result.total}</b>
                  <i />
                </div>
              </div>
            </div>

            {/* Quotient Cards */}
            <div style={{ marginTop: '56px' }}>
              <span className="eyebrow">Quotient by quotient</span>
              <h2>Where you stand on each value</h2>
              <p style={{ maxWidth: '62ch' }}>
                Each quotient is scored out of 60 and shown out of 10. Scores of 12–28 reflect <b>Self-Care</b>, 29–44 <b>Socio-Care</b>, and 45–60 <b>Universal Care</b>.
              </p>
            </div>

            <div className="vgrid">
              {result.values.map((v, i) => {
                const def = values[i];
                const isTop = strongestKeys.includes(v.key);
                const l = levels[v.level];
                const cardPct = Math.max(0, Math.min(100, ((v.score - VALUE_MIN) / (VALUE_MAX - VALUE_MIN)) * 100));

                return (
                  <article key={v.key} className={`vcard ${isTop ? 'top' : ''}`}>
                    {isTop && <span className="badge">★ Strongest</span>}
                    <header>
                      <div className="ic">
                        <ValueIcon name={v.key} size={24} />
                      </div>
                      <h3>
                        {def.name}
                        <small>
                          {def.facet} · {def.code}
                        </small>
                      </h3>
                      <div className="num">
                        <b>{(Math.round(v.quotient * 10) / 10).toFixed(1)}</b>
                        <span>{v.score}/60</span>
                      </div>
                    </header>

                    <span className="lv" style={{ background: l.color, color: l.ink }}>
                      {l.name}
                    </span>

                    <div className="spectrum sm">
                      <div className="zones">
                        <span className="z z1" style={{ width: '34.4%' }} />
                        <span className="z z2" style={{ width: '33.3%' }} />
                        <span className="z z3" style={{ width: '32.3%' }} />
                      </div>
                      <div className="mk go" style={{ '--pct': `${cardPct}%`, left: `${cardPct}%` }}>
                        <b>{v.score}</b>
                        <i />
                      </div>
                    </div>

                    <p className="as">{def.assess[v.level]}</p>

                    <div className="mini">
                      {v.aspects.map((a, k) => (
                        <div key={k}>
                          <span>{def.aspects[k].name}</span>
                          <span className="t">
                            <i style={{ width: `${(a / 15) * 100}%` }} />
                          </span>
                          <em>{a}/15</em>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Assessment Summary Table */}
            <div className="big-card" style={{ marginTop: '44px' }}>
              <h2>Assessment summary</h2>
              <table className="sumtable" role="table">
                <thead>
                  <tr>
                    <th>Core humane value</th>
                    <th>Score</th>
                    <th>Quotient</th>
                    <th>Care level</th>
                  </tr>
                </thead>
                <tbody>
                  {result.values.map((v, i) => (
                    <tr key={v.key}>
                      <td>
                        <b>{values[i].name}</b> <span style={{ color: 'var(--bronze)' }}>({values[i].code})</span>
                      </td>
                      <td data-label="Score">{v.score}/60</td>
                      <td data-label="Quotient">{(Math.round(v.quotient * 10) / 10).toFixed(1)}/10</td>
                      <td data-label="Care level">
                        <span className="chip" style={{ background: levels[v.level].color, color: levels[v.level].ink }}>
                          {levels[v.level].name}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: 'rgba(224,172,39,0.1)' }}>
                    <td>
                      <b>Humane Quotient (HuQ)</b>
                    </td>
                    <td data-label="Score">
                      <b>{result.total}/480</b>
                    </td>
                    <td data-label="Quotient">
                      <b>{(Math.round(result.huq * 10) / 10).toFixed(1)}/10</b>
                    </td>
                    <td data-label="Care level">
                      <span className="chip" style={{ background: currentLevel.color, color: currentLevel.ink }}>
                        {currentLevel.name}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Characteristics */}
            <div style={{ marginTop: '56px' }}>
              <span className="eyebrow">Characteristics of humaneness</span>
              <h2>What your strength looks like</h2>
            </div>
            <div className="chars">
              {topValues.slice(0, 2).map((v) => (
                <div key={v.key} className="card">
                  <h3>
                    {v.name} · {v.facet}
                  </h3>
                  <ul>
                    {v.traits.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Action Row */}
            <div className="cta-row" style={{ marginTop: '40px' }}>
              <button className="btn primary" onClick={onGoPlan}>
                See my action plan →
              </button>

              <button className="btn ghost" onClick={() => window.print()}>
                <DownloadIcon size={16} /> Print / Save as PDF
              </button>

              <button className="btn ghost" onClick={() => setShowShareModal(true)}>
                <MailIcon size={16} /> Share via Email
              </button>

              <button className="btn ghost" onClick={onRetake}>
                Retake the test
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        result={result}
        userName={displayName}
      />
    </>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useTest } from '../context/TestContext';
import { useAuth } from '../context/AuthContext';
import { values, levels, VALUE_MIN, VALUE_MAX, TOTAL_MIN, TOTAL_MAX, huqAssessment } from '../data/huqData';
import { FlowerSVG } from '../components/FlowerSVG';
import { BudSVG } from '../components/BudSVG';
import { PetalsBackground } from '../components/PetalsBackground';
import { ShareModal } from '../components/ShareModal';
import { ValueIcon, DownloadIcon, MailIcon } from '../components/Icons';

const responseLabels = ['Almost Never', 'Rarely', 'Sometimes', 'Often', 'Almost Always'];

function describeResponseAverage(total, questionCount) {
  const average = total / questionCount;
  const lowerMark = Math.floor(average);
  const upperMark = Math.ceil(average);
  const interpretation = lowerMark === upperMark
    ? `closest to “${responseLabels[lowerMark - 1]}”`
    : `between “${responseLabels[lowerMark - 1]}” and “${responseLabels[upperMark - 1]}”`;

  return `${average.toFixed(1)} out of 5, ${interpretation}`;
}

function describeScoreBand(score) {
  if (score <= 20) return 'Your answers leaned toward the lower end of the response scale.';
  if (score <= 28) return 'Your answers leaned toward the lower part of the response scale.';
  if (score <= 36) return 'Your answers clustered around the middle of the response scale.';
  if (score <= 44) return 'Your answers leaned above the middle of the response scale.';
  if (score <= 52) return 'Your answers leaned toward the upper part of the response scale.';
  return 'Your answers consistently leaned toward the upper end of the response scale.';
}

function describeAspectBand(score) {
  if (score <= 5) return 'answers leaned toward the lower end of the frequency scale';
  if (score <= 8) return 'answers were between Rarely and Sometimes on average';
  if (score <= 11) return 'answers were between Sometimes and Often on average';
  return 'answers leaned toward the upper end of the frequency scale';
}

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

  useEffect(() => {
    const revealReportForPrint = () => {
      setBudOpen(true);
      setBloomActive(false);
      setRevealed(true);
    };
    window.addEventListener('beforeprint', revealReportForPrint);
    return () => window.removeEventListener('beforeprint', revealReportForPrint);
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
  const scoredValues = result.values
    .map((score) => ({ ...score, definition: values.find((value) => value.key === score.key) }))
    .filter((score) => score.definition);
  const sortedValues = [...scoredValues].sort((a, b) => b.score - a.score);
  const lowestScore = Math.min(...scoredValues.map((value) => value.score));
  const highestScore = Math.max(...scoredValues.map((value) => value.score));
  const growthValues = scoredValues.filter((value) => value.score === lowestScore);
  const levelCounts = levels.map((level, index) => ({
    ...level,
    count: scoredValues.filter((value) => value.level === index).length
  }));
  const currentLevelCount = levelCounts[result.level]?.count || 0;
  const formatValueNames = (items) => items.map((item) => item.definition.name).join(', ');

  const totalPct = Math.max(0, Math.min(100, ((result.total - TOTAL_MIN) / (TOTAL_MAX - TOTAL_MIN)) * 100));

  const displayName = demographics.name || (user && user.name) || 'Your';

  return (
    <div className="profile-report-page">
      <section className="prof-hero">
        <PetalsBackground />

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
              <span className="lvl" style={{ background: currentLevel.color, color: currentLevel.ink }}>
                {currentLevel.name} is your priority
              </span>
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
                  </>
                ) : (
                  <FlowerSVG result={result} onReplay={handleReplayBloom} isBlooming={bloomActive} />
                )}
              </div>

              {!revealed && (
                <button className="reveal-cta" type="button" onClick={handleReveal}>
                  Click / Tap to reveal your profile
                </button>
              )}

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
            <div className="personal-report" aria-labelledby="personal-report-heading">
              <span className="eyebrow">Your HuQ report</span>
              <h2 id="personal-report-heading">A closer look at your results</h2>
              <p className="personal-report-intro">
                This report reflects your answers in this assessment. It is a snapshot for self-reflection—not a fixed personality type, diagnosis, or judgment.
              </p>
              <div className="report-grid">
                <article className="report-card">
                  <span className="report-label">Your overall picture</span>
                  <h3>{currentLevel.name}</h3>
                  <p>
                    Your HuQ is {(Math.round(result.huq * 10) / 10).toFixed(1)}/10 ({result.total}/480). {currentLevelCount} of your eight value scores {currentLevelCount === 1 ? 'is' : 'are'} in this care band.
                  </p>
                  <p>
                    Across the eight values, your scores range from {lowestScore} to {highestScore} out of 60.
                  </p>
                </article>

                <article className="report-card">
                  <span className="report-label">Your strongest pattern</span>
                  <h3>{topValues.map((value) => value.name).join(' & ')}</h3>
                  <p>
                    {topValues.length > 1 ? 'These values are tied for your highest score. ' : ''}
                    {primaryTop.leverage} The related value reports below show the reflection areas that contributed to each score.
                  </p>
                </article>

                <article className="report-card">
                  <span className="report-label">A place to grow</span>
                  <h3>{formatValueNames(growthValues)}</h3>
                  <p>
                    {growthValues.length > 1 ? 'These values are tied for your lowest score. ' : ''}
                    This is a useful place to begin exploring small, practical changes. A lower score is not a flaw; it points to an area your answers rated differently in this snapshot.
                  </p>
                </article>

                <article className="report-card">
                  <span className="report-label">Your eight-value spread</span>
                  <h3>{highestScore - lowestScore} point{highestScore - lowestScore === 1 ? '' : 's'} between highest and lowest</h3>
                  <p>
                    Highest: {formatValueNames(scoredValues.filter((value) => value.score === highestScore))}. Lowest: {formatValueNames(growthValues)}. Compare each value’s four reflection areas below to see where those scores came from.
                  </p>
                </article>
              </div>
              <p className="report-level-summary">
                Across your eight quotients: {levelCounts.filter((level) => level.count > 0).map((level) => `${level.count} ${level.name}`).join(' · ')}.
              </p>
            </div>

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
              {sortedValues.map((v) => {
                const def = v.definition;
                const isTop = strongestKeys.includes(v.key);
                const l = levels[v.level];
                const cardPct = Math.max(0, Math.min(100, ((v.score - VALUE_MIN) / (VALUE_MAX - VALUE_MIN)) * 100));
                const aspectScores = def.aspects.map((aspect, index) => ({
                  name: aspect.name,
                  score: v.aspects?.[index] || 0
                }));
                const highestAspect = Math.max(...aspectScores.map((aspect) => aspect.score));
                const lowestAspect = Math.min(...aspectScores.map((aspect) => aspect.score));
                const leadingAspects = aspectScores.filter((aspect) => aspect.score === highestAspect);
                const exploringAspects = aspectScores.filter((aspect) => aspect.score === lowestAspect);

                return (
                  <article
                    key={v.key}
                    className={`vcard ${isTop ? 'top' : ''}`}
                    style={{ '--level-accent': isTop ? 'var(--gold)' : l.color }}
                  >
                    {isTop && <span className="badge">★ Strongest</span>}
                    <header>
                      <div className="ic" style={{ background: l.color, color: l.ink }}>
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

                    <div className="score-narrative">
                      <h4>What this score means</h4>
                      <p>
                        {describeScoreBand(v.score)} Across 12 {def.name.toLowerCase()} statements, your average response was {describeResponseAverage(v.score, 12)}. HuQ describes this score band as {l.name}; this is a summary of your answers, not a comparison with other people.
                      </p>
                      <p>
                        <b>{def.name} through {def.facet.toLowerCase()}:</b> {def.facetText}
                      </p>
                      <p>
                        <b>At this care level:</b> {def.assess[v.level]}
                      </p>
                    </div>

                    <div className="aspect-insight">
                      {highestAspect === lowestAspect ? (
                        <p>
                          <b>Your reflection areas are even:</b> all four are rated {highestAspect}/15 in this value.
                        </p>
                      ) : (
                        <>
                          <p>
                            <b>Most present in your answers:</b> {leadingAspects.map((aspect) => aspect.name).join(', ')} ({highestAspect}/15).
                          </p>
                          <p>
                            <b>Worth exploring:</b> {exploringAspects.map((aspect) => aspect.name).join(', ')} ({lowestAspect}/15).
                          </p>
                        </>
                      )}
                    </div>

                    <div className="mini">
                      {aspectScores.map((aspect, k) => (
                        <div key={k}>
                          <span>{aspect.name}</span>
                          <span className="t">
                            <i style={{ width: `${(aspect.score / 15) * 100}%` }} />
                          </span>
                          <em>{aspect.score}/15</em>
                        </div>
                      ))}
                    </div>
                    <ul className="aspect-explanations">
                      {aspectScores.map((aspect) => (
                        <li key={aspect.name}>
                          <b>{aspect.name}:</b> {aspect.score}/15 across three statements; average response {describeResponseAverage(aspect.score, 3)}. {describeAspectBand(aspect.score)}.
                        </li>
                      ))}
                    </ul>
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
            <p className="print-report-note">
              This report describes your responses at the time you completed the HuQ assessment. It is intended for personal reflection and is not a clinical diagnosis or a fixed label.
            </p>
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
    </div>
  );
}

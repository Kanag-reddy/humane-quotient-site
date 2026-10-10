import React, { useState } from 'react';
import { values } from '../data/huqData';
import { StreamSVG } from '../components/StreamSVG';
import { PetalsBackground } from '../components/PetalsBackground';
import { ValueIcon } from '../components/Icons';

export function HomeView({ onStartTest, onOpenAbout }) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const selectedValue = values[selectedIdx];

  const hotspots = [
    { idx: 0, label: 'Selflessness', left: '50.0%', top: '15.5%' },
    { idx: 1, label: 'Empathy', left: '74.4%', top: '25.6%' },
    { idx: 2, label: 'Integrity', left: '84.5%', top: '50.0%' },
    { idx: 3, label: 'Acceptance', left: '74.4%', top: '74.4%' },
    { idx: 4, label: 'Responsibility', left: '50.0%', top: '84.5%' },
    { idx: 5, label: 'Equity', left: '25.6%', top: '74.4%' },
    { idx: 6, label: 'Diversity', left: '15.5%', top: '50.0%' },
    { idx: 7, label: 'Inclusivity', left: '25.6%', top: '25.6%' }
  ];

  return (
    <>
      <section className="hero">
        <picture className="hero-bg" aria-hidden="true">
          <source media="(min-width:768px)" srcSet="/img/hero-red-desktop.webp" width="1920" height="1300" />
          <img src="/img/hero-red-mobile.webp" width="1000" height="1300" alt="" fetchpriority="high" />
        </picture>
        <PetalsBackground />

        <a
          className="cue"
          href="#about"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
          }}
          aria-label="Scroll to introduction"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M6 13l6 6 6-6" />
          </svg>
        </a>

        <div className="wrap">
          <div>
            <span className="eyebrow pill-eb">A self-reflection tool for eight humane values</span>
            <h1>
              <small>Test your</small>Humane<br />Quotient
            </h1>
            <p className="lead">
              How far has your care evolved — from caring for yourself, to caring for family and community, to caring for everyone? Discover your Humane Quotient and a path to grow it.
            </p>
            <div className="actions">
              <button className="btn gold" onClick={onStartTest}>
                Begin the test →
              </button>
              <button
                className="btn ghost"
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              >
                What is HuQ?
              </button>
            </div>
            <div className="facts">
              <div>
                <b>8</b>core humane values
              </div>
              <div>
                <b>96</b>reflective questions
              </div>
              <div>
                <b>~12</b>minutes
              </div>
            </div>
          </div>

          <div className="hero-art">
            <img
              src="/img/huq-flower-520.webp"
              srcSet="/img/huq-flower-520.webp 520w, /img/huq-flower-760.webp 760w, /img/huq-flower.webp 1000w"
              sizes="(max-width:639px) 78vw, (max-width:1023px) 56vw, 503px"
              width="1000"
              height="1000"
              fetchpriority="high"
              alt="The HuQ flower"
            />
          </div>
        </div>
      </section>

      <section id="about">
        <div className="wrap two">
          <div>
            <span className="eyebrow">Introduction</span>
            <h2>Our humaneness can be measured, nurtured and grown.</h2>
            <p className="lead">
              A <em>quotient</em> quantifies an attribute of a person — like IQ or EQ. The <b>Humane Quotient (HuQ)</b> evaluates how <em>humane</em> an individual is.
            </p>
            <p>
              Being <em>human</em> describes who we are. Being <em>humane</em> describes the quality of showing compassion and care for others. HuQ turns eight universal humane values into something you can reflect on, assess and work upon.
            </p>
            <div className="pillrow">
              <span className="pill">Self-reflection</span>
              <span className="pill">Questionnaire · Score · Action plan</span>
            </div>
          </div>

          <div className="card">
            <h3 className="serif" style={{ fontSize: '1.7rem', fontWeight: 600 }}>
              “Humaneness” — a definition
            </h3>
            <p className="serif" style={{ fontSize: '1.35rem', lineHeight: 1.4, margin: 0 }}>
              The quality of compassion or consideration for others. Cultivating humane qualities helps an individual evolve and find the true purpose of life — <em>oneness with everyone</em>.
            </p>
            <p style={{ margin: '1.1rem 0 0', color: '#6b3a33', fontSize: '.97rem' }}>
              The model rests on values that apply to everyone, regardless of culture, belief or background. In line with the ideal of One World One Family.
            </p>
          </div>
        </div>
      </section>

      <section id="care">
        <div className="wrap">
          <div style={{ maxWidth: '760px' }}>
            <span className="eyebrow">The core idea</span>
            <h2>The Evolution of Care</h2>
            <p className="lead">
              Like drops of water that begin in a small stream, flow into a river and finally merge into the ocean — the drops stay the same, but their form evolves. Care grows the same way: from Self-Care, to Socio-Care, to Universal Care.
            </p>
          </div>

          <div className="stream">
            <StreamSVG />
          </div>

          <div className="care">
            <div className="c c1">
              <div className="big">Stream</div>
              <h3>Self-Care</h3>
              <p>Care solely for the individual, with little or no regard for others.</p>
            </div>
            <div className="c c2">
              <div className="big">River</div>
              <h3>Socio-Care</h3>
              <p>Care for one’s family, friends and community with kindness and loyalty.</p>
            </div>
            <div className="c c3">
              <div className="big">Ocean</div>
              <h3>Universal Care</h3>
              <p>Care for all people with compassion, kindness and empathy.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="values">
        <div className="wrap">
          <div style={{ maxWidth: '760px' }}>
            <span className="eyebrow">The HuQ model</span>
            <h2>Eight core humane values</h2>
            <p className="lead">
              Five values — <b>Selflessness, Empathy, Integrity, Acceptance, Responsibility</b> — form the <b>Human Essence</b>. Three — <b>Equity, Diversity, Inclusivity</b> — are the practical lens for real-world interaction.
            </p>
          </div>

          <figure className="eqn" id="eqn">
            <div className="eqrow">
              <div className="eqc" role="group" aria-label="Human Essence">
                <span className="eqt">Human Essence</span>
                <div className="eqchips">
                  {values.slice(0, 5).map((v) => (
                    <span className="eqchip" key={v.key}>
                      <span className="eqi">
                        <ValueIcon name={v.key} size={20} />
                      </span>
                      <span>{v.name}</span>
                    </span>
                  ))}
                </div>
              </div>

              <span className="eqop" aria-hidden="true">+</span>

              <div className="eqc" role="group" aria-label="Equity, Diversity and Inclusivity">
                <span className="eqt">EDI</span>
                <div className="eqchips">
                  {values.slice(5).map((v) => (
                    <span className="eqchip" key={v.key}>
                      <span className="eqi">
                        <ValueIcon name={v.key} size={20} />
                      </span>
                      <span>{v.name}</span>
                    </span>
                  ))}
                </div>
              </div>

              <span className="eqop" aria-hidden="true">=</span>

              <div className="eqc eqh" role="group" aria-label="Humaneness">
                <span className="eqt">Humaneness</span>
                <img
                  src="/img/huq-mark.webp"
                  className="eqf"
                  width="130"
                  height="130"
                  loading="lazy"
                  alt=""
                  aria-hidden="true"
                />
                <p className="eqs">
                  Leading to the ideal of <b>One World One Family</b>
                </p>
              </div>
            </div>
            <figcaption>
              How the eight values are framed: the five values of the Human Essence, together with Equity, Diversity and Inclusivity (EDI), lead to Humaneness.
            </figcaption>
          </figure>
        </div>
      </section>

      <section id="explore" aria-labelledby="explore-heading">
        <div className="wrap">
          <div style={{ maxWidth: '760px' }}>
            <span className="eyebrow">Explore</span>
            <h2 id="explore-heading">Explore the eight values</h2>
          </div>

          <div className="vals">
            <div className="fl">
              <div className="fimg">
                <img
                  src="/img/huq-flower.webp"
                  width="1000"
                  height="1000"
                  loading="lazy"
                  alt=""
                  aria-hidden="true"
                />
                {hotspots.map((h) => (
                  <button
                    key={h.idx}
                    type="button"
                    className={`hs ${selectedIdx === h.idx ? 'on' : ''}`}
                    onClick={() => setSelectedIdx(h.idx)}
                    aria-label={h.label}
                    aria-pressed={selectedIdx === h.idx}
                    style={{ left: h.left, top: h.top }}
                  />
                ))}
              </div>
              <p className="hint">
                Each humane value becomes visible as a facet of One World One Family — Service, Compassion, Ethics, Harmony, Stewardship, Social Justice, Interconnectedness and Wholeness.
              </p>
            </div>

            <div className="detail">
              <span className={`tag ${selectedIdx > 4 ? 'edi' : ''}`}>
                {selectedValue.group}
              </span>
              <h3>{selectedValue.name}</h3>
              <div className="fc">
                {selectedValue.facet} · {selectedValue.code}
              </div>
              <div className="def">{selectedValue.definition}</div>
              <p>{selectedValue.facetText}</p>
              <div className="dots">
                {values.map((x, k) => (
                  <button
                    key={x.key}
                    type="button"
                    className={k === selectedIdx ? 'on' : ''}
                    onClick={() => setSelectedIdx(k)}
                    aria-label={x.name}
                    aria-pressed={k === selectedIdx}
                  >
                    {x.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how">
        <div className="wrap">
          <div style={{ maxWidth: '760px' }}>
            <span className="eyebrow">How it works</span>
            <h2>Eight steps. One profile.</h2>
          </div>

          <div className="steps3">
            <div className="card">
              <b className="n">1</b>
              <h3>Answer honestly</h3>
              <p>
                Eight short steps, one per value, twelve questions each. For every statement, choose how often it is true for you in a typical week — from <em>Almost Never</em> to <em>Almost Always</em>.
              </p>
            </div>
            <div className="card">
              <b className="n">2</b>
              <h3>Get your HuQ Profile</h3>
              <p>
                See your score for every quotient, your overall HuQ, your strongest value, and where each sits on the journey from Self-Care to Socio-Care to Universal Care.
              </p>
            </div>
            <div className="card">
              <b className="n">3</b>
              <h3>Grow with an action plan</h3>
              <p>
                Use your strongest value as a foundation to build the others, with practical steps ordered by where you can grow most.
              </p>
            </div>
          </div>

          <div className="note" style={{ marginTop: '34px' }}>
            HuQ is designed for honest <b>self-evaluation and personal growth</b>. HuQ is not for judging, comparing or labelling individuals.
          </div>

          <div style={{ textAlign: 'center', marginTop: '44px' }}>
            <button className="btn primary" onClick={onStartTest}>
              Take the Humane Quotient test →
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

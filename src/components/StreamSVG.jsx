import React from 'react';

export function StreamSVG() {
  const stops = ['#E0AC27', '#A8450F', '#850500'];
  let up = '';
  let dn = '';

  for (let x = 0; x <= 1100; x += 20) {
    const t = 125 + Math.sin(x / 150) * 22 - x * 0.03 - (x / 1100) * 14;
    up += (x ? 'L' : 'M') + x + ' ' + t.toFixed(1) + ' ';
  }
  for (let x = 1100; x >= 0; x -= 20) {
    const t = 125 + Math.sin(x / 150) * 22 - x * 0.03 + 34 + (x / 1100) * 36;
    dn += 'L' + x + ' ' + t.toFixed(1) + ' ';
  }

  const drops = Array.from({ length: 8 }, (_, i) => {
    const x = 80 + i * 135;
    const y = 142 + Math.sin(x / 150) * 22 - x * 0.03 + (x / 1100) * 11;
    return (
      <circle
        key={i}
        cx={x}
        cy={y.toFixed(1)}
        r={(4 + i * 1.1).toFixed(1)}
        fill="#FFFDE9"
        opacity="0.9"
      />
    );
  });

  return (
    <>
      <div className="stream-labels" aria-hidden="true">
        <span>Self-Care</span>
        <span>Socio-Care</span>
        <span>Universal Care</span>
      </div>
      <svg
        className="parallax"
        data-parallax
        viewBox="0 64 1100 130"
        role="img"
        aria-label="A stream widening into a river and then an ocean: care growing from Self-Care to Socio-Care to Universal Care"
      >
        <defs>
          <linearGradient id="stg" x1="0" x2="1">
            {stops.map((s, i) => (
              <stop key={i} offset={`${i * 50}%`} stopColor={s} />
            ))}
          </linearGradient>
        </defs>
        <path d={`${up}${dn}Z`} fill="url(#stg)" />
        {drops}
      </svg>
    </>
  );
}

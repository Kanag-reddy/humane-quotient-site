import React, { useEffect, useState } from 'react';

function petalPath(r0, L, w) {
  const d = L - r0;
  return `M0,${-r0} C${w},${-(r0 + d * 0.22)} ${w * 0.95},${-(r0 + d * 0.78)} 0,${-L} C${-w * 0.95},${-(r0 + d * 0.78)} ${-w},${-(r0 + d * 0.22)} 0,${-r0}Z`;
}

export function PetalsBackground() {
  const [paused, setPaused] = useState(() => document.visibilityState !== 'visible');

  useEffect(() => {
    const updateVisibility = () => setPaused(document.visibilityState !== 'visible');
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  const items = Array.from({ length: 9 }, (_, i) => {
    const left = 4 + ((i * 11.3) % 92);
    const size = 26 + ((i * 17) % 40);
    const dur = 18 + ((i * 5) % 9);
    const delay = -((i * 7) % 18);
    return (
      <svg
        key={i}
        className="pt-s"
        viewBox="-30 -60 60 70"
        style={{
          left: `${left}%`,
          width: `${size}px`,
          animationDuration: `${dur}s`,
          animationDelay: `${delay}s`
        }}
        aria-hidden="true"
      >
        <path
          d={petalPath(2, 54, 22)}
          fill={i % 3 ? '#FFFDE9' : '#E4D5CB'}
          fillOpacity={i % 2 ? 0.04 : 0.08}
        />
      </svg>
    );
  });

  return (
    <div className={`petals ${paused ? 'paused' : ''}`} aria-hidden="true">
      {items}
    </div>
  );
}

import React from 'react';

function petalPath(r0, L, w) {
  const d = L - r0;
  return `M0,${-r0} C${w},${-(r0 + d * 0.22)} ${w * 0.95},${-(r0 + d * 0.78)} 0,${-L} C${-w * 0.95},${-(r0 + d * 0.78)} ${-w},${-(r0 + d * 0.22)} 0,${-r0}Z`;
}

export function BudSVG({ isOpen = false }) {
  const outerPetals = Array.from({ length: 8 }, (_, i) => (
    <g key={`out-${i}`} transform={`rotate(${i * 45})`}>
      <path d={petalPath(44, 215, 68)} fill="#E4D5CB" fillOpacity="0.7" stroke="#D5BDAF" />
    </g>
  ));

  const innerPetals = Array.from({ length: 8 }, (_, i) => (
    <g key={`in-${i}`} transform={`rotate(${i * 45})`}>
      <path
        d={petalPath(44, 170, 50)}
        fill={i % 2 ? '#A8450F' : '#850500'}
        fillOpacity="0.95"
        stroke="#FFFDE9"
        strokeWidth="1"
      />
    </g>
  ));

  return (
    <svg
      className={`bud ${isOpen ? 'open' : ''}`}
      viewBox="-335 -335 670 670"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="bd-ring" r="262" fill="none" stroke="#E4D5CB" strokeDasharray="2 8" />
      <circle className="bd-rip" r="62" fill="none" stroke="#A8450F" strokeWidth="3" />
      <g className="bd-pet">
        {outerPetals}
        {innerPetals}
      </g>
      <g className="bd-c">
        <circle r="47" fill="#FFFDE9" stroke="#850500" strokeWidth="3" />
        <text
          y="9"
          textAnchor="middle"
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fontWeight="600"
          fontSize="30"
          fill="#850500"
        >
          HuQ
        </text>
      </g>
    </svg>
  );
}

import React from 'react';
import { values, levels, VALUE_MIN, VALUE_MAX } from '../data/huqData';

function petalPath(r0, L, w) {
  const d = L - r0;
  return `M0,${-r0} C${w},${-(r0 + d * 0.22)} ${w * 0.95},${-(r0 + d * 0.78)} 0,${-L} C${-w * 0.95},${-(r0 + d * 0.78)} ${-w},${-(r0 + d * 0.22)} 0,${-r0}Z`;
}

function polar(r, i) {
  const a = (i * Math.PI) / 4;
  return [r * Math.sin(a), -r * Math.cos(a)];
}

export function FlowerSVG({ result, onReplay, isBlooming = true }) {
  if (!result || !result.values) return null;

  const R0 = 44;
  const L1 = 215;

  return (
    <svg
      className={`bloom ${isBlooming ? 'go' : ''}`}
      viewBox="-335 -335 670 670"
      role="img"
      aria-label="Your HuQ flower showing your score for each of the eight quotients"
      onClick={onReplay}
      style={{ cursor: onReplay ? 'pointer' : 'default' }}
    >
      <title>Click to watch the flower bloom again</title>
      <circle className="bring" r="262" fill="none" stroke="#E4D5CB" strokeDasharray="2 8" />

      {/* Track petals */}
      {result.values.map((v, i) => (
        <g key={`track-${i}`} transform={`rotate(${i * 45})`}>
          <path
            className="bt"
            style={{ animationDelay: `${(i * 0.08).toFixed(2)}s` }}
            d={petalPath(R0, L1, 68)}
            fill="#E4D5CB"
            fillOpacity="0.55"
            stroke="#D5BDAF"
            strokeOpacity="0.6"
          />
        </g>
      ))}

      {/* Fill petals */}
      <g className="bsway">
        {result.values.map((v, i) => {
          const pct = Math.max(0, Math.min(1, (v.score - VALUE_MIN) / (VALUE_MAX - VALUE_MIN)));
          const len = R0 + (L1 - R0 - 6) * (0.1 + 0.9 * pct);
          const top = result.strongest.indexOf(v.key) > -1;
          const [sx, sy] = polar(R0 + (L1 - R0) * 0.55, i);

          return (
            <React.Fragment key={`fill-${i}`}>
              <g transform={`rotate(${i * 45})`}>
                <path
                  className="bp"
                  style={{ animationDelay: `${(i * 0.08).toFixed(2)}s` }}
                  d={petalPath(R0, len, 50)}
                  fill={levels[v.level].color}
                  fillOpacity="0.95"
                  stroke={top ? '#470500' : '#FFFDE9'}
                  strokeWidth={top ? 2.6 : 1}
                />
              </g>
              {top && (
                <g transform={`translate(${sx.toFixed(1)},${sy.toFixed(1)})`}>
                  <g className="bs" style={{ animationDelay: `${(i * 0.08).toFixed(2)}s` }}>
                    <path
                      transform="scale(1.5)"
                      d="M0,-9 2.6,-3 9,-2.5 4.2,1.8 5.6,8 0,4.7 -5.6,8 -4.2,1.8 -9,-2.5 -2.6,-3Z"
                      fill="#E0AC27"
                      stroke="#470500"
                      strokeWidth="1.2"
                    />
                  </g>
                </g>
              )}
            </React.Fragment>
          );
        })}
      </g>

      {/* Labels */}
      {result.values.map((v, i) => {
        const top = result.strongest.indexOf(v.key) > -1;
        let [lx, ly] = polar(252, i);
        if (i === 0) ly -= 14;
        if (i === 4) ly += 8;

        return (
          <g key={`lbl-${i}`} className="bl" style={{ animationDelay: `${(i * 0.08).toFixed(2)}s` }}>
            <text
              x={lx.toFixed(1)}
              y={(ly - 2).toFixed(1)}
              textAnchor="middle"
              className="flower-label"
              fontSize="13"
              fill="#470500"
            >
              {v.name.toUpperCase()}
              {top ? ' ★' : ''}
            </text>
            <text
              x={lx.toFixed(1)}
              y={(ly + 14).toFixed(1)}
              textAnchor="middle"
              fontFamily="Jost, sans-serif"
              fontSize="12"
              fontWeight="500"
              fill="#A27C3F"
            >
              {v.score}/60 · {(Math.round(v.quotient * 10) / 10).toFixed(1)}/10
            </text>
          </g>
        );
      })}

      {/* Centre badge */}
      <g className="bc">
        <circle r="47" fill="#FFFDE9" stroke="#850500" strokeWidth="3" />
        <text
          y="4"
          textAnchor="middle"
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fontWeight="600"
          fontSize="30"
          fill="#850500"
        >
          {(Math.round(result.huq * 10) / 10).toFixed(1)}
        </text>
        <text
          y="19"
          textAnchor="middle"
          fontFamily="Jost, sans-serif"
          fontWeight="600"
          fontSize="8"
          letterSpacing="1"
          fill="#470500"
        >
          HuQ / 10
        </text>
      </g>
    </svg>
  );
}

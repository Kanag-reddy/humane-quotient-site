import React from 'react';

const ICONS = {
  se: (
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
  ),
  em: (
    <>
      <circle cx="12" cy="12" r="2.4" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = (i * Math.PI) / 4;
        return (
          <circle
            key={i}
            cx={(12 + 8 * Math.sin(a)).toFixed(2)}
            cy={(12 - 8 * Math.cos(a)).toFixed(2)}
            r="1.5"
          />
        );
      })}
    </>
  ),
  in: (
    <>
      <path d="M12 3l7 3v5c0 5-3.2 8.2-7 10-3.8-1.8-7-5-7-10V6z" />
      <path d="M8.8 12l2.3 2.3L15.5 9.8" />
    </>
  ),
  ac: (
    <>
      <circle cx="9" cy="12" r="5.2" />
      <circle cx="15" cy="12" r="5.2" />
    </>
  ),
  re: (
    <>
      <circle cx="12" cy="7" r="2.3" />
      <circle cx="5.8" cy="9.5" r="2" />
      <circle cx="18.2" cy="9.5" r="2" />
      <path d="M3 18c3.2 3 15 3 18 0" />
      <path d="M8 14.5c1.2-1.2 2.4-1.6 4-1.6s2.8.4 4 1.6" />
    </>
  ),
  eq: (
    <>
      <path d="M12 4v16M7 20h10M5 7.5h14" />
      <path d="M5 7.5L2.6 13.5a2.6 2.6 0 0 0 4.8 0zM19 7.5l-2.4 6a2.6 2.6 0 0 0 4.8 0z" />
    </>
  ),
  di: (
    <>
      <path d="M12 3l9 9-9 9-9-9z" />
      <path d="M12 8l4 4-4 4-4-4z" />
    </>
  ),
  ic: (
    <>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18" />
    </>
  )
};

export function ValueIcon({ name, size = 22, color = 'currentColor', className = '' }) {
  const content = ICONS[name] || ICONS.se;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {content}
    </svg>
  );
}

export function UserIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function ShieldIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function DownloadIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export function MailIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

export function LogoutIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function SearchIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

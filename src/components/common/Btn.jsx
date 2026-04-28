// SPDX-License-Identifier: GPL-3.0-only

import { C, FONT } from '../../data/theme.js';

export const Btn = ({ onClick, children, variant = 'primary', disabled, full }) => {
  const styles = {
    primary: { bg: C.amber, fg: '#1a1814', border: C.amber, hover: '#e6b520' },
    secondary: { bg: 'transparent', fg: C.text, border: C.borderHi, hover: C.surface2 },
    danger: { bg: C.rust, fg: C.text, border: C.rust, hover: '#d66547' },
    ghost: { bg: 'transparent', fg: C.textDim, border: C.border, hover: C.surface },
  };
  const s = styles[variant];
  return (
    <button
      onClick={onClick} disabled={disabled}
      className={`${full ? 'w-full' : ''} px-4 py-2 text-sm tracking-wide transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
      style={{
        fontFamily: FONT, backgroundColor: s.bg, color: s.fg,
        border: `1px solid ${s.border}`, fontWeight: 500,
      }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.backgroundColor = s.hover)}
      onMouseLeave={(e) => !disabled && (e.currentTarget.style.backgroundColor = s.bg)}
    >
      {children}
    </button>
  );
};

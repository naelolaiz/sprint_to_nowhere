// SPDX-License-Identifier: GPL-3.0-only

// The company icon, transcribed verbatim from the trademark vector. Eighteen
// polygons total: three faces × six cubes (three big, three small). The
// coordinates have been normalized to a [0, 88] × [0, 78] local space; the
// outer scale fits the requested `width` to that. Callers position the
// element via translate.
export const InitechLogo = ({ width = 56, dim = false }) => {
  const intrinsicW = 88;
  const scale = width / intrinsicW;
  const teal  = dim ? '#5a8aa6' : '#A2DEF9';
  const dark  = dim ? '#1a1a1a' : '#000000';
  const light = dim ? '#9a9a9a' : '#E6E7E8';

  const polys = [
    // ----- big cube 1 (top center) -----
    { fill: teal,  pts: '43.518,0 63.626,13.709 43.518,27.417 23.41,13.709' },
    { fill: dark,  pts: '43.518,27.417 23.41,13.709 23.41,38.804 43.518,52.513' },
    { fill: light, pts: '63.626,13.709 43.518,27.417 43.518,52.513 63.626,38.804' },
    // ----- small cube 1 -----
    { fill: teal,  pts: '43.518,41.177 32.495,33.662 43.518,26.147 54.541,33.662' },
    { fill: dark,  pts: '43.518,26.147 54.541,33.662 54.541,19.904 43.518,12.389' },
    { fill: light, pts: '32.495,33.662 43.518,26.147 43.518,12.389 32.495,19.904' },
    // ----- big cube 2 (front right) -----
    { fill: teal,  pts: '67.03,24.56 87.139,38.269 67.03,51.977 46.924,38.269' },
    { fill: dark,  pts: '67.03,51.977 46.924,38.269 46.924,63.364 67.031,77.073' },
    { fill: light, pts: '87.139,38.269 67.03,51.977 67.031,77.073 87.139,63.364' },
    // ----- small cube 2 -----
    { fill: teal,  pts: '67.03,65.737 56.008,58.222 67.03,50.707 78.054,58.222' },
    { fill: dark,  pts: '67.03,50.707 78.054,58.221 78.054,44.464 67.03,36.949' },
    { fill: light, pts: '56.008,58.222 67.03,50.707 67.03,36.949 56.008,44.464' },
    // ----- big cube 3 (front left) -----
    { fill: teal,  pts: '20.107,24.56 40.215,38.269 20.107,51.977 0,38.269' },
    { fill: dark,  pts: '20.107,51.977 0,38.269 0,63.364 20.108,77.073' },
    { fill: light, pts: '40.215,38.269 20.107,51.977 20.108,77.073 40.215,63.364' },
    // ----- small cube 3 -----
    { fill: teal,  pts: '20.107,65.737 9.084,58.222 20.107,50.707 31.131,58.222' },
    { fill: dark,  pts: '20.107,50.707 31.131,58.221 31.131,44.464 20.107,36.949' },
    { fill: light, pts: '9.084,58.222 20.107,50.707 20.107,36.949 9.084,44.464' },
  ];

  return (
    <g transform={`scale(${scale})`}>
      {polys.map((p, i) => (
        <polygon key={i} points={p.pts} fill={p.fill}/>
      ))}
    </g>
  );
};

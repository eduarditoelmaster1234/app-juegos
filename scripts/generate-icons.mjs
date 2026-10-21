// Genera los iconos del launcher (legacy y adaptive) a partir del emblema
// de la corona de GANAMOS. Ejecutar con: node scripts/generate-icons.mjs
import { Resvg } from '@resvg/resvg-js';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const res = path.join(root, 'android/app/src/main/res');

const CROWN = `
  <path d="M2 19h20" />
  <path d="M4 19l1-12 5 6 4-9 4 9 5-6 1 12H4z" fill="#FFFFFF" fill-opacity="0.28" />
  <circle cx="5" cy="7" r="1.5" fill="#FFFFFF" stroke="none" />
  <circle cx="10" cy="13" r="1.5" fill="#FFFFFF" stroke="none" />
  <circle cx="14" cy="4" r="1.5" fill="#FFFFFF" stroke="none" />
  <circle cx="18" cy="13" r="1.5" fill="#FFFFFF" stroke="none" />
  <circle cx="23" cy="7" r="1.5" fill="#FFFFFF" stroke="none" />
`;

const crownGroup = (scale, tx, ty) => `
  <g transform="translate(${tx} ${ty}) scale(${scale})"
     fill="none" stroke="#FFFFFF" stroke-width="2.2"
     stroke-linecap="round" stroke-linejoin="round"
     filter="url(#shadow)">
    ${CROWN}
  </g>
`;

const defs = `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#8B5CF6" />
      <stop offset="0.55" stop-color="#6D28D9" />
      <stop offset="1" stop-color="#2E0A5E" />
    </linearGradient>
    <radialGradient id="glow" cx="0.28" cy="0.16" r="0.85">
      <stop offset="0" stop-color="#DDD6FE" stop-opacity="0.5" />
      <stop offset="1" stop-color="#DDD6FE" stop-opacity="0" />
    </radialGradient>
    <filter id="shadow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="7" stdDeviation="9" flood-color="#1B0636" flood-opacity="0.45" />
    </filter>
    <clipPath id="clip">
      <rect width="512" height="512" rx="112" />
    </clipPath>
    <clipPath id="clipRound">
      <circle cx="256" cy="256" r="256" />
    </clipPath>
  </defs>
`;

const iconSvg = (round) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    ${defs}
    <g clip-path="url(#${round ? 'clipRound' : 'clip'})">
      <rect width="512" height="512" fill="url(#bg)" />
      <rect width="512" height="512" fill="url(#glow)" />
    </g>
    ${crownGroup(11, 118.5, 135)}
  </svg>
`;

const foregroundSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="108" height="108" viewBox="0 0 108 108">
    ${defs}
    ${crownGroup(2.2, 26.5, 29.8)}
  </svg>
`;

function render(svg, size, file) {
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    background: 'rgba(0,0,0,0)',
  })
    .render()
    .asPng();
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, png);
  console.log(`✓ ${path.relative(root, file)} (${size}px)`);
}

const densities = {
  mdpi: 1,
  hdpi: 1.5,
  xhdpi: 2,
  xxhdpi: 3,
  xxxhdpi: 4,
};

for (const [density, factor] of Object.entries(densities)) {
  const dir = path.join(res, `mipmap-${density}`);
  const legacySize = Math.round(48 * factor);
  const foregroundSize = Math.round(108 * factor);
  render(iconSvg(false), legacySize, path.join(dir, 'ic_launcher.png'));
  render(iconSvg(true), legacySize, path.join(dir, 'ic_launcher_round.png'));
  render(foregroundSvg, foregroundSize, path.join(dir, 'ic_launcher_foreground.png'));
}

console.log('Iconos generados.');

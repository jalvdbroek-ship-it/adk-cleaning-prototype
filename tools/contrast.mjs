// WCAG-contrast voor de ADK-tokens. Draai: node tools/contrast.mjs
const clamp = (v) => Math.min(1, Math.max(0, v));
function oklch([L, C, H]) {
  const h = (H * Math.PI) / 180, a = C * Math.cos(h), b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map(clamp);
}
const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
const ratio = (a, b) => { const x = lum(oklch(a)), y = lum(oklch(b)); const [h, l] = x > y ? [x, y] : [y, x]; return (h + 0.05) / (l + 0.05); };
const T = {
  kozijn: [0.24, 0.012, 235], kozijn2: [0.32, 0.014, 235],
  glas: [0.975, 0.006, 215], spiegel: [0.93, 0.022, 220],
  staal: [0.46, 0.022, 235], glaskant: [0.46, 0.075, 190], glaskantLicht: [0.80, 0.09, 185],
  signaal: [0.74, 0.17, 55], signaalHover: [0.80, 0.16, 62],
  mist: [0.86, 0.015, 225],
};
const pairs = [
  ['kozijn op glas (body)', 'kozijn', 'glas', 4.5], ['kozijn op spiegel', 'kozijn', 'spiegel', 4.5],
  ['staal op glas (secundair)', 'staal', 'glas', 4.5], ['staal op spiegel', 'staal', 'spiegel', 4.5],
  ['glaskant op glas (link)', 'glaskant', 'glas', 4.5], ['glaskant op spiegel', 'glaskant', 'spiegel', 4.5],
  ['kozijn op signaal (CTA)', 'kozijn', 'signaal', 4.5], ['kozijn op signaalHover', 'kozijn', 'signaalHover', 4.5],
  ['glas op kozijn (donker vlak)', 'glas', 'kozijn', 4.5], ['mist op kozijn (secundair donker)', 'mist', 'kozijn', 4.5],
  ['glaskantLicht op kozijn', 'glaskantLicht', 'kozijn', 4.5], ['signaal op kozijn (rand/icoon)', 'signaal', 'kozijn', 3],
  ['glas op kozijn2', 'glas', 'kozijn2', 4.5],
];
let bad = 0;
for (const [n, f, b, min] of pairs) { const r = ratio(T[f], T[b]); const ok = r >= min; if (!ok) bad++; console.log(`${ok ? 'OK ' : 'FAIL'} ${r.toFixed(2)}  (min ${min})  ${n}`); }
process.exit(bad ? 1 : 0);

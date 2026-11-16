// Pre-generated visual sample frames for Demo Mode
// Works 100% offline, guaranteed instant fallback if camera is unavailable

function createDemoFrameSvg(emoji, label, variant, bg) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" viewBox="0 0 160 120">
    <rect width="160" height="120" fill="${bg}"/>
    <rect x="6" y="6" width="148" height="108" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" stroke-dasharray="4 4"/>
    <circle cx="80" cy="55" r="30" fill="rgba(255,255,255,0.15)"/>
    <text x="80" y="66" font-size="34" text-anchor="middle" font-family="sans-serif">${emoji}</text>
    <rect x="10" y="92" width="140" height="20" rx="4" fill="rgba(0,0,0,0.5)"/>
    <text x="80" y="106" font-size="9" font-weight="bold" fill="#F7F3EA" text-anchor="middle" font-family="monospace">${label} #${variant}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getDemoExamples(preset) {
  const classA = preset.classA;
  const classB = preset.classB;

  const bgA = '#253B4E';
  const bgB = '#1C4242';

  const examplesA = [1, 2, 3, 4, 5, 6].map((i) => ({
    id: `demo-a-${i}`,
    classId: 'classA',
    className: classA.name,
    icon: classA.icon,
    dataUrl: createDemoFrameSvg(classA.icon, classA.name, i, bgA),
    timestamp: Date.now() - (10 - i) * 1000,
    variation: i <= 3 ? 'Standard pose' : 'Angled / Lighting variation',
    isDemo: true
  }));

  const examplesB = [1, 2, 3, 4, 5, 6].map((i) => ({
    id: `demo-b-${i}`,
    classId: 'classB',
    className: classB.name,
    icon: classB.icon,
    dataUrl: createDemoFrameSvg(classB.icon, classB.name, i, bgB),
    timestamp: Date.now() - (6 - i) * 1000,
    variation: i <= 3 ? 'Standard pose' : 'Angled / Lighting variation',
    isDemo: true
  }));

  return { examplesA, examplesB };
}

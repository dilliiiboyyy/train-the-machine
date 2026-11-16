/**
 * Demo Exemplars for in-browser exhibition simulation
 * Supports: Standing, Sitting, Walking, Clapping, Waving, Open Hand, Fist
 */

function generateStandingPose(v = 0) {
  return [
    { x: 0.5, y: 0.18 + v, score: 0.95, name: 'nose' },
    { x: 0.48, y: 0.16 + v, score: 0.9, name: 'left_eye' },
    { x: 0.52, y: 0.16 + v, score: 0.9, name: 'right_eye' },
    { x: 0.45, y: 0.17 + v, score: 0.9, name: 'left_ear' },
    { x: 0.55, y: 0.17 + v, score: 0.9, name: 'right_ear' },
    { x: 0.42, y: 0.3 + v, score: 0.95, name: 'left_shoulder' },
    { x: 0.58, y: 0.3 + v, score: 0.95, name: 'right_shoulder' },
    { x: 0.38, y: 0.44 + v, score: 0.9, name: 'left_elbow' },
    { x: 0.62, y: 0.44 + v, score: 0.9, name: 'right_elbow' },
    { x: 0.36, y: 0.58 + v, score: 0.9, name: 'left_wrist' },
    { x: 0.64, y: 0.58 + v, score: 0.9, name: 'right_wrist' },
    { x: 0.44, y: 0.6 + v, score: 0.95, name: 'left_hip' },
    { x: 0.56, y: 0.6 + v, score: 0.95, name: 'right_hip' },
    { x: 0.44, y: 0.78 + v, score: 0.95, name: 'left_knee' },
    { x: 0.56, y: 0.78 + v, score: 0.95, name: 'right_knee' },
    { x: 0.44, y: 0.94 + v, score: 0.9, name: 'left_ankle' },
    { x: 0.56, y: 0.94 + v, score: 0.9, name: 'right_ankle' }
  ];
}

function generateSittingPose(v = 0) {
  return [
    { x: 0.5, y: 0.26 + v, score: 0.95, name: 'nose' },
    { x: 0.48, y: 0.24 + v, score: 0.9, name: 'left_eye' },
    { x: 0.52, y: 0.24 + v, score: 0.9, name: 'right_eye' },
    { x: 0.45, y: 0.25 + v, score: 0.9, name: 'left_ear' },
    { x: 0.55, y: 0.25 + v, score: 0.9, name: 'right_ear' },
    { x: 0.41, y: 0.38 + v, score: 0.95, name: 'left_shoulder' },
    { x: 0.59, y: 0.38 + v, score: 0.95, name: 'right_shoulder' },
    { x: 0.37, y: 0.52 + v, score: 0.9, name: 'left_elbow' },
    { x: 0.63, y: 0.52 + v, score: 0.9, name: 'right_elbow' },
    { x: 0.42, y: 0.64 + v, score: 0.9, name: 'left_wrist' },
    { x: 0.58, y: 0.64 + v, score: 0.9, name: 'right_wrist' },
    { x: 0.42, y: 0.66 + v, score: 0.95, name: 'left_hip' },
    { x: 0.58, y: 0.66 + v, score: 0.95, name: 'right_hip' },
    { x: 0.38, y: 0.68 + v, score: 0.9, name: 'left_knee' },
    { x: 0.62, y: 0.68 + v, score: 0.9, name: 'right_knee' },
    { x: 0.39, y: 0.86 + v, score: 0.85, name: 'left_ankle' },
    { x: 0.61, y: 0.86 + v, score: 0.85, name: 'right_ankle' }
  ];
}

function generateWavingPose(v = 0) {
  return [
    { x: 0.5, y: 0.18 + v, score: 0.95, name: 'nose' },
    { x: 0.48, y: 0.16 + v, score: 0.9, name: 'left_eye' },
    { x: 0.52, y: 0.16 + v, score: 0.9, name: 'right_eye' },
    { x: 0.45, y: 0.17 + v, score: 0.9, name: 'left_ear' },
    { x: 0.55, y: 0.17 + v, score: 0.9, name: 'right_ear' },
    { x: 0.42, y: 0.3 + v, score: 0.95, name: 'left_shoulder' },
    { x: 0.58, y: 0.3 + v, score: 0.95, name: 'right_shoulder' },
    { x: 0.38, y: 0.44 + v, score: 0.9, name: 'left_elbow' },
    { x: 0.68, y: 0.28 + v, score: 0.95, name: 'right_elbow' },
    { x: 0.36, y: 0.58 + v, score: 0.9, name: 'left_wrist' },
    { x: 0.72 + v, y: 0.14, score: 0.95, name: 'right_wrist' },
    { x: 0.44, y: 0.6 + v, score: 0.95, name: 'left_hip' },
    { x: 0.56, y: 0.6 + v, score: 0.95, name: 'right_hip' },
    { x: 0.44, y: 0.78 + v, score: 0.95, name: 'left_knee' },
    { x: 0.56, y: 0.78 + v, score: 0.95, name: 'right_knee' },
    { x: 0.44, y: 0.94 + v, score: 0.9, name: 'left_ankle' },
    { x: 0.56, y: 0.94 + v, score: 0.9, name: 'right_ankle' }
  ];
}

function generateClappingPose(v = 0) {
  return [
    { x: 0.5, y: 0.2 + v, score: 0.95, name: 'nose' },
    { x: 0.48, y: 0.18 + v, score: 0.9, name: 'left_eye' },
    { x: 0.52, y: 0.18 + v, score: 0.9, name: 'right_eye' },
    { x: 0.45, y: 0.19 + v, score: 0.9, name: 'left_ear' },
    { x: 0.55, y: 0.19 + v, score: 0.9, name: 'right_ear' },
    { x: 0.42, y: 0.32 + v, score: 0.95, name: 'left_shoulder' },
    { x: 0.58, y: 0.32 + v, score: 0.95, name: 'right_shoulder' },
    { x: 0.45, y: 0.46 + v, score: 0.9, name: 'left_elbow' },
    { x: 0.55, y: 0.46 + v, score: 0.9, name: 'right_elbow' },
    // Wrists touching right in front of chest
    { x: 0.49, y: 0.45 + v, score: 0.95, name: 'left_wrist' },
    { x: 0.51, y: 0.45 + v, score: 0.95, name: 'right_wrist' },
    { x: 0.44, y: 0.62 + v, score: 0.95, name: 'left_hip' },
    { x: 0.56, y: 0.62 + v, score: 0.95, name: 'right_hip' },
    { x: 0.44, y: 0.78 + v, score: 0.9, name: 'left_knee' },
    { x: 0.56, y: 0.78 + v, score: 0.9, name: 'right_knee' },
    { x: 0.44, y: 0.94 + v, score: 0.9, name: 'left_ankle' },
    { x: 0.56, y: 0.94 + v, score: 0.9, name: 'right_ankle' }
  ];
}

function generateWalkingPose(v = 0) {
  // Stride position with knees/ankles apart
  return [
    { x: 0.5 + v, y: 0.2, score: 0.95, name: 'nose' },
    { x: 0.48 + v, y: 0.18, score: 0.9, name: 'left_eye' },
    { x: 0.52 + v, y: 0.18, score: 0.9, name: 'right_eye' },
    { x: 0.45 + v, y: 0.19, score: 0.9, name: 'left_ear' },
    { x: 0.55 + v, y: 0.19, score: 0.9, name: 'right_ear' },
    { x: 0.42 + v, y: 0.32, score: 0.95, name: 'left_shoulder' },
    { x: 0.58 + v, y: 0.32, score: 0.95, name: 'right_shoulder' },
    { x: 0.36 + v, y: 0.46, score: 0.9, name: 'left_elbow' },
    { x: 0.64 + v, y: 0.46, score: 0.9, name: 'right_elbow' },
    { x: 0.32 + v, y: 0.54, score: 0.9, name: 'left_wrist' },
    { x: 0.68 + v, y: 0.54, score: 0.9, name: 'right_wrist' },
    { x: 0.44 + v, y: 0.62, score: 0.95, name: 'left_hip' },
    { x: 0.56 + v, y: 0.62, score: 0.95, name: 'right_hip' },
    { x: 0.38 + v, y: 0.76, score: 0.95, name: 'left_knee' },
    { x: 0.60 + v, y: 0.80, score: 0.95, name: 'right_knee' },
    { x: 0.34 + v, y: 0.92, score: 0.9, name: 'left_ankle' },
    { x: 0.64 + v, y: 0.95, score: 0.9, name: 'right_ankle' }
  ];
}

function createDemoSvg(label, emoji, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" viewBox="0 0 160 120">
    <rect width="160" height="120" fill="#18324A"/>
    <circle cx="80" cy="50" r="32" fill="${color}" opacity="0.2"/>
    <text x="80" y="58" font-size="34" text-anchor="middle">${emoji}</text>
    <text x="80" y="98" font-family="monospace" font-weight="bold" font-size="11" fill="#F7F3EA" text-anchor="middle">${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getPoseDemoData(classes) {
  const result = {};

  classes.forEach((cls) => {
    const list = [];
    const count = 5;
    const nameUpper = cls.name.toUpperCase();

    for (let i = 0; i < count; i++) {
      const v = (i - 2) * 0.02;
      let landmarks;
      let handData = null;

      if (nameUpper.includes('WAVE')) {
        landmarks = generateWavingPose(v);
        handData = { gesture: 'OPEN_HAND', density: 0.48 };
      } else if (nameUpper.includes('CLAP')) {
        landmarks = generateClappingPose(v);
      } else if (nameUpper.includes('OPEN') || nameUpper.includes('PALM')) {
        landmarks = generateStandingPose(v);
        handData = { gesture: 'OPEN_HAND', density: 0.45 };
      } else if (nameUpper.includes('FIST')) {
        landmarks = generateStandingPose(v);
        handData = { gesture: 'FIST', density: 0.75 };
      } else {
        landmarks = generateStandingPose(v);
      }

      list.push({
        id: `demo-${cls.id}-${i}-${Date.now()}`,
        poseLandmarks: landmarks,
        primaryHand: handData,
        hasPerson: true,
        hasFullBody: true,
        hasHands: !!handData,
        dataUrl: createDemoSvg(cls.name, cls.icon, cls.color || '#E67E42')
      });
    }

    result[cls.id] = list;
  });

  return result;
}

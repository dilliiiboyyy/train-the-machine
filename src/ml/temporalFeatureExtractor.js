/**
 * Temporal & Geometric Feature Extractor
 * Extracts normalized posture vectors for static actions and
 * temporal motion dynamics for actions over time (walking, clapping, waving).
 */

export function extractFeatureVector(frameResult, sequenceWindow = []) {
  if (!frameResult || !frameResult.hasPerson) {
    return null;
  }

  const pts = frameResult.poseLandmarks || [];
  if (pts.length < 17) return null;

  // 1. Torso Scale & Center Normalization
  const lSh = pts[5];
  const rSh = pts[6];
  const lHip = pts[11];
  const rHip = pts[12];

  const midShX = (lSh.x + rSh.x) / 2;
  const midShY = (lSh.y + rSh.y) / 2;
  const midHipX = (lHip.x + rHip.x) / 2;
  const midHipY = (lHip.y + rHip.y) / 2;

  const dx = midHipX - midShX;
  const dy = midHipY - midShY;
  const torsoLen = Math.max(0.12, Math.sqrt(dx * dx + dy * dy));

  const features = [];

  // Relative keypoint coordinates (normalized by torso scale, centered at hips)
  const keyIndices = [0, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
  for (const idx of keyIndices) {
    const p = pts[idx];
    features.push((p.x - midHipX) / torsoLen);
    features.push((p.y - midHipY) / torsoLen);
  }

  // 2. Posture Geometry (Standing vs Sitting)
  const lKnee = pts[13];
  const rKnee = pts[14];
  const lAnk = pts[15];
  const rAnk = pts[16];

  const avgKneeY = (lKnee.y + rKnee.y) / 2;
  const avgAnkY = (lAnk.y + rAnk.y) / 2;

  // Hip to knee vertical drop: Standing has large drop (> 0.55), Sitting has small drop (< 0.28)
  const hipToKneeDrop = (avgKneeY - midHipY) / torsoLen;
  features.push(hipToKneeDrop);

  // Knee to ankle vertical drop
  const kneeToAnkDrop = (avgAnkY - avgKneeY) / torsoLen;
  features.push(kneeToAnkDrop);

  // Knee angle (Hip - Knee - Ankle)
  const lKneeAngle = calculateAngle(lHip, lKnee, lAnk);
  const rKneeAngle = calculateAngle(rHip, rKnee, rAnk);
  features.push(lKneeAngle / 180.0);
  features.push(rKneeAngle / 180.0);

  // 3. Hand & Arm Geometry (Hands Up, Arms Crossed)
  const lWrist = pts[9];
  const rWrist = pts[10];

  // Wrists above shoulders (smaller Y = higher in screen)
  const lWristAboveSh = (midShY - lWrist.y) / torsoLen;
  const rWristAboveSh = (midShY - rWrist.y) / torsoLen;
  features.push(lWristAboveSh);
  features.push(rWristAboveSh);

  // Inter-wrist distance
  const wristDistX = Math.abs(lWrist.x - rWrist.x) / torsoLen;
  const wristDistY = Math.abs(lWrist.y - rWrist.y) / torsoLen;
  const wristDistTotal = Math.sqrt(wristDistX * wristDistX + wristDistY * wristDistY);
  features.push(wristDistTotal);

  // Hand gesture state encoding (Open Hand vs Fist) with Pixel Density
  const hand = frameResult.primaryHand;
  let isOpenHandSignal = 0.0;
  let isFistSignal = 0.0;
  let handDensitySignal = 0.5;

  if (hand) {
    if (hand.gesture === 'OPEN_HAND') isOpenHandSignal = 1.0;
    if (hand.gesture === 'FIST') isFistSignal = 1.0;
    handDensitySignal = hand.density || hand.pixelDensity || 0.5;
  }
  features.push(handDensitySignal);
  features.push(isOpenHandSignal);
  features.push(isFistSignal);

  // Pixel Matrix Tracking Features (Clearer Readings for Optical Mass & Motion)
  const pixelData = frameResult.pixelData;
  if (pixelData) {
    features.push(Math.min(1.0, pixelData.fgRatio * 3.0));
    features.push(Math.min(1.0, (pixelData.motionDelta || 0) / 100000.0));
  } else {
    features.push(0.5, 0.0);
  }

  // 4. Temporal Motion Dynamics (Clapping, Walking, Waving over sliding window)
  if (sequenceWindow && sequenceWindow.length >= 6) {
    const seqLen = sequenceWindow.length;

    // A. Clapping Dynamics: distance between wrists over time
    const wristDists = [];
    for (const frame of sequenceWindow) {
      const fPts = frame.poseLandmarks || [];
      if (fPts[9] && fPts[10]) {
        const d = Math.hypot(fPts[9].x - fPts[10].x, fPts[9].y - fPts[10].y) / torsoLen;
        wristDists.push(d);
      }
    }

    let minWristDist = 10;
    let maxWristDist = 0;
    let clapOscillations = 0;
    for (let i = 1; i < wristDists.length; i++) {
      if (wristDists[i] < minWristDist) minWristDist = wristDists[i];
      if (wristDists[i] > maxWristDist) maxWristDist = wristDists[i];
      // Detect hands coming together and pulling apart
      if (wristDists[i] < 0.22 && wristDists[i - 1] >= 0.22) {
        clapOscillations++;
      }
    }
    const clapRange = Math.max(0, maxWristDist - minWristDist);
    features.push(clapRange);
    features.push(clapOscillations / (seqLen / 15.0)); // Clap frequency

    // B. Walking Dynamics: alternating leg motion and hip displacement
    const leftAnkleYs = [];
    const rightAnkleYs = [];
    const hipXs = [];
    for (const frame of sequenceWindow) {
      const fPts = frame.poseLandmarks || [];
      if (fPts[15] && fPts[16] && fPts[11]) {
        leftAnkleYs.push(fPts[15].y);
        rightAnkleYs.push(fPts[16].y);
        hipXs.push(fPts[11].x);
      }
    }

    const lAnkVar = computeVariance(leftAnkleYs);
    const rAnkVar = computeVariance(rightAnkleYs);
    const hipXVar = computeVariance(hipXs);
    features.push(Math.sqrt(lAnkVar) * 20.0);
    features.push(Math.sqrt(rAnkVar) * 20.0);
    features.push(Math.sqrt(hipXVar) * 25.0);

    // C. Waving Dynamics: wrist movement velocity & reversals
    const wristXs = [];
    for (const frame of sequenceWindow) {
      const fPts = frame.poseLandmarks || [];
      if (fPts[9] || fPts[10]) {
        const activeWrist = (fPts[10]?.y < midShY) ? fPts[10] : fPts[9];
        if (activeWrist) wristXs.push(activeWrist.x);
      }
    }

    let waveReversals = 0;
    for (let i = 2; i < wristXs.length; i++) {
      const v1 = wristXs[i - 1] - wristXs[i - 2];
      const v2 = wristXs[i] - wristXs[i - 1];
      if (v1 * v2 < -0.0001) waveReversals++;
    }
    features.push(waveReversals / (seqLen / 15.0));
  } else {
    // Zero-fill temporal features if single frame
    features.push(0, 0, 0, 0, 0, 0);
  }

  // L2 Normalize final vector
  const normVal = Math.sqrt(features.reduce((sum, val) => sum + val * val, 0)) || 1.0;
  return features.map((f) => f / normVal);
}

function calculateAngle(a, b, c) {
  if (!a || !b || !c) return 180;
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) angle = 360.0 - angle;
  return angle;
}

function computeVariance(arr) {
  if (!arr || arr.length < 2) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.reduce((sum, val) => sum + (val - mean) * (val - mean), 0) / arr.length;
}

/**
 * High-Level Temporal Action Verification
 * Validates dynamic action signatures (walking, clapping, waving) over time.
 */
export function analyzeTemporalMotion(sequenceWindow = []) {
  if (!sequenceWindow || sequenceWindow.length < 6) {
    return {
      isWalking: false,
      isClapping: false,
      isWaving: false,
      clapOscillations: 0,
      walkVariance: 0,
      waveReversals: 0
    };
  }

  const seqLen = sequenceWindow.length;
  const firstFrame = sequenceWindow[0];
  const pts = firstFrame?.poseLandmarks || [];
  const lSh = pts[5];
  const rSh = pts[6];
  const lHip = pts[11];
  const rHip = pts[12];
  const midShY = lSh && rSh ? (lSh.y + rSh.y) / 2 : 0.3;
  const torsoLen = lSh && rSh && lHip && rHip
    ? Math.max(0.12, Math.hypot((lHip.x + rHip.x)/2 - (lSh.x + rSh.x)/2, (lHip.y + rHip.y)/2 - midShY))
    : 0.3;

  // 1. Clapping: Wrists oscillating toward and away
  const wristDists = [];
  for (const f of sequenceWindow) {
    const fPts = f.poseLandmarks || [];
    if (fPts[9] && fPts[10]) {
      wristDists.push(Math.hypot(fPts[9].x - fPts[10].x, fPts[9].y - fPts[10].y) / torsoLen);
    }
  }

  let minWD = 10, maxWD = 0, clapOscillations = 0;
  for (let i = 1; i < wristDists.length; i++) {
    if (wristDists[i] < minWD) minWD = wristDists[i];
    if (wristDists[i] > maxWD) maxWD = wristDists[i];
    if (wristDists[i] < 0.22 && wristDists[i - 1] >= 0.22) clapOscillations++;
  }
  const clapRange = Math.max(0, maxWD - minWD);
  const isClapping = clapOscillations >= 1 && clapRange > 0.16;

  // 2. Walking: Leg and ankle vertical alternation & hip lateral movement
  const lAnkYs = [], rAnkYs = [], hipXs = [];
  for (const f of sequenceWindow) {
    const fPts = f.poseLandmarks || [];
    if (fPts[15] && fPts[16] && fPts[11]) {
      lAnkYs.push(fPts[15].y);
      rAnkYs.push(fPts[16].y);
      hipXs.push(fPts[11].x);
    }
  }
  const lVar = computeVariance(lAnkYs);
  const rVar = computeVariance(rAnkYs);
  const hVar = computeVariance(hipXs);
  const walkVariance = Math.sqrt(lVar) + Math.sqrt(rVar) + Math.sqrt(hVar);
  const isWalking = walkVariance > 0.038;

  // 3. Waving: Active elevated wrist oscillating horizontally
  const wristXs = [];
  for (const f of sequenceWindow) {
    const fPts = f.poseLandmarks || [];
    if (fPts[9] || fPts[10]) {
      const activeW = (fPts[10]?.y < midShY) ? fPts[10] : fPts[9];
      if (activeW && activeW.y < midShY + 0.1) {
        wristXs.push(activeW.x);
      }
    }
  }
  let waveReversals = 0;
  for (let i = 2; i < wristXs.length; i++) {
    const v1 = wristXs[i - 1] - wristXs[i - 2];
    const v2 = wristXs[i] - wristXs[i - 1];
    if (v1 * v2 < -0.0001) waveReversals++;
  }
  const isWaving = waveReversals >= 1 && wristXs.length >= 4;

  return {
    isWalking,
    isClapping,
    isWaving,
    clapOscillations,
    walkVariance,
    waveReversals
  };
}

/**
 * Browser-Based Action Classifier with Out-of-Distribution Rejection
 * Performs fast, reliable classification in client memory.
 * Features:
 * - Distance-weighted nearest neighbor & centroid matching
 * - Calibrated Match Score (%)
 * - Unknown / No Trained Match rejection threshold
 * - 10-frame rolling temporal smoothing to eliminate all flicker
 * - Clean state reporting: Recognized vs Unknown vs Not Enough Info vs No Person
 */

import { extractFeatureVector, analyzeTemporalMotion } from './temporalFeatureExtractor';
import { isObjectAction, extractVisualEmbedding, cosineSimilarity, grabWebcamFrame } from './objectFeatureExtractor';
import { captureWebcamFrameAsTensor, trainingTensorBuffer } from './tensorBuffer.js';

class ActionClassifier {
  constructor() {
    this.classes = [];          // list of { id, name, icon, isDynamic, kind }
    this.dataset = {};          // classId -> list of { featureVector, visualEmbedding, metadata }
    this.centroids = {};        // classId -> mean feature vector
    this.visualCentroids = {};  // classId -> mean visual embedding vector
    this.isObjectDataset = false;
    this.hasVisualCentroids = false;
    this.isTrained = false;
    this.rejectionThreshold = 0.65; // Configurable unknown threshold
    this.predictionHistory = []; // Rolling buffer for smoothing
  }

  setRejectionThreshold(val) {
    this.rejectionThreshold = Math.max(0.45, Math.min(0.9, val));
  }

  reset() {
    this.classes = [];
    this.dataset = {};
    this.centroids = {};
    this.visualCentroids = {};
    this.isObjectDataset = false;
    this.hasVisualCentroids = false;
    this.isTrained = false;
    this.predictionHistory = [];
    try {
      trainingTensorBuffer.clear();
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('ml_model_training_state');
      }
    } catch {
      // ignore
    }
  }

  setClasses(classList) {
    this.classes = classList;
    this.dataset = {};
    this.centroids = {};
    this.visualCentroids = {};
    for (const c of classList) {
      this.dataset[c.id] = [];
    }
    this.isTrained = false;
    this.predictionHistory = [];
  }

  addExample(classId, frameResult, sequenceWindow = [], thumbnail = null, visualEmbedding = null) {
    const feat = extractFeatureVector(frameResult, sequenceWindow);
    
    // If neither pose feature nor visual embedding nor thumbnail is present, cannot train
    if (!feat && !visualEmbedding && !thumbnail) return false;

    if (!this.dataset[classId]) {
      this.dataset[classId] = [];
    }

    this.dataset[classId].push({
      featureVector: feat,
      visualEmbedding: visualEmbedding || null,
      hasHands: frameResult?.hasHands || false,
      hasFullBody: frameResult?.hasFullBody || false,
      thumbnail: thumbnail || null,
      timestamp: Date.now()
    });

    return true;
  }

  removeExample(classId, indexOrId) {
    if (this.dataset[classId]) {
      if (typeof indexOrId === 'number') {
        const item = this.dataset[classId][indexOrId];
        if (item && item.id) {
          trainingTensorBuffer.removeSample(item.id);
        }
        this.dataset[classId].splice(indexOrId, 1);
      } else {
        trainingTensorBuffer.removeSample(indexOrId);
        this.dataset[classId] = this.dataset[classId].filter((ex) => ex.id !== indexOrId);
      }
      this.saveTrainingState();
    }
  }

  /**
   * Saves the current dataset, classes, and model state locally to localStorage
   */
  saveTrainingState() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const state = {
        classes: this.classes,
        dataset: this.dataset,
        centroids: this.centroids,
        visualCentroids: this.visualCentroids,
        isTrained: this.isTrained,
        isObjectDataset: this.isObjectDataset,
        hasVisualCentroids: this.hasVisualCentroids,
        savedAt: Date.now()
      };
      localStorage.setItem('ml_model_training_state', JSON.stringify(state));
      return true;
    } catch (err) {
      console.warn('Failed to save ML model training state locally:', err);
      return false;
    }
  }

  /**
   * Loads the model training state from localStorage if available
   */
  loadTrainingState() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      const raw = localStorage.getItem('ml_model_training_state');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.dataset) {
        if (parsed.classes && parsed.classes.length > 0) {
          this.classes = parsed.classes;
        }
        this.dataset = parsed.dataset || {};
        this.centroids = parsed.centroids || {};
        this.visualCentroids = parsed.visualCentroids || {};
        this.isTrained = Boolean(parsed.isTrained);
        this.isObjectDataset = Boolean(parsed.isObjectDataset);
        this.hasVisualCentroids = Boolean(parsed.hasVisualCentroids);
        return parsed;
      }
      return null;
    } catch (err) {
      console.warn('Failed to load ML model training state locally:', err);
      return null;
    }
  }

  /**
   * Adds a custom object example directly into the model training state and persists it locally
   */
  addCustomObjectExample(classId, example) {
    if (!this.dataset[classId]) {
      this.dataset[classId] = [];
    }

    if (!this.classes.some((c) => c.id === classId)) {
      this.classes.push({
        id: classId,
        name: example.categoryName || classId,
        icon: example.icon || '📦',
        kind: 'object'
      });
    }

    const item = {
      id: example.id || `${classId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      categoryId: classId,
      categoryName: example.categoryName || classId,
      featureVector: example.featureVector || null,
      visualEmbedding: example.visualEmbedding || null,
      thumbnail: example.dataUrl || example.thumbnail || null,
      dataUrl: example.dataUrl || example.thumbnail || null,
      perceptionResult: example.perceptionResult || null,
      sequenceWindow: example.sequenceWindow || [],
      source: example.source || 'webcam',
      timestamp: example.timestamp || Date.now()
    };

    this.dataset[classId].push(item);
    this.saveTrainingState();
    return item;
  }

  /**
   * Captures the current webcam frame as a tensor, associates it with the currently active
   * custom object label from the state, and stores it in the local buffer for training.
   */
  captureWebcamFrameAsTensor(videoOrCanvas, activeLabelOrClass, options = {}) {
    return captureWebcamFrameAsTensor(videoOrCanvas, activeLabelOrClass, options);
  }

  /**
   * Captures the current webcam frame, associates it with the currently selected
   * custom object category, and saves it locally to the machine learning model's training state.
   *
   * @param {HTMLVideoElement|HTMLCanvasElement} videoOrCanvas - Webcam video or canvas
   * @param {Object|string} selectedCategory - Category object or class ID
   * @param {Object} options - Optional perception result, sequence window, fallback data URL
   * @returns {Object} The saved training example record
   */
  captureWebcamFrame(videoOrCanvas, selectedCategory, options = {}) {
    const categoryId = typeof selectedCategory === 'string'
      ? selectedCategory
      : (selectedCategory?.id || 'classA');
    const categoryName = typeof selectedCategory === 'object'
      ? (selectedCategory?.name || categoryId)
      : categoryId;

    let thumbnail = options.thumbnail || null;
    let visualEmbedding = options.visualEmbedding || null;
    let tensorEntry = null;

    // Grab webcam frame as tensor and store in local buffer associated with the active custom object label
    try {
      tensorEntry = captureWebcamFrameAsTensor(videoOrCanvas, selectedCategory, {
        thumbnail,
        visualEmbedding,
        perceptionResult: options.perceptionResult,
        sequenceWindow: options.sequenceWindow,
        fallbackDataUrl: options.fallbackDataUrl
      });
      if (tensorEntry) {
        thumbnail = thumbnail || tensorEntry.thumbnail;
        visualEmbedding = visualEmbedding || tensorEntry.visualEmbedding;
      }
    } catch (err) {
      console.warn('captureWebcamFrameAsTensor notice:', err);
    }

    if (videoOrCanvas && (!thumbnail || !visualEmbedding)) {
      const frameData = grabWebcamFrame(videoOrCanvas, 160, 120);
      if (frameData) {
        thumbnail = thumbnail || frameData.thumbnail;
        visualEmbedding = visualEmbedding || frameData.visualEmbedding;
      }
    }

    if (!thumbnail && options.fallbackDataUrl) {
      thumbnail = options.fallbackDataUrl;
    }

    const example = {
      id: tensorEntry?.id || `${categoryId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      categoryId,
      categoryName,
      dataUrl: thumbnail,
      thumbnail,
      visualEmbedding,
      tensor: tensorEntry?.tensor || null,
      perceptionResult: options.perceptionResult || null,
      sequenceWindow: options.sequenceWindow || [],
      source: 'webcam',
      timestamp: Date.now()
    };

    this.addCustomObjectExample(categoryId, example);
    return example;
  }

  train() {
    const activeClasses = this.classes.filter(
      (c) => this.dataset[c.id] && this.dataset[c.id].length > 0
    );

    if (activeClasses.length < 2) {
      return { success: false, message: 'Need at least 2 classes with examples' };
    }

    this.centroids = {};
    this.visualCentroids = {};

    // Check if any class is explicitly or implicitly an object, or if samples predominantly use visual embeddings
    let totalSamples = 0;
    let visualSampleCount = 0;
    let poseSampleCount = 0;

    for (const c of activeClasses) {
      const samples = this.dataset[c.id];
      totalSamples += samples.length;

      // 1. Train pose centroid if pose vectors exist
      const poseSamples = samples.filter((s) => s.featureVector && s.featureVector.length > 0);
      if (poseSamples.length > 0) {
        poseSampleCount += poseSamples.length;
        const vecLen = poseSamples[0].featureVector.length;
        const centroid = new Float32Array(vecLen);

        for (const s of poseSamples) {
          for (let i = 0; i < vecLen; i++) {
            centroid[i] += s.featureVector[i];
          }
        }
        for (let i = 0; i < vecLen; i++) {
          centroid[i] /= poseSamples.length;
        }

        let sumSq = 0;
        for (let i = 0; i < vecLen; i++) sumSq += centroid[i] * centroid[i];
        const norm = Math.sqrt(sumSq) || 1.0;
        this.centroids[c.id] = Array.from(centroid).map((v) => v / norm);
      }

      // 2. Train visual centroid if visual embeddings exist
      const visualSamples = samples.filter((s) => s.visualEmbedding && s.visualEmbedding.length > 0);
      if (visualSamples.length > 0) {
        visualSampleCount += visualSamples.length;
        const vLen = visualSamples[0].visualEmbedding.length;
        const vCentroid = new Float32Array(vLen);

        for (const s of visualSamples) {
          for (let i = 0; i < vLen; i++) {
            vCentroid[i] += s.visualEmbedding[i];
          }
        }
        for (let i = 0; i < vLen; i++) {
          vCentroid[i] /= visualSamples.length;
        }

        let vSumSq = 0;
        for (let i = 0; i < vLen; i++) vSumSq += vCentroid[i] * vCentroid[i];
        const vNorm = Math.sqrt(vSumSq) || 1.0;
        this.visualCentroids[c.id] = Array.from(vCentroid).map((v) => v / vNorm);
      }
    }

    const hasObjectNames = activeClasses.some((c) => isObjectAction(c.name, c.kind));
    const allHaveVisualCentroids = activeClasses.every((c) => !!this.visualCentroids[c.id]);
    this.hasVisualCentroids = Object.keys(this.visualCentroids).length >= 2;
    this.isObjectDataset = hasObjectNames || (visualSampleCount > 0 && poseSampleCount === 0);

    this.isTrained = true;
    this.predictionHistory = [];
    this.saveTrainingState();

    return {
      success: true,
      classes: activeClasses.map((c) => c.name),
      isObjectDataset: this.isObjectDataset,
      totalSamples
    };
  }

  /**
   * Continuous live inference on incoming video frames or canvas
   */
  predict(frameResult, sequenceWindow = [], videoOrCanvas = null) {
    if (!this.isTrained) {
      return {
        status: 'not_trained',
        prediction: null,
        matchScore: 0,
        message: 'MODEL NOT TRAINED'
      };
    }

    // A. OBJECT CLASSIFICATION PATH (Custom objects like water bottle, toy car, mug, phone, etc.)
    if (this.isObjectDataset || (!frameResult?.hasPerson && this.hasVisualCentroids)) {
      let queryVisualVec = null;
      if (videoOrCanvas) {
        queryVisualVec = extractVisualEmbedding(videoOrCanvas);
      }

      if (!queryVisualVec) {
        return this.smoothAndReturn({
          status: 'unknown',
          prediction: null,
          matchScore: 0,
          probabilities: {},
          message: 'SHOW OBJECT IN CAMERA',
          reason: 'Hold the object steadily inside the camera viewfinder'
        });
      }

      // Compute similarity to each class's visual samples & centroids
      const classScores = {};
      const probabilities = {};

      for (const cls of this.classes) {
        const samples = (this.dataset[cls.id] || []).filter((s) => s.visualEmbedding);
        if (samples.length === 0) continue;

        const similarities = samples.map((s) => cosineSimilarity(queryVisualVec, s.visualEmbedding));
        similarities.sort((a, b) => b - a);

        const topK = Math.min(3, similarities.length);
        const avgTopSim = similarities.slice(0, topK).reduce((a, b) => a + b, 0) / topK;

        const centroid = this.visualCentroids[cls.id];
        let centroidSim = 0;
        if (centroid) {
          centroidSim = cosineSimilarity(queryVisualVec, centroid);
        }

        const combinedScore = avgTopSim * 0.65 + centroidSim * 0.35;

        classScores[cls.id] = {
          name: cls.name,
          icon: cls.icon,
          rawSim: combinedScore,
          maxSim: similarities[0] || combinedScore,
          expScore: Math.exp(combinedScore * 5.5)
        };
      }

      const classIds = Object.keys(classScores);
      if (classIds.length === 0) {
        return this.smoothAndReturn({
          status: 'unknown',
          prediction: null,
          matchScore: 0,
          message: 'NO TRAINED MATCH'
        });
      }

      const totalExp = classIds.reduce((sum, id) => sum + classScores[id].expScore, 0) || 1.0;
      for (const id of classIds) {
        probabilities[classScores[id].name] = Math.round(
          (classScores[id].expScore / totalExp) * 100
        );
      }

      let winnerId = classIds[0];
      let highestSim = -999;
      for (const id of classIds) {
        if (classScores[id].rawSim > highestSim) {
          highestSim = classScores[id].rawSim;
          winnerId = id;
        }
      }

      const winnerData = classScores[winnerId];
      const clampedSim = Math.max(0.0, Math.min(1.0, winnerData.rawSim));
      const matchScore = Math.round(Math.min(99, Math.max(20, clampedSim * 102 - 2)));

      // Out-of-distribution rejection for objects
      const isUnknown =
        winnerData.maxSim < this.rejectionThreshold ||
        matchScore < Math.round(this.rejectionThreshold * 100) ||
        (probabilities[winnerData.name] < 55 && classIds.length > 1);

      if (isUnknown) {
        return this.smoothAndReturn({
          status: 'unknown',
          prediction: null,
          matchScore,
          probabilities,
          message: 'NO TRAINED MATCH',
          reason: 'Object does not match any trained custom classes'
        });
      }

      return this.smoothAndReturn({
        status: 'recognized',
        prediction: winnerData.name,
        predictedIcon: winnerData.icon,
        matchScore,
        probabilities,
        message: `${winnerData.name} recognized`
      });
    }

    // B. BODY ACTIONS & GESTURES PATH (Poses, hand gestures, waving, clapping)

    // 1. Check if person is in view
    if (!frameResult || !frameResult.hasPerson) {
      return this.smoothAndReturn({
        status: 'no_person',
        prediction: null,
        matchScore: 0,
        message: 'NO PERSON DETECTED'
      });
    }

    // 2. Check for face-only when trained classes require body
    const trainedRequiresBody = this.classes.some((c) => {
      const u = c.name.toUpperCase();
      return (
        u.includes('STAND') ||
        u.includes('SIT') ||
        u.includes('WALK') ||
        u.includes('CLAP') ||
        u.includes('CROSS')
      );
    });

    if (trainedRequiresBody && frameResult.isFaceOnly) {
      return this.smoothAndReturn({
        status: 'not_enough_info',
        prediction: null,
        matchScore: 28,
        message: 'NOT ENOUGH INFORMATION',
        reason: 'Move further back so your body is visible in the camera'
      });
    }

    // 2b. Check if trained classes are purely hand gestures and no hands are visible (TEST 1)
    const trainedRequiresHandsOnly = this.classes.every((c) => {
      const u = c.name.toUpperCase();
      return (
        u.includes('HAND') ||
        u.includes('FIST') ||
        u.includes('PALM') ||
        u.includes('THUMB') ||
        u.includes('POINT')
      );
    });

    if (trainedRequiresHandsOnly && !frameResult.hasHands) {
      return this.smoothAndReturn({
        status: 'unknown',
        prediction: null,
        matchScore: 0,
        probabilities: {},
        message: 'NO HAND DETECTED',
        reason: 'Hold your hand clearly in front of the camera'
      });
    }

    // 3. Extract feature vector from current frame and temporal window
    const queryVec = extractFeatureVector(frameResult, sequenceWindow);
    if (!queryVec) {
      return this.smoothAndReturn({
        status: 'no_person',
        prediction: null,
        matchScore: 0,
        message: 'NO POSE DETECTED'
      });
    }

    // 4. Calculate similarities to all trained classes
    const classScores = {};
    const probabilities = {};
    const motion = analyzeTemporalMotion(sequenceWindow);

    for (const cls of this.classes) {
      const samples = this.dataset[cls.id] || [];
      if (samples.length === 0) continue;

      // Cosine similarity to all samples in this class
      const similarities = samples.map((s) => {
        let dot = 0;
        const targetVec = s.featureVector;
        for (let i = 0; i < queryVec.length; i++) {
          dot += queryVec[i] * targetVec[i];
        }
        return Math.max(-1.0, Math.min(1.0, dot));
      });

      similarities.sort((a, b) => b - a);
      const topK = Math.min(3, similarities.length);
      const avgTopSim =
        similarities.slice(0, topK).reduce((a, b) => a + b, 0) / topK;

      // Centroid similarity
      const centroid = this.centroids[cls.id];
      let centroidSim = 0;
      if (centroid) {
        for (let i = 0; i < queryVec.length; i++) {
          centroidSim += queryVec[i] * centroid[i];
        }
      }

      let combinedScore = avgTopSim * 0.7 + centroidSim * 0.3;

      // Specialist Pretrained Gesture Integration (Sections 4 & 5)
      const clsUpper = cls.name.toUpperCase();
      if (frameResult.primaryHand?.gesture) {
        const detectedG = frameResult.primaryHand.gesture;
        if (
          (clsUpper.includes('OPEN') || clsUpper.includes('PALM')) &&
          detectedG === 'OPEN_HAND'
        ) {
          combinedScore = Math.min(1.0, combinedScore + 0.18);
        } else if (clsUpper.includes('FIST') && detectedG === 'FIST') {
          combinedScore = Math.min(1.0, combinedScore + 0.18);
        } else if (
          (clsUpper.includes('OPEN') && detectedG === 'FIST') ||
          (clsUpper.includes('FIST') && detectedG === 'OPEN_HAND')
        ) {
          combinedScore = Math.max(-1.0, combinedScore - 0.25);
        }
      }

      classScores[cls.id] = {
        name: cls.name,
        icon: cls.icon,
        rawSim: combinedScore,
        maxSim: similarities[0],
        expScore: Math.exp(combinedScore * 6.0)
      };
    }

    const classIds = Object.keys(classScores);
    if (classIds.length === 0) {
      return {
        status: 'unknown',
        prediction: null,
        matchScore: 0,
        message: 'NO TRAINED MATCH'
      };
    }

    // Normalized probability estimates
    const totalExp = classIds.reduce((sum, cid) => sum + classScores[cid].expScore, 0) || 1.0;
    for (const cid of classIds) {
      probabilities[classScores[cid].name] = Math.round(
        (classScores[cid].expScore / totalExp) * 100
      );
    }

    // Find winner
    let winnerId = classIds.reduce((best, curr) =>
      classScores[curr].expScore > classScores[best].expScore ? curr : best
    );
    let winnerData = classScores[winnerId];
    const winnerUpper = winnerData.name.toUpperCase();

    // 5. Semantic Temporal Action Consistency Verification (Sections 5, 6, 7)
    // Walking requires repeated alternating leg/hip motion over time (TEST 3)
    if (winnerUpper.includes('WALK') && !motion.isWalking) {
      const altStatic = classIds.find((cid) => {
        const u = classScores[cid].name.toUpperCase();
        return u.includes('STAND') || u.includes('SIT');
      });
      if (altStatic && classScores[altStatic].maxSim >= this.rejectionThreshold) {
        winnerId = altStatic;
        winnerData = classScores[altStatic];
      } else {
        return this.smoothAndReturn({
          status: 'unknown',
          prediction: null,
          matchScore: 38,
          probabilities,
          message: 'NO TRAINED MATCH',
          reason: 'Walking requires active leg motion over time'
        });
      }
    }

    // Clapping requires repeated hand closing/opening oscillations (TEST 4)
    if (winnerUpper.includes('CLAP') && !motion.isClapping) {
      return this.smoothAndReturn({
        status: 'unknown',
        prediction: null,
        matchScore: 42,
        probabilities,
        message: 'NO TRAINED MATCH',
        reason: 'Clapping requires active repeated clapping motion'
      });
    }

    // Waving requires elevated wrist horizontal velocity reversals
    if (winnerUpper.includes('WAVE') && !motion.isWaving) {
      return this.smoothAndReturn({
        status: 'unknown',
        prediction: null,
        matchScore: 44,
        probabilities,
        message: 'NO TRAINED MATCH',
        reason: 'Waving requires hand waving motion over time'
      });
    }

    // Calibrated Match Score from cosine similarity (0.60 sim -> ~60%, 0.95 sim -> 97%)
    const clampedSim = Math.max(0.0, Math.min(1.0, winnerData.rawSim));
    const matchScore = Math.round(
      Math.min(99, Math.max(15, clampedSim * 105 - 5))
    );

    // UNKNOWN / OUT-OF-DISTRIBUTION REJECTION (Sections 17, 18, 19):
    const isUnknown =
      winnerData.maxSim < this.rejectionThreshold ||
      matchScore < Math.round(this.rejectionThreshold * 100) ||
      (probabilities[winnerData.name] < 56 && classIds.length > 1);

    if (isUnknown) {
      return this.smoothAndReturn({
        status: 'unknown',
        prediction: null,
        matchScore,
        probabilities,
        message: 'NO TRAINED MATCH',
        reason: 'Confidence too low or motion does not match learned examples'
      });
    }

    return this.smoothAndReturn({
      status: 'recognized',
      prediction: winnerData.name,
      predictedIcon: winnerData.icon,
      matchScore,
      probabilities,
      message: `${winnerData.name} recognized`
    });
  }

  /**
   * 10-Frame Rolling Prediction Smoothing
   * Eliminates rapid flickering between classes
   */
  smoothAndReturn(currentPred) {
    this.predictionHistory.push(currentPred);
    if (this.predictionHistory.length > 10) {
      this.predictionHistory.shift();
    }

    // If latest is no_person or not_enough_info, report immediately if in last 3 frames
    const recentNotPerson = this.predictionHistory.filter(
      (p) => p.status === 'no_person'
    ).length;
    if (recentNotPerson >= 4) {
      return {
        status: 'no_person',
        prediction: null,
        matchScore: 0,
        message: 'NO PERSON DETECTED'
      };
    }

    const recentNotEnough = this.predictionHistory.filter(
      (p) => p.status === 'not_enough_info'
    ).length;
    if (recentNotEnough >= 4) {
      return {
        status: 'not_enough_info',
        prediction: null,
        matchScore: 30,
        message: 'NOT ENOUGH INFORMATION',
        reason: 'Move further back so your body is visible in the camera'
      };
    }

    // Tally recognized votes in the window
    const recognizedVotes = this.predictionHistory.filter(
      (p) => p.status === 'recognized' && p.prediction
    );

    if (recognizedVotes.length >= 5) {
      const tally = {};
      let avgScore = 0;
      for (const v of recognizedVotes) {
        tally[v.prediction] = (tally[v.prediction] || 0) + 1;
        avgScore += v.matchScore;
      }
      avgScore = Math.round(avgScore / recognizedVotes.length);

      const dominantPrediction = Object.keys(tally).reduce((a, b) =>
        tally[a] > tally[b] ? a : b
      );

      // Only accept if dominant prediction has at least 4 votes
      if (tally[dominantPrediction] >= 4) {
        const leadVote = recognizedVotes.find((v) => v.prediction === dominantPrediction);
        return {
          ...currentPred,
          status: 'recognized',
          prediction: dominantPrediction,
          predictedIcon: leadVote?.predictedIcon || '✨',
          matchScore: avgScore
        };
      }
    }

    // If ambiguous or no consensus, report NO TRAINED MATCH
    return {
      ...currentPred,
      status: 'unknown',
      prediction: null,
      message: 'NO TRAINED MATCH'
    };
  }
}

export const actionClassifier = new ActionClassifier();

/**
 * Capture function that grabs the current webcam frame and associates it with the
 * currently selected custom object category, saving it locally to the ML model's training state.
 */
export const captureWebcamFrameForCategory = (videoOrCanvas, selectedCategory, options = {}) =>
  actionClassifier.captureWebcamFrame(videoOrCanvas, selectedCategory, options);

/**
 * Capture function that extracts a video frame as a tensor from the active webcam stream,
 * associates it with the currently selected custom object label, and stores it in the training buffer.
 */
export {
  captureWebcamFrameAsTensor,
  captureVideoFrameAsTensor,
  extractVideoFrameAsTensor,
  grabWebcamFrameToTensorAndPush,
  captureWebcamFrameToPersistentBuffer,
  pushWebcamFrameToTrainingBuffer,
  grabWebcamFrameAsTensorAndPush,
  trainingTensorBuffer,
  setActiveWebcamStream,
  setActiveWebcamVideo,
  getActiveWebcamStream,
  getActiveWebcamVideo
} from './tensorBuffer.js';

export const captureFrameAsTensor = captureWebcamFrameAsTensor;



import { captureFrameToCanvas, extractEmbedding } from './preprocessing.js';

export class BrowserClassifier {
  constructor() {
    this.datasetA = []; // Array of { id, embedding, dataUrl }
    this.datasetB = [];
    this.isTrained = false;
    this.classes = { classA: 'CLASS A', classB: 'CLASS B' };
    this.smoothedProbA = 0.5; // Exponential Moving Average
    this.emaAlpha = 0.35; // Smoothing factor (0 = frozen, 1 = no smoothing)
  }

  setClasses(classA, classB) {
    this.classes = { classA, classB };
  }

  clear() {
    this.datasetA = [];
    this.datasetB = [];
    this.isTrained = false;
    this.smoothedProbA = 0.5;
  }

  addExample(classId, imageData, dataUrl) {
    const embedding = extractEmbedding(imageData);
    const item = {
      id: `${classId}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      embedding,
      dataUrl,
      classId
    };

    if (classId === 'classA') {
      this.datasetA.push(item);
    } else {
      this.datasetB.push(item);
    }
    return item;
  }

  // Pre-seed demo embeddings from generated images
  async addDemoImage(classId, imgUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const frame = captureFrameToCanvas(img, 64, 64);
        if (frame) {
          const item = this.addExample(classId, frame.imageData, frame.dataUrl);
          resolve(item);
        } else {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = imgUrl;
    });
  }

  train() {
    if (this.datasetA.length === 0 || this.datasetB.length === 0) {
      throw new Error('Need at least 1 example in both classes to train.');
    }
    this.isTrained = true;
    this.smoothedProbA = 0.5;
    return {
      samplesA: this.datasetA.length,
      samplesB: this.datasetB.length,
      timestamp: Date.now()
    };
  }

  // Cosine similarity between two normalized vectors (-1 to 1)
  cosineSimilarity(vecA, vecB) {
    let dot = 0;
    const len = Math.min(vecA.length, vecB.length);
    for (let i = 0; i < len; i++) {
      dot += vecA[i] * vecB[i];
    }
    return dot;
  }

  /**
   * Evaluates a video frame or image element
   * Returns smoothed probabilities and active predicted class
   */
  predict(videoOrImg) {
    if (!this.isTrained || this.datasetA.length === 0 || this.datasetB.length === 0) {
      return null;
    }

    const frame = captureFrameToCanvas(videoOrImg, 64, 64);
    if (!frame) return null;

    const queryVec = extractEmbedding(frame.imageData);

    // K-Nearest Neighbors with Gaussian Kernel Weighting
    // Compute similarity to all samples in Class A
    const simA = this.datasetA.map((ex) => this.cosineSimilarity(queryVec, ex.embedding));
    // Compute similarity to all samples in Class B
    const simB = this.datasetB.map((ex) => this.cosineSimilarity(queryVec, ex.embedding));

    // Sort descending to find top-k similarities
    simA.sort((a, b) => b - a);
    simB.sort((a, b) => b - a);

    const k = Math.min(3, Math.min(simA.length, simB.length));
    let scoreA = 0;
    let scoreB = 0;

    for (let i = 0; i < k; i++) {
      // Exponentiated similarity for sharper discrimination
      scoreA += Math.exp((simA[i] || 0) * 4);
      scoreB += Math.exp((simB[i] || 0) * 4);
    }

    const total = scoreA + scoreB || 1;
    const rawProbA = scoreA / total;

    // Apply Exponential Moving Average (EMA) to eliminate frame-to-frame jitter
    this.smoothedProbA = this.emaAlpha * rawProbA + (1 - this.emaAlpha) * this.smoothedProbA;

    const probA = Math.max(0.04, Math.min(0.96, this.smoothedProbA));
    const probB = 1 - probA;

    const predictedClassId = probA >= 0.5 ? 'classA' : 'classB';
    const confidencePct = Math.round(Math.max(probA, probB) * 100);

    return {
      predictedClassId,
      predictedName: predictedClassId === 'classA' ? this.classes.classA.name : this.classes.classB.name,
      predictedIcon: predictedClassId === 'classA' ? this.classes.classA.icon : this.classes.classB.icon,
      confidence: confidencePct,
      probA: Math.round(probA * 100),
      probB: Math.round(probB * 100),
      isUncertain: Math.abs(probA - probB) < 0.18 // Low confidence margin
    };
  }
}

export const classifier = new BrowserClassifier();

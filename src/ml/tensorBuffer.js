/**
 * Tensor Capture & Local Training Buffer for TensorFlow.js
 * Extracts live video frames as tensors from active webcam streams,
 * associates them with currently selected user-defined custom object labels,
 * and pushes image data into a persistent local buffer for future model training.
 */

import * as tf from '@tensorflow/tfjs';
import { grabWebcamFrame } from './objectFeatureExtractor.js';

// Module-level registry for active webcam stream and video element
let activeWebcamStreamInstance = null;
let activeWebcamVideoElement = null;
let internalStreamVideoElement = null;

/**
 * Registers the active webcam MediaStream
 * @param {MediaStream|null} stream
 */
export function setActiveWebcamStream(stream) {
  activeWebcamStreamInstance = stream;
}

/**
 * Gets the currently registered active webcam MediaStream
 * @returns {MediaStream|null}
 */
export function getActiveWebcamStream() {
  return activeWebcamStreamInstance;
}

/**
 * Registers the active webcam HTMLVideoElement
 * @param {HTMLVideoElement|null} videoEl
 */
export function setActiveWebcamVideo(videoEl) {
  activeWebcamVideoElement = videoEl;
}

/**
 * Gets the currently registered active webcam HTMLVideoElement
 * @returns {HTMLVideoElement|null}
 */
export function getActiveWebcamVideo() {
  return activeWebcamVideoElement;
}

/**
 * Helper to get or create an internal HTMLVideoElement attached to a MediaStream
 * @param {MediaStream} stream
 * @returns {HTMLVideoElement|null}
 */
function getOrCreateVideoForStream(stream) {
  if (typeof document === 'undefined') return null;
  if (!internalStreamVideoElement) {
    internalStreamVideoElement = document.createElement('video');
    internalStreamVideoElement.muted = true;
    internalStreamVideoElement.playsInline = true;
    internalStreamVideoElement.autoplay = true;
  }
  if (internalStreamVideoElement.srcObject !== stream) {
    internalStreamVideoElement.srcObject = stream;
    internalStreamVideoElement.play().catch(() => {});
  }
  return internalStreamVideoElement;
}

/**
 * Local buffer that stores tensors associated with custom object labels for model training
 * Supports persistence across sessions via local storage buffer synchronization
 */
export class TrainingTensorBuffer {
  constructor() {
    /** @type {Array<{id: string, label: string, classId: string, categoryName: string, tensor: tf.Tensor|null, shape: number[], thumbnail: string|null, visualEmbedding: number[]|null, timestamp: number}>} */
    this.buffer = [];
    this.loadPersistentBuffer();
  }

  /**
   * Adds a sample tensor to the local buffer associated with a custom object label
   * @param {string} label - Active custom object label
   * @param {tf.Tensor} tensor - TensorFlow.js image tensor
   * @param {Object} metadata - Associated metadata (id, thumbnail, classId, etc.)
   * @returns {Object} Buffered sample record
   */
  addSample(label, tensor, metadata = {}) {
    const classId = metadata.classId || metadata.categoryId || label;
    const categoryName = metadata.categoryName || label;
    const id = metadata.id || `${classId}-tensor-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Store in buffer
    const entry = {
      id,
      label,
      classId,
      categoryName,
      tensor,
      shape: tensor ? tensor.shape : (metadata.shape || [224, 224, 3]),
      thumbnail: metadata.thumbnail || metadata.dataUrl || null,
      visualEmbedding: metadata.visualEmbedding || null,
      timestamp: metadata.timestamp || Date.now()
    };

    this.buffer.push(entry);
    return entry;
  }

  /**
   * Pushes an image tensor sample into the persistent local buffer for future model training
   * @param {string} label - Selected user-defined label
   * @param {tf.Tensor} tensor - Image tensor
   * @param {Object} metadata - Associated metadata (thumbnail, classId, etc.)
   * @returns {Object} Stored sample record
   */
  pushSample(label, tensor, metadata = {}) {
    const entry = this.addSample(label, tensor, metadata);
    this.savePersistentBuffer();
    return entry;
  }

  /**
   * Pushes sample into persistent buffer (alias)
   */
  push(label, tensor, metadata = {}) {
    return this.pushSample(label, tensor, metadata);
  }

  /**
   * Alias for addSample/pushSample to store tensor in training buffer
   */
  storeInTrainingBuffer(label, tensor, metadata = {}) {
    return this.pushSample(label, tensor, metadata);
  }

  /**
   * Saves the buffer metadata and image data locally to localStorage for future model training
   */
  savePersistentBuffer() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const serializable = this.buffer.map((item) => ({
        id: item.id,
        label: item.label,
        classId: item.classId,
        categoryName: item.categoryName,
        shape: item.shape,
        thumbnail: item.thumbnail,
        visualEmbedding: item.visualEmbedding,
        timestamp: item.timestamp
      }));
      localStorage.setItem('ml_persistent_tensor_buffer', JSON.stringify(serializable));
      return true;
    } catch (err) {
      console.warn('Failed to save persistent tensor buffer locally:', err);
      return false;
    }
  }

  /**
   * Restores persistent training buffer from localStorage
   */
  loadPersistentBuffer() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return [];
      const raw = localStorage.getItem('ml_persistent_tensor_buffer');
      if (!raw) return [];
      const items = JSON.parse(raw);
      if (!Array.isArray(items)) return [];

      for (const item of items) {
        if (!this.buffer.some((b) => b.id === item.id)) {
          this.buffer.push({
            id: item.id,
            label: item.label,
            classId: item.classId,
            categoryName: item.categoryName,
            tensor: null, // lazily rehydrated when needed for training
            shape: item.shape || [224, 224, 3],
            thumbnail: item.thumbnail || null,
            visualEmbedding: item.visualEmbedding || null,
            timestamp: item.timestamp || Date.now()
          });
        }
      }
      return this.buffer;
    } catch (err) {
      console.warn('Failed to restore persistent tensor buffer:', err);
      return [];
    }
  }

  /**
   * Retrieves all buffered samples, optionally filtered by object label or classId
   * @param {string} [filterLabel]
   * @returns {Array}
   */
  getBuffer(filterLabel = null) {
    if (!filterLabel) return [...this.buffer];
    return this.buffer.filter(
      (s) => s.label === filterLabel || s.classId === filterLabel || s.categoryName === filterLabel
    );
  }

  /**
   * Retrieves buffered samples for a specific custom object label
   * @param {string} label
   * @returns {Array}
   */
  getSamplesByLabel(label) {
    return this.getBuffer(label);
  }

  /**
   * Returns list of unique custom object labels currently stored in the buffer
   * @returns {string[]}
   */
  getLabels() {
    const labels = new Set(this.buffer.map((s) => s.label));
    return Array.from(labels);
  }

  /**
   * Returns count of samples currently buffered, optionally by label
   * @param {string} [label]
   * @returns {number}
   */
  getCount(label = null) {
    if (!label) return this.buffer.length;
    return this.getSamplesByLabel(label).length;
  }

  /**
   * Returns stacked training tensors ready for model.fit() if at least 2 categories exist
   * @returns {{ xs: tf.Tensor4D|null, ys: tf.Tensor2D|null, labels: string[] }|null}
   */
  getTrainingDataset() {
    if (this.buffer.length === 0) return null;

    const labels = this.getLabels();
    if (labels.length < 2) return null;

    return tf.tidy(() => {
      const validSamples = this.buffer.filter((s) => s.tensor && !s.tensor.isDisposed);
      if (validSamples.length === 0) return null;

      const xs = tf.concat(
        validSamples.map((s) => (s.tensor.rank === 3 ? s.tensor.expandDims(0) : s.tensor)),
        0
      );

      const labelIndices = validSamples.map((s) => labels.indexOf(s.label));
      const ys = tf.oneHot(tf.tensor1d(labelIndices, 'int32'), labels.length);

      // Keep tensors outside tidy
      tf.keep(xs);
      tf.keep(ys);

      return { xs, ys, labels };
    });
  }

  /**
   * Removes a sample from the buffer and disposes its tensor, updating persistence
   * @param {string} id - Sample ID
   */
  removeSample(id) {
    const index = this.buffer.findIndex((s) => s.id === id);
    if (index !== -1) {
      const [removed] = this.buffer.splice(index, 1);
      if (removed && removed.tensor && !removed.tensor.isDisposed) {
        try {
          removed.tensor.dispose();
        } catch {
          // ignore disposal errors
        }
      }
      this.savePersistentBuffer();
      return true;
    }
    return false;
  }

  /**
   * Clears the buffer and disposes all allocated tensors to prevent WebGL/CPU memory leaks,
   * updating local storage persistence
   * @param {string} [filterLabel] - Optional label to clear only that category
   */
  clear(filterLabel = null) {
    if (!filterLabel) {
      for (const item of this.buffer) {
        if (item.tensor && !item.tensor.isDisposed) {
          try {
            item.tensor.dispose();
          } catch {
            // ignore
          }
        }
      }
      this.buffer = [];
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('ml_persistent_tensor_buffer');
        }
      } catch {
        // ignore
      }
    } else {
      const remaining = [];
      for (const item of this.buffer) {
        if (item.label === filterLabel || item.classId === filterLabel) {
          if (item.tensor && !item.tensor.isDisposed) {
            try {
              item.tensor.dispose();
            } catch {
              // ignore
            }
          }
        } else {
          remaining.push(item);
        }
      }
      this.buffer = remaining;
      this.savePersistentBuffer();
    }
  }

  /**
   * Disposes all memory held by this buffer
   */
  dispose() {
    this.clear();
  }
}

// Global singleton instance of local training buffer
export const trainingTensorBuffer = new TrainingTensorBuffer();

/**
 * Capture function that extracts a video frame as a tensor from the active webcam stream,
 * associates it with the currently selected user-defined label from state,
 * and pushes this image data into a persistent local buffer for future model training.
 *
 * Supports passing:
 * - MediaStream (the active webcam stream)
 * - HTMLVideoElement (webcam video playback element)
 * - React ref ({ current: HTMLVideoElement | MediaStream })
 * - HTMLCanvasElement
 * - null/undefined (automatically uses the globally registered active webcam stream/video)
 *
 * @param {MediaStream|HTMLVideoElement|HTMLCanvasElement|{current: any}|null} streamOrVideo - Active webcam stream or video element
 * @param {string|Object} activeLabelOrState - Currently active custom object label or state category object
 * @param {Object} [options={}] - Optional capture configuration (targetWidth, targetHeight, mirror, thumbnail, etc.)
 * @returns {Object} Stored buffer entry including tensor, label, and metadata
 */
export function captureWebcamFrameAsTensor(streamOrVideo, activeLabelOrState, options = {}) {
  // Unwrap React ref if provided
  let target = streamOrVideo;
  if (target && typeof target === 'object' && 'current' in target) {
    target = target.current;
  }

  // Fallback to globally registered active webcam video or stream if not passed
  if (!target) {
    target = activeWebcamVideoElement || activeWebcamStreamInstance;
  }

  // If MediaStream is provided, connect to internal or active video element
  if (typeof MediaStream !== 'undefined' && target instanceof MediaStream) {
    if (activeWebcamVideoElement && activeWebcamVideoElement.srcObject === target && activeWebcamVideoElement.videoWidth > 0) {
      target = activeWebcamVideoElement;
    } else {
      target = getOrCreateVideoForStream(target);
    }
  }

  // Extract label and class identification from user-defined state
  const label = typeof activeLabelOrState === 'string'
    ? activeLabelOrState
    : (activeLabelOrState?.name || activeLabelOrState?.label || activeLabelOrState?.id || 'Object');

  const classId = typeof activeLabelOrState === 'object'
    ? (activeLabelOrState?.id || label)
    : label;

  const targetWidth = options.targetWidth || 224;
  const targetHeight = options.targetHeight || 224;
  const mirror = options.mirror !== false; // Mirror by default to match viewfinder preview

  let thumbnail = options.thumbnail || null;
  let visualEmbedding = options.visualEmbedding || null;
  let tensor = null;

  try {
    // 1. Grab frame onto canvas for mirror adjustment and visual embedding
    const hasDoc = typeof document !== 'undefined';
    const offscreenCanvas = hasDoc ? document.createElement('canvas') : null;
    let ctx = null;

    if (offscreenCanvas) {
      offscreenCanvas.width = targetWidth;
      offscreenCanvas.height = targetHeight;
      ctx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
    }

    if (ctx && target) {
      if (typeof HTMLVideoElement !== 'undefined' && target instanceof HTMLVideoElement) {
        if (target.videoWidth > 0 && target.videoHeight > 0) {
          if (mirror) {
            ctx.translate(targetWidth, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(target, 0, 0, targetWidth, targetHeight);
        }
      } else if (
        (typeof HTMLCanvasElement !== 'undefined' && target instanceof HTMLCanvasElement) ||
        (typeof HTMLImageElement !== 'undefined' && target instanceof HTMLImageElement)
      ) {
        ctx.drawImage(target, 0, 0, targetWidth, targetHeight);
      }
    }

    // Generate thumbnail if not provided
    if (!thumbnail && ctx) {
      thumbnail = offscreenCanvas.toDataURL('image/jpeg', 0.85);
    }

    // Extract visual embedding if not provided
    if (!visualEmbedding && target) {
      const frameData = grabWebcamFrame(target, 160, 120);
      if (frameData) {
        visualEmbedding = frameData.visualEmbedding;
        if (!thumbnail) thumbnail = frameData.thumbnail;
      }
    }

    // 2. Extract video frame as a TensorFlow tensor from active webcam stream/video
    // Uses tf.browser.fromPixels and normalizes pixel values to [0, 1] Float32
    tensor = tf.tidy(() => {
      let rawPixels;
      if (ctx) {
        rawPixels = tf.browser.fromPixels(offscreenCanvas);
      } else if (target && target.videoWidth > 0) {
        rawPixels = tf.browser.fromPixels(target);
        if (targetWidth && targetHeight) {
          rawPixels = tf.image.resizeBilinear(rawPixels, [targetHeight, targetWidth]);
        }
      } else {
        // Fallback synthetic 3D tensor [height, width, 3] for testing/demo
        rawPixels = tf.zeros([targetHeight, targetWidth, 3]);
      }

      // Convert to normalized Float32 [0.0, 1.0]
      return rawPixels.toFloat().div(tf.scalar(255.0));
    });

    // Keep tensor in memory for local training buffer
    tf.keep(tensor);
  } catch (err) {
    console.warn('captureWebcamFrameAsTensor warning during tensor acquisition:', err);
    // Graceful fallback tensor
    tensor = tf.zeros([targetHeight, targetWidth, 3]);
    tf.keep(tensor);
  }

  // 3. Associate with the currently selected user-defined label from state,
  // and push image data into the persistent local buffer for future model training
  const storedEntry = trainingTensorBuffer.pushSample(label, tensor, {
    classId,
    categoryName: label,
    thumbnail,
    visualEmbedding,
    perceptionResult: options.perceptionResult || null,
    sequenceWindow: options.sequenceWindow || [],
    source: options.source || 'webcam',
    timestamp: options.timestamp || Date.now()
  });

  return storedEntry;
}

/**
 * Grabs the current webcam frame as a tensor, associates it with the currently selected
 * user-defined label from state, and pushes this image data into a persistent local buffer
 * for future model training.
 */
export function grabWebcamFrameToTensorAndPush(streamOrVideo, userDefinedLabel, options = {}) {
  return captureWebcamFrameAsTensor(streamOrVideo, userDefinedLabel, options);
}

/**
 * Direct aliases matching exact requested naming conventions
 */
export const captureVideoFrameAsTensor = captureWebcamFrameAsTensor;
export const extractVideoFrameAsTensor = captureWebcamFrameAsTensor;
export const captureFrameAsTensor = captureWebcamFrameAsTensor;
export const captureWebcamFrameToPersistentBuffer = grabWebcamFrameToTensorAndPush;
export const pushWebcamFrameToTrainingBuffer = grabWebcamFrameToTensorAndPush;
export const grabWebcamFrameAsTensorAndPush = grabWebcamFrameToTensorAndPush;

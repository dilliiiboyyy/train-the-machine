/**
 * Object Feature Extractor & Image Processing Utilities
 * Supports custom object recognition (water bottle, toy car, mug, phone, etc.)
 * Extracts 64-dimensional appearance embeddings from video frames or uploaded image files.
 */

import { captureFrameToCanvas, extractEmbedding } from './preprocessing.js';

// Common object keywords to automatically detect object classes
const OBJECT_KEYWORDS = [
  'BOTTLE', 'WATER BOTTLE', 'CAR', 'TOY CAR', 'TOY', 'MUG', 'CUP', 'COFFEE MUG',
  'PHONE', 'SMARTPHONE', 'BOOK', 'NOTEBOOK', 'PEN', 'PENCIL', 'GLASSES',
  'KEYS', 'KEY', 'HEADPHONES', 'WATCH', 'BAG', 'BALL', 'FRUIT', 'APPLE',
  'BANANA', 'OBJECT', 'ITEM', 'PLANT', 'CAN', 'SODA'
];

const ACTION_KEYWORDS = [
  'WAVE', 'WAVING', 'CLAP', 'CLAPPING', 'HAND', 'FIST', 'PALM', 'THUMB',
  'POINT', 'JUMP', 'DANCE', 'SMILE', 'STAND', 'SIT', 'WALK', 'POSE', 'MOTION',
  'GESTURE'
];

/**
 * Checks if a class name or kind represents an object rather than a human body gesture/motion
 */
export function isObjectAction(className = '', kind = '') {
  if (kind === 'object') return true;
  if (kind === 'action') return false;

  const upper = className.trim().toUpperCase();
  if (!upper) return false;

  if (OBJECT_KEYWORDS.some((kw) => upper.includes(kw))) return true;
  if (ACTION_KEYWORDS.some((kw) => upper.includes(kw))) return false;

  // Custom user-defined entries default to objects so users can teach any physical item
  return true;
}

/**
 * Extracts a normalized 64-dimensional visual embedding from an HTMLImageElement, HTMLCanvasElement, or HTMLVideoElement
 */
export function extractVisualEmbedding(element) {
  if (!element) return null;
  const frame = captureFrameToCanvas(element, 64, 64);
  if (!frame || !frame.imageData) return null;
  return extractEmbedding(frame.imageData);
}

/**
 * Loads an image from a dataUrl or Blob and extracts its visual embedding and thumbnail
 */
export async function processImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('File is not a valid image.'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result;
      if (!dataUrl) return reject(new Error('Failed to read image data.'));

      const img = new Image();
      img.onload = () => {
        try {
          // Create 160x120 thumbnail
          const thumbCanvas = document.createElement('canvas');
          thumbCanvas.width = 160;
          thumbCanvas.height = 120;
          const thumbCtx = thumbCanvas.getContext('2d');
          if (thumbCtx) {
            thumbCtx.drawImage(img, 0, 0, 160, 120);
          }
          const thumbnail = thumbCanvas.toDataURL('image/jpeg', 0.85);

          // Extract 64-dim embedding
          const embedding = extractVisualEmbedding(img);

          resolve({
            dataUrl: thumbnail || dataUrl,
            visualEmbedding: embedding,
            width: img.width,
            height: img.height
          });
        } catch (err) {
          resolve({
            dataUrl,
            visualEmbedding: null
          });
        }
      };
      img.onerror = () => reject(new Error('Failed to load image into memory.'));
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error('FileReader error.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Calculates cosine similarity between two normalized feature vectors
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB) return 0;
  const len = Math.min(vecA.length, vecB.length);
  let dot = 0;
  for (let i = 0; i < len; i++) {
    dot += vecA[i] * vecB[i];
  }
  return Math.max(-1.0, Math.min(1.0, dot));
}

/**
 * Grabs the current webcam frame as an optimized thumbnail and extracts its visual embedding
 * Handles horizontal mirroring to align with the camera viewfinder display
 */
export function grabWebcamFrame(videoOrCanvas, width = 160, height = 120) {
  if (!videoOrCanvas || typeof document === 'undefined') return null;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    if (videoOrCanvas instanceof HTMLVideoElement) {
      if (videoOrCanvas.videoWidth > 0 && videoOrCanvas.videoHeight > 0) {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoOrCanvas, 0, 0, width, height);
      } else {
        return null;
      }
    } else {
      ctx.drawImage(videoOrCanvas, 0, 0, width, height);
    }

    const thumbnail = canvas.toDataURL('image/jpeg', 0.85);
    const visualEmbedding = extractVisualEmbedding(canvas);

    return {
      thumbnail,
      visualEmbedding,
      width,
      height
    };
  } catch (err) {
    console.warn('grabWebcamFrame error:', err);
    return null;
  }
}

// Re-export tensor capture and local training buffer
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



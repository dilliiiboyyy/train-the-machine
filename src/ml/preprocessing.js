/**
 * Video frame capture and feature preprocessing
 * Converts raw webcam stream into normalized representations
 */

export function captureFrameToCanvas(videoOrImg, width = 64, height = 64) {
  if (!videoOrImg) return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  try {
    if (videoOrImg instanceof HTMLVideoElement) {
      if (videoOrImg.videoWidth > 0 && videoOrImg.videoHeight > 0) {
        // Mirror horizontally to match what the user sees in the webcam viewfinder
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoOrImg, 0, 0, width, height);
      } else {
        return null;
      }
    } else {
      ctx.drawImage(videoOrImg, 0, 0, width, height);
    }
    const imageData = ctx.getImageData(0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    return { canvas, imageData, dataUrl, width, height };
  } catch (err) {
    console.warn('captureFrameToCanvas error:', err);
    return null;
  }
}

/**
 * Extracts a normalized 64-dimensional feature vector from frame pixels
 * Computes spatial luminance grid, Sobel edge gradients, and color distribution
 */
export function extractEmbedding(imageData) {
  const { data, width, height } = imageData;
  const totalPixels = width * height;
  const features = [];

  // 1. Grayscale luminance buffer
  const gray = new Float32Array(totalPixels);
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;

  for (let i = 0; i < totalPixels; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    totalR += r;
    totalG += g;
    totalB += b;
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  // Color balance features (normalized)
  features.push(totalR / (totalPixels * 255));
  features.push(totalG / (totalPixels * 255));
  features.push(totalB / (totalPixels * 255));

  // 2. Spatial 4x4 Grid Mean Luminance (16 features)
  const cellW = Math.floor(width / 4);
  const cellH = Math.floor(height / 4);

  for (let gy = 0; gy < 4; gy++) {
    for (let gx = 0; gx < 4; gx++) {
      let sum = 0;
      let count = 0;
      for (let y = gy * cellH; y < (gy + 1) * cellH; y++) {
        for (let x = gx * cellW; x < (gx + 1) * cellW; x++) {
          sum += gray[y * width + x];
          count++;
        }
      }
      features.push((sum / (count * 255)));
    }
  }

  // 3. Sobel Edge Gradients (Horizontal and Vertical magnitude histograms - 32 features)
  // Evaluated on 4 spatial quadrants across 4 gradient orientation bins
  const quadW = Math.floor(width / 2);
  const quadH = Math.floor(height / 2);

  for (let qy = 0; qy < 2; qy++) {
    for (let qx = 0; qx < 2; qx++) {
      const hist = [0, 0, 0, 0, 0, 0, 0, 0]; // 8 orientation bins
      let edgeCount = 0;

      for (let y = qy * quadH + 1; y < (qy + 1) * quadH - 1; y++) {
        for (let x = qx * quadW + 1; x < (qx + 1) * quadW - 1; x++) {
          // Horizontal gradient
          const gx =
            -gray[(y - 1) * width + (x - 1)] +
            gray[(y - 1) * width + (x + 1)] -
            2 * gray[y * width + (x - 1)] +
            2 * gray[y * width + (x + 1)] -
            gray[(y + 1) * width + (x - 1)] +
            gray[(y + 1) * width + (x + 1)];

          // Vertical gradient
          const gy =
            -gray[(y - 1) * width + (x - 1)] -
            2 * gray[(y - 1) * width + x] -
            gray[(y - 1) * width + (x + 1)] +
            gray[(y + 1) * width + (x - 1)] +
            2 * gray[(y + 1) * width + x] +
            gray[(y + 1) * width + (x + 1)];

          const mag = Math.sqrt(gx * gx + gy * gy);
          if (mag > 20) {
            const angle = (Math.atan2(gy, gx) + Math.PI) / (2 * Math.PI); // 0 to 1
            const bin = Math.min(7, Math.floor(angle * 8));
            hist[bin] += mag;
            edgeCount++;
          }
        }
      }

      const norm = edgeCount > 0 ? edgeCount * 255 : 1;
      for (let b = 0; b < 8; b++) {
        features.push(Math.min(1, hist[b] / norm));
      }
    }
  }

  // 4. Center-surround contrast (peripheral vs central focus ratio)
  const centerStart = Math.floor(width * 0.25);
  const centerEnd = Math.floor(width * 0.75);
  let centerSum = 0;
  let centerCount = 0;
  let periSum = 0;
  let periCount = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const val = gray[y * width + x];
      if (x >= centerStart && x <= centerEnd && y >= centerStart && y <= centerEnd) {
        centerSum += val;
        centerCount++;
      } else {
        periSum += val;
        periCount++;
      }
    }
  }
  features.push((centerSum / (centerCount * 255)));
  features.push((periSum / (periCount * 255)));

  // L2 Vector Normalization
  let normSum = 0;
  for (let i = 0; i < features.length; i++) {
    normSum += features[i] * features[i];
  }
  const norm = Math.sqrt(normSum) || 1;
  const normalizedVector = new Float32Array(features.length);
  for (let i = 0; i < features.length; i++) {
    normalizedVector[i] = features[i] / norm;
  }

  return normalizedVector;
}

import { ProctoringIncident, ProctoringReport } from '@/types';

export interface ProctoringState {
  faceVisible: boolean;
  faceOutCount: number;
  tabSwitchCount: number;
  copyPasteCount: number;
  incidents: ProctoringIncident[];
  latestAlert: string | null;
}

/**
 * Skin tone & presence detector using canvas frame sampling
 */
export function analyzeVideoFacePresence(
  videoElement: HTMLVideoElement,
  canvasElement?: HTMLCanvasElement
): { isFaceVisible: boolean; confidence: number; note: string } {
  if (!videoElement || videoElement.readyState < 2) {
    return { isFaceVisible: true, confidence: 50, note: 'Video stream initializing' };
  }

  const canvas = canvasElement || document.createElement('canvas');
  const width = 160;
  const height = 120;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return { isFaceVisible: true, confidence: 50, note: 'Canvas context unavailable' };
  }

  try {
    ctx.drawImage(videoElement, 0, 0, width, height);
    const frame = ctx.getImageData(0, 0, width, height);
    const data = frame.data;
    const totalPixels = width * height;

    let skinPixels = 0;
    let totalBrightness = 0;

    // Scan pixel data for human skin color range & brightness
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;

      // Human skin chrominance heuristic in RGB
      const isSkin =
        r > 60 &&
        g > 40 &&
        b > 20 &&
        r > g &&
        r > b &&
        r - g > 15 &&
        Math.abs(r - g) > 10;

      if (isSkin) {
        skinPixels++;
      }
    }

    const avgBrightness = totalBrightness / totalPixels;
    const skinRatio = skinPixels / totalPixels;

    // If too dark or skin coverage is negligible, candidate is out of frame
    if (avgBrightness < 18) {
      return { isFaceVisible: false, confidence: 90, note: 'Lighting too dark or camera obstructed' };
    }

    if (skinRatio < 0.04) {
      return { isFaceVisible: false, confidence: 85, note: 'Candidate face moved out of camera frame' };
    }

    return { isFaceVisible: true, confidence: 95, note: 'Face centered and clearly visible' };
  } catch (e) {
    return { isFaceVisible: true, confidence: 50, note: 'Sampling bypassed' };
  }
}

/**
 * Computes Proctoring Trust Score (0-100)
 */
export function calculateTrustScore(
  faceOutCount: number,
  tabSwitchCount: number,
  copyPasteCount: number
): number {
  const penalty = faceOutCount * 5 + tabSwitchCount * 10 + copyPasteCount * 5;
  return Math.max(0, Math.min(100, 100 - penalty));
}

/**
 * Synthesizes final ProctoringReport object
 */
export function buildProctoringReport(
  faceOutCount: number,
  tabSwitchCount: number,
  copyPasteCount: number,
  incidents: ProctoringIncident[]
): ProctoringReport {
  const totalViolations = faceOutCount + tabSwitchCount + copyPasteCount;
  const trustScore = calculateTrustScore(faceOutCount, tabSwitchCount, copyPasteCount);

  return {
    faceNotVisibleCount: faceOutCount,
    tabSwitchCount,
    copyPasteCount,
    totalViolations,
    trustScore,
    incidents
  };
}

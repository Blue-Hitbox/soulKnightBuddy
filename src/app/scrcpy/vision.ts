/**
 * Step 2: Vision Layer
 * Converts pixels → structured game state using OpenCV
 * Phase 1: Rule-based vision (color detection, contours)
 */

import * as cv from 'opencv4nodejs-prebuilt';
import { GameState, Enemy, Bullet, Player, Vector2 } from './types/types';

export interface VisionConfig {
  // Detection thresholds
  minContourArea: number;
  bulletMinArea: number;
  enemyMinArea: number;
  playerMinArea: number;
  
  // Color ranges (HSV)
  bulletColorRanges: Array<{
    lower: [number, number, number];
    upper: [number, number, number];
  }>;
  
  // Frame dimensions
  frameWidth: number;
  frameHeight: number;
}

const DEFAULT_CONFIG: VisionConfig = {
  minContourArea: 50,
  bulletMinArea: 20,
  enemyMinArea: 100,
  playerMinArea: 150,
  
  // Default: detect red/orange bullets (common in Soul Knight)
  bulletColorRanges: [
    {
      lower: [0, 100, 100],    // Red
      upper: [15, 255, 255],
    },
    {
      lower: [160, 100, 100],  // Red (wrap-around)
      upper: [180, 255, 255],
    },
    {
      lower: [10, 100, 100],   // Orange
      upper: [25, 255, 255],
    },
  ],
  
  frameWidth: 800,
  frameHeight: 450,
};

export class VisionLayer {
  private config: VisionConfig;
  private enemyIdCounter: number = 0;
  private bulletIdCounter: number = 0;

  constructor(config: Partial<VisionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Process a frame and extract game state
   * @param frameBuffer - Raw frame buffer from capture layer
   */
  processFrame(frameBuffer: Buffer): GameState | null {
    try {
      // Decode frame
      const mat = cv.imdecode(frameBuffer);
      if (mat.empty) {
        console.warn('⚠️ Empty frame');
        return null;
      }

      // Resize to standard dimensions
      const resized = mat.resize(this.config.frameWidth, this.config.frameHeight);

      // Convert to HSV for color detection
      const hsv = resized.cvtColor(cv.COLOR_BGR2HSV);

      // Detect game objects
      const bullets = this.detectBullets(hsv, resized);
      const enemies = this.detectEnemies(resized);
      const player = this.detectPlayer(resized);

      return {
        player,
        enemies,
        bullets,
        timestamp: Date.now(),
        frameWidth: this.config.frameWidth,
        frameHeight: this.config.frameHeight,
      };
    } catch (error) {
      console.error('❌ Vision processing error:', error);
      return null;
    }
  }

  /**
   * Detect bullets using color thresholding
   */
  private detectBullets(hsv: cv.Mat, bgr: cv.Mat): Bullet[] {
    const bullets: Bullet[] = [];
    
    for (const range of this.config.bulletColorRanges) {
      // Create mask for this color range
      const lower = new cv.Mat([range.lower], cv.CV_8UC3);
      const upper = new cv.Mat([range.upper], cv.CV_8UC3);
      const mask = hsv.inRange(lower, upper);

      // Find contours
      const contours = mask.findContours(
        cv.RETR_EXTERNAL,
        cv.CHAIN_APPROX_SIMPLE
      );

      for (const contour of contours) {
        const area = contour.contourArea();
        
        if (area >= this.config.bulletMinArea && area < this.config.enemyMinArea) {
          const { x, y, width, height } = contour.boundingRect();
          
          // Calculate center position
          const centerX = x + width / 2;
          const centerY = y + height / 2;

          // Get dominant color
          const roi = bgr.getRegion(new cv.Rect(x, y, width, height));
          const mean = roi.mean();
          const color = `rgb(${Math.round(mean[2])},${Math.round(mean[1])},${Math.round(mean[0])})`;

          bullets.push({
            id: this.bulletIdCounter++,
            position: { x: centerX, y: centerY },
            color,
            confidence: area / this.config.enemyMinArea,
          });

          roi.delete();
        }
      }

      mask.delete();
    }

    return bullets;
  }

  /**
   * Detect enemies using contour analysis
   * TODO: Replace with ML-based detection in Phase 2
   */
  private detectEnemies(frame: cv.Mat): Enemy[] {
    const enemies: Enemy[] = [];
    
    // Convert to grayscale
    const gray = frame.cvtColor(cv.COLOR_BGR2GRAY);
    
    // Apply Gaussian blur
    const blurred = gray.gaussianBlur([5, 5]);
    
    // Edge detection
    const edges = blurred.canny(50, 150);
    
    // Find contours
    const contours = edges.findContours(
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
    );

    for (const contour of contours) {
      const area = contour.contourArea();
      
      if (area >= this.config.enemyMinArea) {
        const { x, y, width, height } = contour.boundingRect();
        
        // Filter by aspect ratio (enemies are usually taller than wide)
        const aspectRatio = width / height;
        if (aspectRatio > 0.5 && aspectRatio < 2.0) {
          enemies.push({
            id: this.enemyIdCounter++,
            position: { x: x + width / 2, y: y + height / 2 },
            boundingBox: { x, y, width, height },
            confidence: area / 1000, // Normalize confidence
          });
        }
      }
    }

    edges.delete();
    blurred.delete();
    gray.delete();

    return enemies;
  }

  /**
   * Detect player character
   * TODO: Improve with specific player color/shape detection
   */
  private detectPlayer(frame: cv.Mat): Player | null {
    // Convert to grayscale
    const gray = frame.cvtColor(cv.COLOR_BGR2GRAY);
    
    // Apply adaptive thresholding
    const thresholded = gray.adaptiveThreshold(
      255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY_INV,
      11,
      2
    );

    // Find contours
    const contours = thresholded.findContours(
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
    );

    let bestPlayer: Player | null = null;
    let maxArea = 0;

    for (const contour of contours) {
      const area = contour.contourArea();
      
      if (area >= this.config.playerMinArea && area > maxArea) {
        const { x, y, width, height } = contour.boundingRect();
        
        // Player is usually near the bottom center of screen
        const centerX = this.config.frameWidth / 2;
        const distanceFromCenter = Math.abs((x + width / 2) - centerX);
        const isNearBottom = y > this.config.frameHeight * 0.6;
        
        if (isNearBottom && distanceFromCenter < this.config.frameWidth * 0.3) {
          maxArea = area;
          bestPlayer = {
            position: { x: x + width / 2, y: y + height / 2 },
            boundingBox: { x, y, width, height },
            confidence: area / 2000,
          };
        }
      }
    }

    thresholded.delete();
    gray.delete();

    return bestPlayer;
  }

  /**
   * Reset ID counters (call when game restarts)
   */
  resetIds(): void {
    this.enemyIdCounter = 0;
    this.bulletIdCounter = 0;
  }
}

/**
 * Simple color-based bullet detection (standalone function)
 * For testing without full VisionLayer
 */
export function detectBulletsSimple(
  frameBuffer: Buffer,
  colorRanges: Array<{ lower: number[]; upper: number[] }>
): Array<{ x: number; y: number; area: number }> {
  try {
    const mat = cv.imdecode(frameBuffer);
    if (mat.empty) return [];

    const hsv = mat.cvtColor(cv.COLOR_BGR2HSV);
    const results: Array<{ x: number; y: number; area: number }> = [];

    for (const range of colorRanges) {
      const lower = new cv.Mat([range.lower], cv.CV_8UC3);
      const upper = new cv.Mat([range.upper], cv.CV_8UC3);
      const mask = hsv.inRange(lower, upper);

      const contours = mask.findContours(
        cv.RETR_EXTERNAL,
        cv.CHAIN_APPROX_SIMPLE
      );

      for (const contour of contours) {
        const area = contour.contourArea();
        if (area > 20) {
          const { x, y, width, height } = contour.boundingRect();
          results.push({
            x: x + width / 2,
            y: y + height / 2,
            area,
          });
        }
      }

      mask.delete();
    }

    return results;
  } catch (error) {
    console.error('Bullet detection error:', error);
    return [];
  }
}

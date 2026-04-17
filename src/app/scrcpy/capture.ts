/**
 * Step 1: Capture Layer
 * Handles real-time frame capture from scrcpy/ADB stream
 */

import { spawn, ChildProcess } from 'child_process';

export interface CaptureConfig {
  maxWidth: number;
  maxHeight: number;
  bitRate: string;
  maxFps: number;
  deviceId?: string;
}

export interface CaptureResult {
  frame: Buffer;
  width: number;
  height: number;
  timestamp: number;
}

const DEFAULT_CONFIG: CaptureConfig = {
  maxWidth: 800,
  maxHeight: 450,
  bitRate: '8M',
  maxFps: 60,
};

export class ScreenCapture {
  private config: CaptureConfig;
  private scrcpyProcess: ChildProcess | null = null;
  private isRunning: boolean = false;

  constructor(config: Partial<CaptureConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start scrcpy capture session
   * Note: This spawns scrcpy which must be installed separately
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('Capture already running');
      return;
    }

    const args = [
      '--max-size', this.config.maxWidth.toString(),
      '--bit-rate', this.config.bitRate,
      '--max-fps', this.config.maxFps.toString(),
      '--no-audio', // We only need video
      '--no-control', // Don't send input back to device
    ];

    if (this.config.deviceId) {
      args.push('-s', this.config.deviceId);
    }

    console.log('🎬 Starting scrcpy capture...', args.join(' '));
    
    this.scrcpyProcess = spawn('scrcpy', args);
    this.isRunning = true;

    this.scrcpyProcess.on('error', (err) => {
      console.error('❌ scrcpy process error:', err.message);
      console.log('💡 Make sure scrcpy is installed: https://github.com/Genymobile/scrcpy');
      this.isRunning = false;
    });

    this.scrcpyProcess.on('exit', (code) => {
      console.log(`📴 scrcpy exited with code ${code}`);
      this.isRunning = false;
    });

    // Wait for scrcpy to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  /**
   * Stop capture session
   */
  stop(): void {
    if (this.scrcpyProcess) {
      this.scrcpyProcess.kill();
      this.scrcpyProcess = null;
      this.isRunning = false;
      console.log('⏹️ Capture stopped');
    }
  }

  /**
   * Capture a single frame
   * Note: In production, you'd pipe scrcpy output to OpenCV
   * For now, this is a placeholder for the capture pipeline
   */
  async captureFrame(): Promise<CaptureResult | null> {
    if (!this.isRunning) {
      console.warn('⚠️ Capture not running, call start() first');
      return null;
    }

    // Placeholder: In real implementation, this would:
    // 1. Read frame from scrcpy's stdout or shared memory
    // 2. Convert to Buffer
    // 3. Return frame data
    
    // For development, we'll return null and let the vision layer
    // work with test images or screen captures
    return null;
  }

  /**
   * Check if capture is active
   */
  isCaptureActive(): boolean {
    return this.isRunning && this.scrcpyProcess !== null;
  }
}

/**
 * Alternative: Direct ADB screenshot capture
 * Slower but more reliable for testing
 */
export async function captureViaADB(deviceId?: string): Promise<Buffer | null> {
  const args = ['shell', 'screencap', '-p'];
  
  if (deviceId) {
    args.unshift('-s', deviceId);
  }

  try {
    const result = await new Promise<Buffer>((resolve, reject) => {
      const process = spawn('adb', args);
      const chunks: Buffer[] = [];

      process.stdout.on('data', (chunk) => {
        chunks.push(chunk);
      });

      process.on('error', reject);
      process.on('close', (code) => {
        if (code === 0) {
          resolve(Buffer.concat(chunks));
        } else {
          reject(new Error(`ADB exited with code ${code}`));
        }
      });
    });

    return result;
  } catch (error) {
    console.error('❌ ADB capture failed:', error);
    return null;
  }
}

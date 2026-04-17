/**
 * Step 1: Capture Layer
 * Handles real-time frame capture from scrcpy/ADB stream
 * Supports both system scrcpy and local installation in src/scrcpy folder
 */

import { spawn, ChildProcess } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get current file directory for local scrcpy path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface CaptureConfig {
  maxWidth: number;
  maxHeight: number;
  bitRate: string;
  maxFps: number;
  deviceId?: string;
  useLocalScrcpy?: boolean; // Use local scrcpy installation in src/scrcpy folder
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
  useLocalScrcpy: true, // Default to local scrcpy
};

export class ScreenCapture {
  private config: CaptureConfig;
  private scrcpyProcess: ChildProcess | null = null;
  private isRunning: boolean = false;
  private scrcpyPath: string;

  constructor(config: Partial<CaptureConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Determine scrcpy path
    if (this.config.useLocalScrcpy) {
      // Use local scrcpy from src/scrcpy folder
      this.scrcpyPath = join(__dirname, 'scrcpy', 'scrcpy.exe');
      console.log(`📍 Using local scrcpy: ${this.scrcpyPath}`);
    } else {
      // Use system scrcpy (must be in PATH)
      this.scrcpyPath = 'scrcpy';
      console.log('📍 Using system scrcpy (from PATH)');
    }
  }

  /**
   * Start scrcpy capture session
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('⚠️ Capture already running');
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

    console.log('🎬 Starting scrcpy capture...', this.scrcpyPath, args.join(' '));
    
    try {
      this.scrcpyProcess = spawn(this.scrcpyPath, args);
      this.isRunning = true;

      this.scrcpyProcess.on('error', (err) => {
        console.error('❌ scrcpy process error:', err.message);
        if (this.config.useLocalScrcpy) {
          console.log('💡 Make sure scrcpy is downloaded. Run:');
          console.log('   powershell -ExecutionPolicy Bypass -File src/scrcpy/download-scrcpy.ps1');
        } else {
          console.log('💡 Make sure scrcpy is installed and in PATH');
        }
        this.isRunning = false;
      });

      this.scrcpyProcess.on('exit', (code) => {
        console.log(`📴 scrcpy exited with code ${code}`);
        this.isRunning = false;
      });

      // Wait for scrcpy to initialize
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('❌ Failed to start scrcpy:', error);
      throw error;
    }
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
    
    return null;
  }

  /**
   * Check if capture is active
   */
  isCaptureActive(): boolean {
    return this.isRunning && this.scrcpyProcess !== null;
  }

  /**
   * Get scrcpy path being used
   */
  getScrcpyPath(): string {
    return this.scrcpyPath;
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

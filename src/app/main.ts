/**
 * Main entry point - Step 1 & 2 Demo
 * Capture Layer + Vision Layer integration
 */

import { ScreenCapture, captureViaADB } from './scrcpy/capture';
import { VisionLayer } from './scrcpy/vision';
import { GameState } from './scrcpy/types/types';

// Configuration
const CONFIG = {
  capture: {
    maxWidth: 800,
    maxHeight: 450,
    bitRate: '8M',
    maxFps: 30,
  },
  vision: {
    minContourArea: 50,
    bulletMinArea: 20,
    enemyMinArea: 100,
    playerMinArea: 150,
    frameWidth: 800,
    frameHeight: 450,
  },
};

async function main() {
  console.log('🎮 Soul Knight Buddy - Step 1 & 2 Demo');
  console.log('=====================================\n');

  // Initialize capture layer
  console.log('📹 Initializing capture layer...');
  const capture = new ScreenCapture({
    ...CONFIG.capture,
    useLocalScrcpy: true, // Use local scrcpy from src/scrcpy folder
  });

  // Initialize vision layer
  console.log('👁️ Initializing vision layer...');
  const vision = new VisionLayer(CONFIG.vision);

  // Show scrcpy path
  console.log(`📍 Scrcpy path: ${capture.getScrcpyPath()}\n`);

  // Start capture
  try {
    await capture.start();
    console.log('✅ Capture started\n');
  } catch (error) {
    console.error('❌ Failed to start capture:', error);
    console.log('\n💡 Download scrcpy to src/scrcpy folder:');
    console.log('   powershell -ExecutionPolicy Bypass -File src/scrcpy/download-scrcpy.ps1\n');
    
    // Fallback to ADB mode
    console.log('🔄 Falling back to ADB screenshot mode...\n');
  }

  // Processing loop
  let frameCount = 0;
  const maxFrames = 10; // Demo: process 10 frames

  console.log('🔄 Starting processing loop...\n');

  const interval = setInterval(async () => {
    if (frameCount >= maxFrames) {
      clearInterval(interval);
      cleanup();
      return;
    }

    frameCount++;
    console.log(`📊 Frame ${frameCount}/${maxFrames}`);

    // Capture frame
    let frameBuffer: Buffer | null = null;
    
    if (capture.isCaptureActive()) {
      // Use scrcpy capture (placeholder - needs real implementation)
      const result = await capture.captureFrame();
      frameBuffer = result?.frame || null;
    }

    // Fallback to ADB if scrcpy not available
    if (!frameBuffer) {
      console.log('   📸 Capturing via ADB...');
      frameBuffer = await captureViaADB();
    }

    if (!frameBuffer) {
      console.log('   ⚠️ No frame captured\n');
      return;
    }

    // Process with vision layer
    const gameState = vision.processFrame(frameBuffer);

    if (gameState) {
      displayGameState(gameState);
    } else {
      console.log('   ⚠️ Could not process frame\n');
    }
  }, 1000); // Process every second for demo

  function cleanup() {
    console.log('\n⏹️ Cleaning up...');
    capture.stop();
    console.log('✅ Demo complete!');
    process.exit(0);
  }

  // Handle Ctrl+C
  process.on('SIGINT', cleanup);
}

/**
 * Display game state in readable format
 */
function displayGameState(state: GameState): void {
  console.log('   🎯 Game State:');
  
  if (state.player) {
    console.log(`   👤 Player: (${state.player.position.x.toFixed(0)}, ${state.player.position.y.toFixed(0)}) [${(state.player.confidence * 100).toFixed(0)}%]`);
  } else {
    console.log('   👤 Player: Not detected');
  }

  console.log(`   👾 Enemies: ${state.enemies.length}`);
  state.enemies.slice(0, 3).forEach(enemy => {
    console.log(`      • Enemy #${enemy.id}: (${enemy.position.x.toFixed(0)}, ${enemy.position.y.toFixed(0)}) [${(enemy.confidence * 100).toFixed(0)}%]`);
  });

  console.log(`   🔴 Bullets: ${state.bullets.length}`);
  state.bullets.slice(0, 5).forEach(bullet => {
    console.log(`      • Bullet #${bullet.id}: (${bullet.position.x.toFixed(0)}, ${bullet.position.y.toFixed(0)}) ${bullet.color || ''} [${(bullet.confidence * 100).toFixed(0)}%]`);
  });

  console.log('');
}

// Run demo
main().catch(console.error);

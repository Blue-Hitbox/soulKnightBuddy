# 🚀 Setup Guide - Step 1 & 2

## Capture System + Vision Layer

---

## 📦 Prerequisites

### 1. Install scrcpy (Local Installation) ✨ **RECOMMENDED**

The project includes a script to automatically download scrcpy to the `src/scrcpy` folder.

**Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy Bypass -File src/scrcpy/download-scrcpy.ps1
```

This will:
- Download the latest scrcpy release
- Extract it to `src/scrcpy/` folder
- Ready to use without system PATH configuration

**Manual Download (Alternative):**
1. Go to: https://github.com/Genymobile/scrcpy/releases
2. Download `scrcpy-win64-v*.zip`
3. Extract to `src/scrcpy/` folder
4. Verify `src/scrcpy/scrcpy.exe` exists

---

### 2. Install ADB (Android Debug Bridge)

**Windows:**
1. Download Platform Tools: https://developer.android.com/studio/releases/platform-tools
2. Extract to `C:\platform-tools`
3. Add to PATH: `C:\platform-tools`

**Verify:**
```bash
adb version
```

---

### 3. Enable USB Debugging on Phone

1. Go to **Settings → About Phone**
2. Tap **Build Number** 7 times
3. Go to **Settings → Developer Options**
4. Enable **USB Debugging**
5. Connect phone via USB
6. Accept debugging authorization on phone

**Verify connection:**
```bash
adb devices
```

---

## 📥 Install Dependencies

```bash
pnpm install
```

This installs:
- `opencv4nodejs-prebuilt` - Computer vision library
- `ts-node` - TypeScript runtime

---

## 🎮 Run the Demo

```bash
pnpm dev
```

---

## 🔧 Configuration

Edit `src/app/main.ts` to adjust:

- **Capture settings**: resolution, FPS, bitrate
- **Vision settings**: detection thresholds, color ranges

---

## 🎯 What This Does

### Step 1 - Capture Layer (`src/scrcpy/capture.ts`)
- 📹 Starts scrcpy video stream from phone
- 🖼️ Captures frames in real-time
- ⚡ Low-latency (30-60 FPS)

### Step 2 - Vision Layer (`src/scrcpy/vision.ts`)
- 🎨 Color-based bullet detection
- 🔍 Contour-based enemy detection
- 📍 Player position tracking
- 📊 Outputs structured `GameState`

---

## 🐛 Troubleshooting

### "scrcpy.exe not found"
- Run the download script: `powershell -ExecutionPolicy Bypass -File src/scrcpy/download-scrcpy.ps1`
- Verify `src/scrcpy/scrcpy.exe` exists
- Check that `useLocalScrcpy: true` in config

### "No devices found"
- Check USB connection
- Enable USB debugging
- Run `adb kill-server` then `adb start-server`

### OpenCV errors
- Ensure `opencv4nodejs-prebuilt` installed correctly
- Try: `pnpm install --force`

### Local scrcpy not working
- Verify the path: `src/scrcpy/scrcpy.exe`
- Try running manually: `.\src\scrcpy\scrcpy.exe --version`
- Check Windows Defender/firewall isn't blocking

---

## 📊 Expected Output

```
🎮 Soul Knight Buddy - Step 1 & 2 Demo
=====================================

📹 Initializing capture layer...
👁️ Initializing vision layer...
✅ Capture started

🔄 Starting processing loop...

📊 Frame 1/10
   🎯 Game State:
   👤 Player: (400, 380) [85%]
   👾 Enemies: 3
      • Enemy #0: (200, 150) [72%]
      • Enemy #1: (600, 180) [68%]
      • Enemy #2: (350, 200) [75%]
   🔴 Bullets: 5
      • Bullet #0: (380, 300) rgb(255,100,100) [45%]
      • Bullet #1: (420, 320) rgb(255,120,80) [50%]
      ...
```

---

## 🔄 Next Steps

After testing Step 1 & 2:
- ✅ Tune detection parameters
- ✅ Test with actual gameplay
- ✅ Proceed to Step 3 (Game State Builder)

---

## 📝 Notes

- Vision uses **Phase 1** (rule-based) detection
- **Phase 2** will upgrade to ML (YOLO/TensorFlow)
- Frame processing runs at ~20-30 FPS
- Adjust color ranges for different bullet types

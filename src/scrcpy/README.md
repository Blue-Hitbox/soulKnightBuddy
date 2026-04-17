# 📹 Local scrcpy Installation

This folder contains a local installation of scrcpy for the Soul Knight Buddy project.

## 🚀 Quick Setup

### Automatic Download (Recommended)

Run the PowerShell script to automatically download and extract scrcpy:

```powershell
powershell -ExecutionPolicy Bypass -File download-scrcpy.ps1
```

### Manual Installation

1. Download the latest release from: https://github.com/Genymobile/scrcpy/releases
2. Look for `scrcpy-win64-v*.zip`
3. Extract all files to this folder (`src/scrcpy/`)
4. Verify `scrcpy.exe` exists in this folder

## 📁 Folder Structure

After installation, this folder should contain:
```
src/scrcpy/
├── scrcpy.exe          # Main executable
├── scrcpy-server       # Server component
├── adb.exe             # ADB binary (included)
├── ADB.exe.manifest    # ADB manifest
└── download-scrcpy.ps1 # Download script
```

## 🎮 Usage

The application will automatically use the local scrcpy installation when:
- `useLocalScrcpy: true` in `CaptureConfig`

### Command Line (Manual Testing)

```bash
# Basic capture
.\scrcpy.exe --max-size 800 --bit-rate 8M --max-fps 60 --no-audio --no-control

# With specific device
.\scrcpy.exe -s <device-id> --max-size 800 --no-audio --no-control
```

## ⚙️ Configuration

Default settings used by the application:
- **Resolution**: 800x450 (max)
- **Bitrate**: 8M
- **FPS**: 30-60
- **Audio**: Disabled (video only)
- **Control**: Disabled (read-only capture)

## 🐛 Troubleshooting

### "scrcpy.exe not found"
- Run the download script
- Verify the executable exists in this folder

### "Device not found"
- Enable USB debugging on phone
- Connect via USB
- Run `adb devices` to verify

### Performance issues
- Lower `--max-size` to 640
- Reduce `--max-fps` to 30
- Lower `--bit-rate` to 4M

## 📝 Notes

- Local scrcpy avoids system PATH dependencies
- Version is managed per-project
- Update by re-running the download script
- Works independently of system scrcpy installation

## 🔗 Resources

- **GitHub**: https://github.com/Genymobile/scrcpy
- **Documentation**: https://github.com/Genymobile/scrcpy/blob/master/README.md
- **Releases**: https://github.com/Genymobile/scrcpy/releases

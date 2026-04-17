# Download scrcpy for Windows
# This script downloads scrcpy to the src/scrcpy folder

$scrcpyDir = Join-Path $PSScriptRoot "scrcpy"
$scrcpyZip = Join-Path $scrcpyDir "scrcpy.zip"

# Create directory if it doesn't exist
if (-not (Test-Path $scrcpyDir)) {
    New-Item -ItemType Directory -Path $scrcpyDir -Force | Out-Null
}

# Download latest scrcpy release
Write-Host "📥 Downloading scrcpy..."
$latestRelease = Invoke-RestMethod -Uri "https://api.github.com/repos/Genymobile/scrcpy/releases/latest"
$downloadUrl = $latestRelease.assets | Where-Object { $_.name -like "*scrcpy-win64*.zip" } | Select-Object -First 1 -ExpandProperty browser_download_url

Write-Host "Downloading from: $downloadUrl"
Invoke-WebRequest -Uri $downloadUrl -OutFile $scrcpyZip

# Extract
Write-Host "📦 Extracting scrcpy..."
Expand-Archive -Path $scrcpyZip -DestinationPath $scrcpyDir -Force

# Clean up zip
Remove-Item $scrcpyZip -Force

Write-Host "✅ scrcpy installed to: $scrcpyDir"
Write-Host "💡 Run scrcpy from: $(Join-Path $scrcpyDir "scrcpy.exe")"

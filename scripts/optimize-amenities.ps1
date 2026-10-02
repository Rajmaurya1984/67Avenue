# Run from the 67Avenue directory:  powershell -ExecutionPolicy Bypass -File scripts/optimize-amenities.ps1
# Generates 1024px-wide WebP previews for any full-size render in
# public/assets/amenities/*.webp that lacks optimized/<name>-preview.webp.
# Originals are preserved. Requires the Sharp CLI (npx -y sharp-cli) on PATH;
# falls back to a copy so the tour still resolves the preview URL.
$ErrorActionPreference = 'Stop'
$assetDir = Join-Path (Get-Location) 'public/assets/amenities'
$optimizedDir = Join-Path $assetDir 'optimized'
New-Item -ItemType Directory -Force $optimizedDir | Out-Null
$sharp = Get-Command sharp -ErrorAction SilentlyContinue
foreach ($source in Get-ChildItem $assetDir -Filter 'cam*.webp' -File) {
  $preview = Join-Path $optimizedDir ($source.BaseName + '-preview.webp')
  if (Test-Path $preview) { Write-Host ('skip ' + $source.Name); continue }
  if ($sharp) {
    & sharp -i $source.FullName -o $preview resize 1024 --webp '{ \"quality\": 78, \"effort\": 6 }'
  } else {
    Copy-Item $source.FullName $preview
    Write-Warning ('sharp CLI not found; copied full render as ' + [IO.Path]::GetFileName($preview) + '. Install with: npm i -g sharp-cli')
  }
  Write-Host ('wrote ' + [IO.Path]::GetFileName($preview))
}
Get-ChildItem $optimizedDir -Filter '*-preview.webp' | Select-Object Name, Length

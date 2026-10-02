# Run from the 67Avenue directory. Originals are preserved.
Add-Type -AssemblyName System.Drawing
$assetRoot = Join-Path (Get-Location) 'public/assets'
$outputDirectory = Join-Path $assetRoot 'windowView/optimized'
New-Item -ItemType Directory -Force $outputDirectory | Out-Null
$jpegEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
function Save-ScaledImage($source, $width, $destination, $quality) {
    $height = [int][Math]::Round($source.Height * $width / $source.Width)
    $bitmap = New-Object System.Drawing.Bitmap($width, $height)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
        $graphics.Clear([System.Drawing.Color]::FromArgb(245,239,235))
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.DrawImage($source, 0, 0, $width, $height)
        if ($destination.EndsWith('.png')) {
            $bitmap.Save($destination, [System.Drawing.Imaging.ImageFormat]::Png)
        } else {
            $parameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
            $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$quality)
            try { $bitmap.Save($destination, $jpegEncoder, $parameters) } finally { $parameters.Dispose() }
        }
    } finally { $graphics.Dispose(); $bitmap.Dispose() }
}
$views = @{
    'terrace' = 'Terrace Floor_Day.jpg'
    'floor-18' = '18th Floor_Day.jpg'
    'floor-13' = '13th Floor_Day.jpg'
    'floor-8' = '8th Floor_Day.jpg'
    'floor-5' = '5th Floor (AMENITY)_Day.jpg'
}
foreach ($entry in $views.GetEnumerator()) {
    $source = [System.Drawing.Image]::FromFile((Join-Path $assetRoot ('windowView/' + $entry.Value)))
    try {
        Save-ScaledImage $source 1024 (Join-Path $outputDirectory ($entry.Key + '-preview.jpg')) 78
        Save-ScaledImage $source 4096 (Join-Path $outputDirectory ($entry.Key + '.jpg')) 88
    } finally { $source.Dispose() }
}
$plan = [System.Drawing.Image]::FromFile((Join-Path $assetRoot 'plan/floor/floorPlan.png'))
try {
    $plan.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone)
    Save-ScaledImage $plan 2400 (Join-Path $assetRoot 'plan/floor/floorPlan-web.png') 90
} finally { $plan.Dispose() }
Get-ChildItem $outputDirectory | Select-Object Name,Length
Get-Item (Join-Path $assetRoot 'plan/floor/floorPlan-web.png') | Select-Object Name,Length

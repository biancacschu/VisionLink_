# Fix-TailwindCanonical.ps1
param(
  [string]$Root = "C:\Users\bianc\Downloads\VisionLink-V_WebApp"
)

$src = Join-Path $Root "src"
$files = Get-ChildItem -Path $src -Recurse -Include *.tsx,*.jsx -File

$changes = 0
foreach ($f in $files) {
  $text = Get-Content -Path $f.FullName -Raw -Encoding UTF8

  $new = $text `
    -replace 'min-h-\[80px\]', 'min-h-20' `
    -replace 'flex-shrink-0', 'shrink-0'

  if ($new -ne $text) {
    Set-Content -Path $f.FullName -Value $new -Encoding UTF8
    Write-Host "Updated:" $f.FullName
    $changes++
  }
}

if ($changes -eq 0) {
  Write-Host "No canonical Tailwind fixes found."
} else {
  Write-Host "✅ Applied $changes file update(s)."
}

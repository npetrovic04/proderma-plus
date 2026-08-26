# Skida sve fotografije sa starog proderma.rs u assets/img/
# Pokreni: desni klik -> "Run with PowerShell"
# ili:     powershell -ExecutionPolicy Bypass -File preuzmi-slike.ps1

$ErrorActionPreference = "Stop"
$base = "https://proderma.rs/wp-content/uploads/2022/07"
$dir  = Join-Path $PSScriptRoot "assets\img"
New-Item -ItemType Directory -Force -Path $dir | Out-Null

$map = @{
  "hero-levo.jpg" = "proderma-ord01-res.jpg"
  "hero-desno.jpg" = "VAK_6209.jpg"
  "ordinacija-01.jpg" = "proderma-ord01-res.jpg"
  "ordinacija-02.jpg" = "proderma-ord02.jpg"
  "ordinacija-03.jpg" = "proderma-ord03.jpg"
  "ivana-binic.jpg" = "ivana-binic-6186.jpg"
  "tim-ivana-binic.jpg" = "Ivana-Binic-01.jpg"
  "tim-milenko-stanojevic.jpg" = "milenko-01.jpg"
  "tim-vesna-karanikolic.jpg" = "vesna-01.jpg"
  "tim-masa-golubovic.jpg" = "Masa-01.jpg"
  "tim-nila-kucer.jpg" = "nila-01.jpg"
  "tim-anita-pavlovic.jpg" = "Anita-01.jpg"
  "tim-natalija-kovacevic.jpg" = "natalija-01.jpg"
  "galerija-01.jpg" = "img10.jpg"
  "galerija-02.jpg" = "img11.jpg"
  "galerija-03.jpg" = "VAK_6175.jpg"
  "galerija-04.jpg" = "VAK_6180.jpg"
  "galerija-05.jpg" = "VAK_6181.jpg"
  "galerija-06.jpg" = "VAK_6183.jpg"
  "galerija-07.jpg" = "VAK_6186.jpg"
  "galerija-08.jpg" = "VAK_6209.jpg"
  "galerija-09.jpg" = "VAK_6219.jpg"
  "galerija-10.jpg" = "img1.jpg"
  "galerija-11.jpg" = "img2.jpg"
  "galerija-12.jpg" = "img3.jpg"
  "galerija-13.jpg" = "img4.jpg"
  "galerija-14.jpg" = "img5.jpg"
  "galerija-15.jpg" = "img6.jpg"
  "galerija-16.jpg" = "img7.jpg"
  "galerija-17.jpg" = "img8.jpg"
  "galerija-18.jpg" = "img9.jpg"
  "utisak-jelica.jpg" = "testimonial-jelica-1.jpg"
  "utisak-milan.jpg" = "testimonial-milan.jpg"
}

$ok = 0; $fail = 0
foreach ($k in $map.Keys) {
  $out = Join-Path $dir $k
  $url = "$base/" + $map[$k]
  try {
    Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing -TimeoutSec 30
    Write-Host ("  OK   " + $k) -ForegroundColor Green; $ok++
  } catch {
    Write-Host ("  PUKLO " + $k + "  <- " + $url) -ForegroundColor Red; $fail++
  }
}
Write-Host ""
Write-Host ("Skinuto: " + $ok + "   Neuspelo: " + $fail)
Write-Host "Slike su u assets\img\. Sajt ih od sada koristi lokalno."
Write-Host ""
Write-Host "PREPORUKA pre objave: konvertuj ih u WebP i smanji na max 1600px sirine."
Read-Host "Pritisni Enter za kraj"
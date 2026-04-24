$ErrorActionPreference = "Stop"

$envCandidates = @(
  (Join-Path -Path $PSScriptRoot -ChildPath ".env")
  (Join-Path -Path (Split-Path -Path $PSScriptRoot -Parent) -ChildPath ".env")
)

foreach ($envFile in $envCandidates) {
  if (-not (Test-Path $envFile)) { continue }
  Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if (-not $line) { return }
    if ($line.StartsWith("#")) { return }
    $parts = $line.Split("=", 2)
    if ($parts.Length -ne 2) { return }
    $key = $parts[0].Trim()
    $value = $parts[1].Trim()
    if (-not $key) { return }
    Set-Item -Path "Env:$key" -Value $value
  }
  break
}

$candidateRoots = @(
  "C:\\Program Files\\Eclipse Adoptium",
  "C:\\Program Files\\Adoptium",
  "C:\\Program Files\\Java"
)

$jdk = $null

foreach ($root in $candidateRoots) {
  if (-not (Test-Path $root)) { continue }
  $match = Get-ChildItem -Path $root -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like "jdk-21*" } |
    Select-Object -First 1
  if ($match) { $jdk = $match.FullName; break }
}

if (-not $jdk) {
  throw "JDK 21 not found. Install it, then re-run. (Expected under one of: $($candidateRoots -join ', '))"
}

$env:JAVA_HOME = $jdk
$env:Path = "$env:JAVA_HOME\\bin;$env:Path"

Write-Host "JAVA_HOME=$env:JAVA_HOME"
javac -version
java -version

if (-not $env:MONGODB_URI) {
  Write-Host "MONGODB_URI is not set. Falling back to the default in application.properties (mongodb://localhost:27017/unisphere)."
} else {
  $maskedMongo = $env:MONGODB_URI
  $maskedMongo = $maskedMongo -replace "://([^:]+):([^@]+)@", "://`$1:***@"
  Write-Host "MONGODB_URI=$maskedMongo"
}

& .\\mvnw spring-boot:run

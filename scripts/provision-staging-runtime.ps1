param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[a-zA-Z0-9._-]+$')]
  [string]$SshTarget,

  [string]$DopplerProject = 'ams-realty-platform-starter',
  [string]$DopplerConfig = 'stg'
)

$ErrorActionPreference = 'Stop'
$remotePath = "/tmp/ams-realty-platform-starter-runtime-$([guid]::NewGuid().ToString('N')).env"
$temporaryPath = Join-Path ([IO.Path]::GetTempPath()) "ams-realty-platform-starter-$([guid]::NewGuid().ToString('N')).env"
$uploaded = $false

try {
  $environment = & doppler secrets download --project $DopplerProject --config $DopplerConfig --format env --no-file --silent
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($environment)) {
    throw 'Doppler runtime export failed.'
  }

  [IO.File]::WriteAllText($temporaryPath, ($environment -join "`n") + "`n", [Text.UTF8Encoding]::new($false))
  & scp -q $temporaryPath "${SshTarget}:$remotePath"
  if ($LASTEXITCODE -ne 0) { throw 'Runtime upload failed.' }
  $uploaded = $true

  & ssh $SshTarget "install -o root -g ams-realty-platform-starter -m 0640 '$remotePath' /etc/ams-realty-platform-starter/runtime.env && rm -f '$remotePath'"
  if ($LASTEXITCODE -ne 0) { throw 'Secure runtime install failed.' }

  Write-Output 'runtime_env_installed=true'
} finally {
  if (Test-Path -LiteralPath $temporaryPath) {
    Remove-Item -LiteralPath $temporaryPath -Force
  }
  if ($uploaded) {
    & ssh $SshTarget "rm -f '$remotePath'" 2>$null
  }
}

param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[a-zA-Z0-9._-]+$')]
  [string]$SshTarget,

  [string]$DopplerProject = 'atlas-realty',
  [string]$DopplerConfig = 'prd'
)

$ErrorActionPreference = 'Stop'
$serviceToken = $env:DOPPLER_TOKEN
if ([string]::IsNullOrWhiteSpace($serviceToken) -or -not $serviceToken.StartsWith('dp.st.')) {
  throw 'A config-scoped Doppler service token is required in DOPPLER_TOKEN.'
}
$nonce = [guid]::NewGuid().ToString('N')
$remotePath = "/tmp/atlas-realty-runtime-$nonce.env"
$remoteMigrationPath = "/tmp/atlas-realty-migration-$nonce.env"
$remoteBootstrapPath = "/tmp/atlas-realty-bootstrap-$nonce.env"
$remoteBackupPath = "/tmp/atlas-realty-backup-$nonce.env"
$temporaryPath = Join-Path ([IO.Path]::GetTempPath()) "atlas-realty-$nonce.env"
$temporaryMigrationPath = Join-Path ([IO.Path]::GetTempPath()) "atlas-realty-migration-$nonce.env"
$temporaryBootstrapPath = Join-Path ([IO.Path]::GetTempPath()) "atlas-realty-bootstrap-$nonce.env"
$temporaryBackupPath = Join-Path ([IO.Path]::GetTempPath()) "atlas-realty-backup-$nonce.env"
$uploaded = $false

try {
  $environment = & doppler secrets download --project $DopplerProject --config $DopplerConfig --format env --no-file --silent
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($environment)) {
    throw 'Doppler runtime export failed.'
  }

  $migrationLine = $environment | Where-Object { $_ -match '^MIGRATION_DATABASE_URL=' }
  if (-not $migrationLine) { throw 'MIGRATION_DATABASE_URL is missing from Doppler.' }
  $bootstrapLines = $environment | Where-Object { $_ -match '^BOOTSTRAP_OWNER_(USERNAME|PASSWORD|NAME)=' }
  if ($bootstrapLines.Count -ne 3) { throw 'The three BOOTSTRAP_OWNER_* values are required in Doppler.' }
  $backupLines = $environment | Where-Object { $_ -match '^BACKUP_(S3_BUCKET|AGE_RECIPIENT|AGE_IDENTITY_B64)=' }
  if ($backupLines.Count -ne 3) { throw 'BACKUP_S3_BUCKET and both BACKUP_AGE_* values are required in Doppler.' }
  $runtimeLines = $environment | Where-Object {
    $_ -notmatch '^MIGRATION_DATABASE_URL=' -and $_ -notmatch '^BOOTSTRAP_OWNER_' -and $_ -notmatch '^BACKUP_'
  }
  [IO.File]::WriteAllText($temporaryPath, ($runtimeLines -join "`n") + "`n", [Text.UTF8Encoding]::new($false))
  [IO.File]::WriteAllText($temporaryMigrationPath, ($migrationLine -join "`n") + "`n", [Text.UTF8Encoding]::new($false))
  [IO.File]::WriteAllText($temporaryBootstrapPath, ($bootstrapLines -join "`n") + "`n", [Text.UTF8Encoding]::new($false))
  [IO.File]::WriteAllText($temporaryBackupPath, ($backupLines -join "`n") + "`n", [Text.UTF8Encoding]::new($false))
  & scp -q $temporaryPath "${SshTarget}:$remotePath"
  if ($LASTEXITCODE -ne 0) { throw 'Runtime upload failed.' }
  & scp -q $temporaryMigrationPath "${SshTarget}:$remoteMigrationPath"
  if ($LASTEXITCODE -ne 0) { throw 'Migration environment upload failed.' }
  & scp -q $temporaryBootstrapPath "${SshTarget}:$remoteBootstrapPath"
  if ($LASTEXITCODE -ne 0) { throw 'Bootstrap environment upload failed.' }
  & scp -q $temporaryBackupPath "${SshTarget}:$remoteBackupPath"
  if ($LASTEXITCODE -ne 0) { throw 'Backup environment upload failed.' }
  $uploaded = $true

  & ssh $SshTarget "install -o root -g atlas-realty -m 0640 '$remotePath' /etc/ams-platform/atlas-realty/runtime.env && install -o root -g root -m 0600 '$remoteMigrationPath' /etc/ams-platform/atlas-realty/migration.env && install -o root -g root -m 0600 '$remoteBootstrapPath' /etc/ams-platform/atlas-realty/bootstrap.env && install -o root -g root -m 0600 '$remoteBackupPath' /etc/ams-platform/atlas-realty/backup.env && rm -f '$remotePath' '$remoteMigrationPath' '$remoteBootstrapPath' '$remoteBackupPath'"
  if ($LASTEXITCODE -ne 0) { throw 'Secure runtime install failed.' }

  Write-Output 'runtime_env_installed=true'
} finally {
  if (Test-Path -LiteralPath $temporaryPath) {
    Remove-Item -LiteralPath $temporaryPath -Force
  }
  if (Test-Path -LiteralPath $temporaryMigrationPath) {
    Remove-Item -LiteralPath $temporaryMigrationPath -Force
  }
  if (Test-Path -LiteralPath $temporaryBootstrapPath) {
    Remove-Item -LiteralPath $temporaryBootstrapPath -Force
  }
  if (Test-Path -LiteralPath $temporaryBackupPath) {
    Remove-Item -LiteralPath $temporaryBackupPath -Force
  }
  if ($uploaded) {
    & ssh $SshTarget "rm -f '$remotePath' '$remoteMigrationPath' '$remoteBootstrapPath' '$remoteBackupPath'" 2>$null
  }
}

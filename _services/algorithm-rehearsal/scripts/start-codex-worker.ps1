param([Parameter(Mandatory=$true)][string]$Until)
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
Start-Process -FilePath pwsh.exe -ArgumentList @('-NoProfile','-File',"$PSScriptRoot/keep-awake.ps1",'-Until',$Until) -WindowStyle Hidden
& npx.cmd --yes vercel env run -e production --scope sangdons-projects -- node scripts/codex-worker.mjs "--until=$Until"
exit $LASTEXITCODE

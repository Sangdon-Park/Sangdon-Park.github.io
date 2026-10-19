param([Parameter(Mandatory=$true)][string]$Until)
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
& npx.cmd --yes vercel env run -e production --scope sangdons-projects -- node scripts/codex-worker.mjs "--until=$Until"
exit $LASTEXITCODE

# Local entry point: choose the tested runtime without changing PATH or profiles.
$Arguments = @($args)
$ErrorActionPreference = 'Stop'
$cecUtf8 = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = $cecUtf8
[Console]::InputEncoding = $cecUtf8
[Console]::OutputEncoding = $cecUtf8
# Capture request input before probing native executables: PowerShell can forward
# and consume redirected stdin even when a version-probe process never reads it.
$cecHasInput = $Arguments.Count -gt 1 -and $Arguments[0] -eq 'internal' -and $Arguments[1] -in @('draft','approve','inspect','receipt')
$cecInputText = $null
if ($cecHasInput -and $MyInvocation.ExpectingInput) { $cecInputText = @($input) -join "`n" }
elseif ($cecHasInput -and [Console]::IsInputRedirected) { $cecInputText = [Console]::In.ReadToEnd() }
$cecPinned = (Get-Content -LiteralPath (Join-Path $PSScriptRoot '.node-version') -Raw).Trim()
$cecCandidates = @()
if ($env:CEC_NODE) { $cecCandidates += $env:CEC_NODE }
if ($env:USERPROFILE) { $cecCandidates += Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' }
$cecOnPath = Get-Command node.exe -ErrorAction SilentlyContinue
if ($cecOnPath) { $cecCandidates += $cecOnPath.Source }
$cecExecutable = $null
foreach ($cecCandidate in ($cecCandidates | Select-Object -Unique)) {
    if (!(Test-Path -LiteralPath $cecCandidate -PathType Leaf)) { continue }
    try { $cecVersion = & $cecCandidate --version 2>$null } catch { continue }
    if ($LASTEXITCODE -eq 0 -and $cecVersion -eq "v$cecPinned") { $cecExecutable = $cecCandidate; break }
}
if (!$cecExecutable) { throw "CEC requires Node $cecPinned. Select the tested runtime or set CEC_NODE to its executable. Global settings were not changed." }
if ($Arguments.Count -eq 1 -and $Arguments[0] -eq 'check') {
    & $cecExecutable (Join-Path $PSScriptRoot 'scripts\check.mjs')
} else {
    $cecEntry = Join-Path $PSScriptRoot 'dist\src\cli\main.js'
    if (!(Test-Path -LiteralPath $cecEntry -PathType Leaf)) { throw 'Build CEC once using cec.ps1 check before starting the skill.' }
    if ($null -ne $cecInputText) { $cecInputText | & $cecExecutable $cecEntry @Arguments }
    else { & $cecExecutable $cecEntry @Arguments }
}
exit $LASTEXITCODE

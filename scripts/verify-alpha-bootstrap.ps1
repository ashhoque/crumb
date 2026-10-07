# Native Windows bootstrap tests with synthetic Git/npm/Node/Codex adapters.
# No downloads, global configuration writes or authenticated model calls.
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$fixture = Join-Path $root '.m0-local\bootstrap with spaces'
New-Item -ItemType Directory -Force -Path $fixture | Out-Null
$batch = Join-Path $fixture 'setup.bat'
$original = [IO.File]::ReadAllText((Join-Path $root 'setup.bat'))
$split = $original.LastIndexOf('# CRUMB_POWERSHELL') + 18
$body = $original.Substring($split)
$body = $body.Replace("([Environment]::GetFolderPath('LocalApplicationData'))", '$env:CRUMB_TEST_BASE')
$body = $body.Replace("Read-Host 'Press Enter to close' | Out-Null", '# Error visible to test harness')
$adapters = @'
function git {
    if ($args -contains 'clone') {
        if ($env:CRUMB_TEST_MODE -eq 'downloadFailure') { $global:LASTEXITCODE = 7; return }
        New-Item -ItemType Directory -Force -Path (Join-Path $args[-1] '.git') | Out-Null
        Set-Content -LiteralPath (Join-Path $args[-1] '.node-version') -Value '24.19.0'
    } elseif ($args -contains 'get-url') { 'https://github.com/ashhoque/crumb.git' }
    elseif ($args -contains '--show-current') { 'alpha-testing-layer' }
    elseif ($args -contains 'status' -and $env:CRUMB_TEST_MODE -eq 'dirty') { ' M edited.txt' }
    $global:LASTEXITCODE = 0
}
function npm.cmd { $global:LASTEXITCODE = 0; if ($env:CRUMB_TEST_MODE -eq 'dependencyFailure') { $global:LASTEXITCODE = 9 } }
function node {
    $global:LASTEXITCODE = 0
    if ($args -contains '--version') {
        if ($env:CRUMB_TEST_MODE -eq 'wrongNode') { 'v18.17.0' } else { 'v24.19.0' }
    } elseif ($args[0] -like '*launch-alpha.mjs') {
        Test-CrumbCodex -C $env:CRUMB_ALPHA_WORKSPACE '$crumb Welcome me'
    } elseif ($env:CRUMB_TEST_MODE -eq 'verificationFailure') { $global:LASTEXITCODE = 8 }
}
function Get-Command {
    param($Name)
    if ($env:CRUMB_TEST_MODE -eq 'missingPrerequisite' -and $Name -eq 'git') { return }
    Microsoft.PowerShell.Core\Get-Command $Name
}
function Test-CrumbCodex {
    [IO.File]::WriteAllText((Join-Path $env:CRUMB_TEST_BASE 'launch.json'), (ConvertTo-Json -InputObject @($args)))
    $global:LASTEXITCODE = 0
    if ($env:CRUMB_TEST_MODE -eq 'launchFailure') { $global:LASTEXITCODE = 6 }
}
'@
[IO.File]::WriteAllText($batch, ($original.Substring(0, $split) + "`r`n" + $adapters + "`r`n" + $body).Replace("`r`n", "`n").Replace("`n", "`r`n"), [Text.Encoding]::ASCII)
foreach ($mode in @('fresh', 'repeat', 'downloadFailure', 'dependencyFailure', 'verificationFailure', 'dirty', 'launchFailure', 'wrongNode', 'missingPrerequisite')) {
    $env:CRUMB_TEST_MODE = $mode
    $env:CRUMB_TEST_BASE = Join-Path $fixture $(if ($mode -in @('repeat', 'dirty')) { 'fresh' } else { $mode + '-' + [guid]::NewGuid().ToString('N') })
    if ($mode -eq 'fresh') { $repeatBase = $env:CRUMB_TEST_BASE }
    if ($mode -in @('repeat', 'dirty')) { $env:CRUMB_TEST_BASE = $repeatBase }
    New-Item -ItemType Directory -Force -Path $env:CRUMB_TEST_BASE | Out-Null
    $launch = Join-Path $env:CRUMB_TEST_BASE 'launch.json'
    if (Test-Path -LiteralPath $launch) { Remove-Item -LiteralPath $launch }
    $output = & $env:ComSpec /d /c "`"$batch`"" 2>&1
    $code = $LASTEXITCODE
    $ready = ($output -join "`n").Contains('Crumb is ready!')
    if ($mode -in @('fresh', 'repeat')) {
        if ($code -ne 0 -or !$ready -or !(Test-Path -LiteralPath $launch)) { throw "$mode failed: $output" }
        $argsRead = Get-Content -LiteralPath $launch -Raw | ConvertFrom-Json
        if ($argsRead[0] -ne '-C' -or $argsRead[-1] -notlike '$crumb *') { throw 'Codex launch args lost activation or workspace' }
    } else {
        if ($code -eq 0) { throw "$mode reported success" }
        if ($mode -ne 'launchFailure' -and ($ready -or (Test-Path -LiteralPath $launch))) { throw "$mode printed success or launched before verification" }
    }
    Write-Output "$mode passed (synthetic adapters; native cmd.exe and Windows PowerShell)"
}

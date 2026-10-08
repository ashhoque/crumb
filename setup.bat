@echo off
setlocal DisableDelayedExpansion
set "CRUMB_SETUP_FILE=%~f0"
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "$s=[IO.File]::ReadAllText($env:CRUMB_SETUP_FILE); & ([scriptblock]::Create($s.Substring($s.LastIndexOf('# CRUMB_POWERSHELL')+18)))"
exit /b %errorlevel%
# CRUMB_POWERSHELL
$ErrorActionPreference = 'Stop'
$env:GIT_TERMINAL_PROMPT = '0'
$env:GCM_INTERACTIVE = 'Never'
function Invoke-CrumbCommand($Executable, $Arguments) {
    # Git progress on stderr is normal. PowerShell 5.1 wraps it as ErrorRecords.
    $ErrorActionPreference = 'Continue'
    & $Executable @Arguments >> $script:CrumbLog 2>&1
    if ($LASTEXITCODE -ne 0) { throw "$Executable failed (exit $LASTEXITCODE). See $script:CrumbLog" }
}
try {
    Write-Host 'Welcome to Crumb Alpha!'
    foreach ($name in @('git', 'node', 'npm.cmd', 'codex')) {
        if (!(Get-Command $name -ErrorAction SilentlyContinue)) { throw "Missing prerequisite: $name. Crumb requires working Git, Node, npm and authenticated Codex." }
    }
    $env:CRUMB_CODEX = (Get-Command codex).Source
    $base = Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'CrumbAlpha'
    New-Item -ItemType Directory -Force -Path $base | Out-Null
    $script:CrumbLog = Join-Path $base 'setup.log'
    $repo = Join-Path $base 'runtime'
    $env:CRUMB_ALPHA_WORKSPACE = Join-Path $base 'workspace'
    $lock = [IO.File]::Open((Join-Path $base 'setup.lock'), 'OpenOrCreate', 'ReadWrite', 'None')
    Set-Content -LiteralPath $script:CrumbLog -Value 'Crumb Alpha installation' -Encoding UTF8
    Write-Host '[1/5] Downloading Crumb...'
    if (Test-Path -LiteralPath $repo) {
        if (!(Test-Path -LiteralPath (Join-Path $repo '.git'))) { throw "Installation path is occupied: $repo" }
        $origin = & git -C $repo remote get-url origin 2>> $script:CrumbLog
        if ($LASTEXITCODE -ne 0 -or $origin -ne 'https://github.com/ashhoque/crumb.git') { throw 'Existing installation has an unexpected Git origin.' }
        $branch = & git -C $repo branch --show-current 2>> $script:CrumbLog
        $dirty = & git -C $repo status --porcelain --untracked-files=normal 2>> $script:CrumbLog
        if ($LASTEXITCODE -ne 0 -or $branch -ne 'alpha-testing-layer' -or $dirty) { throw 'Existing runtime contains user changes or another branch; preserving it.' }
        Invoke-CrumbCommand git @('-C', $repo, 'fetch', 'origin', 'alpha-testing-layer')
        Invoke-CrumbCommand git @('-C', $repo, 'merge', '--ff-only', 'FETCH_HEAD')
    } else {
        $download = Join-Path $base ('download-' + [guid]::NewGuid().ToString('N'))
        Invoke-CrumbCommand git @('clone', '--depth=1', '--branch', 'alpha-testing-layer', '--single-branch', 'https://github.com/ashhoque/crumb.git', $download)
        Move-Item -LiteralPath $download -Destination $repo
    }
    $requiredNode = (Get-Content -LiteralPath (Join-Path $repo '.node-version') -Raw).Trim()
    $actualNode = & node --version
    if ($LASTEXITCODE -ne 0 -or $actualNode -ne ('v' + $requiredNode)) { throw "Crumb requires the already-installed Node $requiredNode on PATH; found $actualNode. No prerequisite installer was started." }
    Write-Host '[2/5] Installing dependencies...'
    Push-Location -LiteralPath $repo
    try { Invoke-CrumbCommand npm.cmd @('run', 'setup', '--', '--quiet') } finally { Pop-Location }
    New-Item -ItemType Directory -Force -Path $env:CRUMB_ALPHA_WORKSPACE | Out-Null
    & node (Join-Path $repo 'scripts\install-alpha.mjs')
    if ($LASTEXITCODE -ne 0) { throw "Crumb verification failed. See the error above and $script:CrumbLog" }
    Write-Host 'Crumb is ready!'
    $lock.Dispose()
    # Direct argv preserves quotes and spaces; inherit this visible console.
    & node (Join-Path $repo 'scripts\launch-alpha.mjs')
    if ($LASTEXITCODE -ne 0) { throw "Codex exited with code $LASTEXITCODE." }
    exit 0
} catch {
    Write-Host ('Crumb setup failed: ' + $_.Exception.Message) -ForegroundColor Red
    if ($lock) { $lock.Dispose() }
    # Keep double-click failures visible; this is an error acknowledgement only.
    Read-Host 'Press Enter to close' | Out-Null
    exit 1
}

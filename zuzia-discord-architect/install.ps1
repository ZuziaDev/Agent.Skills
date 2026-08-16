$ErrorActionPreference = "Stop"

$Source = Split-Path -Parent $MyInvocation.MyCommand.Path
$Destination = Join-Path $HOME ".agents\skills\zuzia-discord-architect"

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $Destination) | Out-Null

if (Test-Path $Destination) {
    Remove-Item -Recurse -Force $Destination
}

Copy-Item -Recurse -Force $Source $Destination

Write-Host "Installed Zuzia Discord Architect to $Destination"
Write-Host "Restart Codex if the skill does not appear automatically."

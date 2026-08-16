param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("vault_list", "vault_read", "vault_search", "vault_write", "vault_move", "vault_delete", "vault_stats")]
    [string]$Tool,

    [string]$ArgumentsJson = "{}"
)

$ErrorActionPreference = "Stop"

function Get-Setting {
    param([Parameter(Mandatory = $true)][string]$Name)

    $value = [Environment]::GetEnvironmentVariable($Name, "Process")
    if ([string]::IsNullOrWhiteSpace($value)) {
        $value = [Environment]::GetEnvironmentVariable($Name, "User")
    }
    return $value
}

function Read-McpResponse {
    param([Parameter(Mandatory = $true)][string]$Content)

    $dataLines = $Content -split "`r?`n" | Where-Object { $_ -like "data:*" }
    $json = if ($dataLines.Count -gt 0) {
        ($dataLines | ForEach-Object { $_.Substring(5).Trim() }) -join ""
    } else {
        $Content
    }
    return $json | ConvertFrom-Json
}

$token = Get-Setting "ZUZIA_BRAIN_KEY"
if ([string]::IsNullOrWhiteSpace($token)) {
    throw "ZUZIA_BRAIN_KEY is missing from Process and User environment scopes."
}

$url = Get-Setting "ZUZIA_BRAIN_MCP_URL"
if ([string]::IsNullOrWhiteSpace($url)) {
    $url = "https://zuzia-brain.zuzia.dev/mcp"
}

$arguments = $ArgumentsJson | ConvertFrom-Json
$headers = @{
    Authorization = "Bearer $token"
    Accept = "application/json, text/event-stream"
}

$initializeBody = @{
    jsonrpc = "2.0"
    id = 1
    method = "initialize"
    params = @{
        protocolVersion = "2025-03-26"
        capabilities = @{}
        clientInfo = @{ name = "zuzia-brain-skill"; version = "1.0.0" }
    }
} | ConvertTo-Json -Depth 12 -Compress

$initializeResponse = Invoke-WebRequest -Method Post -Uri $url -Headers $headers -ContentType "application/json" -Body $initializeBody
$initialize = Read-McpResponse $initializeResponse.Content
if ($initialize.error) {
    throw "MCP initialize failed: $($initialize.error.message)"
}

$callBody = @{
    jsonrpc = "2.0"
    id = 2
    method = "tools/call"
    params = @{ name = $Tool; arguments = $arguments }
} | ConvertTo-Json -Depth 20 -Compress

$callResponse = Invoke-WebRequest -Method Post -Uri $url -Headers $headers -ContentType "application/json" -Body $callBody
$call = Read-McpResponse $callResponse.Content
if ($call.error) {
    throw "MCP tool call failed: $($call.error.message)"
}

$call.result.content | Where-Object { $_.type -eq "text" } | ForEach-Object {
    if ($Tool -ne "vault_list") {
        $_.text
        return
    }

    $list = $_.text | ConvertFrom-Json
    $files = @($list.files)
    if ($arguments.PSObject.Properties.Name -contains "prefix" -and $arguments.prefix) {
        $files = @($files | Where-Object { $_.StartsWith([string]$arguments.prefix) })
    }
    if ($arguments.PSObject.Properties.Name -contains "limit" -and $arguments.limit) {
        $limit = [Math]::Min([Math]::Max([int]$arguments.limit, 1), 500)
        $files = @($files | Select-Object -First $limit)
    }
    @{ count = $files.Count; files = $files } | ConvertTo-Json -Depth 5
}

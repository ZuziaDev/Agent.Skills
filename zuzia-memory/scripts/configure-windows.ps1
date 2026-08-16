param(
    [Parameter(Mandatory)]
    [ValidatePattern("^https://")]
    [string]$ApiUrl,

    [string]$UserId = "zuzia"
)

$ErrorActionPreference = "Stop"

while ($true) {
    $secureToken = Read-Host "Yalnizca zuzia_mem_ ile baslayan tam tokeni girin" -AsSecureString
    $tokenPointer = [IntPtr]::Zero
    $token = $null

    try {
        $tokenPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
        $token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($tokenPointer)

        if ($token -notmatch "^zuzia_mem_[A-Fa-f0-9]{32}$") {
            Write-Warning "Token bicimi gecersiz. Tam degeri yeniden girin."
            continue
        }

        [Environment]::SetEnvironmentVariable("ZUZIA_MEMORY_API_URL", $ApiUrl.TrimEnd("/"), "User")
        [Environment]::SetEnvironmentVariable("ZUZIA_MEMORY_API_TOKEN", $token, "User")
        [Environment]::SetEnvironmentVariable("ZUZIA_MEMORY_USER_ID", $UserId, "User")

        Write-Host "Zuzia Memory ayarlari bu Windows kullanicisi icin kaydedildi." -ForegroundColor Green
        break
    }
    finally {
        if ($tokenPointer -ne [IntPtr]::Zero) {
            [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($tokenPointer)
        }

        $token = $null
        $secureToken = $null
    }
}

Read-Host "Pencereyi kapatmak icin Enter tusuna basin"

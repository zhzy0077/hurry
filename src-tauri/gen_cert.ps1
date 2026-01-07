$cert = New-SelfSignedCertificate -CertStoreLocation Cert:\CurrentUser\My -Subject "CN=HurryDev" -Type CodeSigningCert -KeyUsage DigitalSignature

# 1. Export Public Key (Safe to share, needed for other devices)
$destCer = Join-Path $PSScriptRoot "..\hurry_trusted_root.cer"
Export-Certificate -Cert $cert -FilePath $destCer

# 2. Export Private Key (BACKUP - Keep Secure! Password: 'hurry')
# This file allows you to restore the certificate if you lose your disk.
$destPfx = Join-Path $PSScriptRoot "..\hurry_private_key_backup.pfx"
$password = ConvertTo-SecureString -String "123456" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath $destPfx -Password $password

Write-Host "----------------------------------------------------------------"
Write-Host "Certificate Generated & Backed Up!"
Write-Host "Thumbprint: $($cert.Thumbprint)"
Write-Host ""
Write-Host "Public Key:  $destCer"
Write-Host "             (Install this on other devices to trust the app)"
Write-Host ""
Write-Host "Private Key: $destPfx"
Write-Host "             (BACKUP THIS FILE!)"
Write-Host "----------------------------------------------------------------"
Write-Host "1. Paste Thumbprint in 'src-tauri/tauri.conf.json'"
Write-Host "2. Run 'bun run tauri build'"


Write-Host "Or manual signing"
Write-Host "C:\Program Files (x86)\Windows Kits\10\bin\10.0.26100.0\x64\signtool.exe" sign /sha1 44AFC0BD6888FFD5CF580C8B8EAAD58CEF2C6722 /fd sha256 /tr http://timestamp.digicert.com /td sha256 /v "hurry.exe"
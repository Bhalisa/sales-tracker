# Security & Signing Setup (Optional)

This guide explains how to configure GitHub Secrets to enable automated, signed Android builds. This is **optional**; if skipped, the workflow will still produce Debug and Unsigned Release APKs.

## 1. Generate a Keystore
If you don't have one, generate a new keystore file:

```bash
keytool -genkey -v -keystore sales-tracker.jks -alias sales-tracker -keyalg RSA -keysize 2048 -validity 10000
```
*Note: Keep this file safe and remember the passwords. If you lose it, you cannot update your app on the Play Store.*

## 2. Encode the Keystore
GitHub Secrets only accept text. You must encode your binary keystore file to Base64:

### Windows (PowerShell):
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("sales-tracker.jks")) | Out-File -FilePath keystore_base64.txt
```

### macOS / Linux:
```bash
base64 -i sales-tracker.jks | pbcopy # Copies to clipboard
```

## 3. Add GitHub Secrets
Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.

Add the following secrets:

| Secret Name | Description |
| :--- | :--- |
| `SIGNING_KEY` | The entire content of `keystore_base64.txt` (the Base64 string) |
| `ALIAS` | The alias you used (e.g., `sales-tracker`) |
| `KEY_STORE_PASSWORD` | The password for the keystore |
| `KEY_PASSWORD` | The password for the key (usually same as keystore) |

## 4. Verify
Once secrets are added, the next GitHub Actions run will automatically:
1. Decode the keystore.
2. Sign the Release APK.
3. Upload the signed APK as an artifact named `sales-tracker-vX.X.X-release-signed`.

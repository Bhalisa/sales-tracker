# Cloud Build Solution Task List

## phase 1: GitHub Actions Foundations
- [x] Basic Debug APK build workflow
- [x] Add Linting check to workflow
- [x] Implement Release APK build (unsigned)
- [x] Automated versioning integration from `package.json`
- [x] Dynamic artifact naming with version & timestamp

## Phase 2: Security & Optional Signing
- [x] Secure Keystore management via GitHub Secrets (Optional)
- [x] Automated Release Signing (Conditional)
- [x] Environment variable injection for build configurations

## Phase 3: Distribution & optimization
- [x] Automatic GitHub Release creation on tag push
- [ ] APK size report in PR comments
- [x] Build caching for faster execution times

## Phase 4: branding & Whitelabeling
- [x] Dynamic branding injection via build parameters
- [x] Support for multiple business configurations using CI secrets

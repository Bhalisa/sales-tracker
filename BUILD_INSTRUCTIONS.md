# Building the Sales Tracker Android APK

This guide explains how to build the Sales Tracker app as an Android APK.

## Recommended: Cloud Build (No Installation Required)

The easiest way to build the APK is using the built-in **GitHub Actions** workflow. This requires no local installation of Android Studio or Java.

### Steps to Build in the Cloud:

1.  **Push your code to GitHub:**
    - Initialize a git repository if you haven't: `git init`
    - Create a new repository on GitHub.
    - Add the remote: `git remote add origin YOUR_GITHUB_REPO_URL`
    - Commit and push:
      ```bash
      git add .
      git commit -m "feat: setup cloud build"
      git push -u origin main
      ```

2.  **Trigger the Build:**
    - Go to your repository on GitHub.
    - Click on the **"Actions"** tab.
    - Select **"Build Android APK"** from the sidebar.
    - Click **"Run workflow"** (or it will trigger automatically if you just pushed).

3.  **Download the APK:**
    - Wait for the **"Code Quality"** (lint) job to pass.
    - Wait for the **"Build Android"** job to complete (usually 3-5 minutes).
    - Click on the finished build run.
    - Scroll down to the **"Artifacts"** section.
    - You will see two artifacts:
        - `sales-tracker-vX.X.X-debug`: For development and testing.
        - `sales-tracker-vX.X.X-release-unsigned`: A production-ready build (requires signing before installation on some devices).
    - Download the desired artifact (a `.zip` file containing the APK).

---

## Alternative: Local Build (Requires Installation)

If you prefer to build locally, follow these steps. **Note: This requires about 5GB+ of disk space and local installation.**

### Prerequisites (Local Only)

Before building the APK locally, ensure you have the following installed:

1. **Node.js and npm**
2. **Java Development Kit (JDK) 17**
3. **Android Studio**


## Installing the APK

### On a Physical Device

1. **Enable Developer Options on your Android device:**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings → Developer Options
   - Enable "USB Debugging"

2. **Connect your device via USB**

3. **Install the APK:**
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

   Or simply copy the APK file to your device and open it to install.

### On an Emulator

1. **Start an emulator from Android Studio:**
   - Tools → Device Manager → Create Device (if needed)
   - Start the emulator

2. **Install the APK:**
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

## Building a Release APK (For Distribution)

### 1. Generate a Signing Key

```bash
keytool -genkey -v -keystore sales-tracker-release.keystore -alias sales-tracker -keyalg RSA -keysize 2048 -validity 10000
```

**Important:** Save the keystore file and remember the passwords!

### 2. Configure Signing in Android Studio

1. Open `android/app/build.gradle`
2. Add signing configuration (or use Android Studio's GUI: Build → Generate Signed Bundle/APK)

### 3. Build Release APK

In Android Studio:
- Build → Generate Signed Bundle / APK
- Select APK
- Choose your keystore and enter passwords
- Select "release" build variant
- Click Finish

Or via command line:
```bash
cd android
.\gradlew.bat assembleRelease
```

Release APK location:
```
android/app/build/outputs/apk/release/app-release.apk
```

## Quick Reference Commands

```bash
# Build web assets only
npm run build

# Build web assets and sync to Android
npm run build:mobile

# Sync to Android without rebuilding
npm run cap:sync

# Open Android project in Android Studio
npm run cap:open:android

# Build and open in one command
npm run android:dev
```

## Troubleshooting

### "ANDROID_HOME not set" Error
- Set the ANDROID_HOME environment variable as described above
- Restart your terminal/IDE after setting environment variables

### "SDK location not found" Error
- Create `android/local.properties` file with:
  ```
  sdk.dir=C\:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
  ```

### Gradle Build Fails
- Open the project in Android Studio and let it download missing dependencies
- Check that you have the correct Android SDK version installed
- Try: File → Invalidate Caches / Restart in Android Studio

### "Could not find or load main class" Error
- Verify JAVA_HOME is set correctly
- Ensure JDK 11 or higher is installed

### App Crashes on Launch
- Check Android Studio's Logcat for error messages
- Ensure all web assets were built: `npm run build`
- Try a clean build: `cd android && .\gradlew.bat clean`

## App Configuration

The app is configured as a whitelabel solution. To customize for different businesses:

1. Edit `src/SalesTracker.jsx`:
   - Update `BRAND_CONFIG` object with business details
   - Change `businessId`, `businessName`, `primaryColor`, etc.
   - Update default products
   - Set hardcoded credentials

2. Rebuild the web assets:
   ```bash
   npm run build:mobile
   ```

3. Rebuild the APK using one of the methods above

## Notes

- **Debug APKs** are larger and not optimized. Use for testing only.
- **Release APKs** are optimized and smaller. Required for Google Play Store.
- The app stores data locally using localStorage. Data persists across app restarts.
- No internet connection is required for the app to function.
- CSV exports are saved to the device's Downloads folder.

## Support

For issues related to:
- **Web app functionality**: Check the React code in `src/`
- **Android build issues**: Check Android Studio logs and Gradle output
- **Capacitor issues**: Visit https://capacitorjs.com/docs

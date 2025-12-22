# 📱 Android APK Build Guide

## 🎯 Overview

This guide will help you build an Android APK from your Next.js AI Personal Assistant application.

---

## 📋 Prerequisites

Before building the APK, ensure you have the following installed:

### 1. **Node.js & npm**
- Node.js 18+ (check: `node --version`)
- npm 9+ (check: `npm --version`)

### 2. **Java Development Kit (JDK)**
- JDK 17 or higher
- Download: https://adoptium.net/
- Check: `java -version`

### 3. **Android Studio**
- Download: https://developer.android.com/studio
- Install Android SDK
- Install Android SDK Build-Tools
- Install Android SDK Platform-Tools

### 4. **Environment Variables**
Add these to your system environment variables:

**Windows:**
```
JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.x
ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
```

Add to PATH:
```
%JAVA_HOME%\bin
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

**macOS/Linux:**
```bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
```

---

## 🚀 Build Steps

### Step 1: Install Dependencies
```bash
cd AI-PA
npm install
```

### Step 2: Add Android Platform
```bash
npm run cap:add:android
```

This will:
- Create an `android` folder
- Set up the Android project structure
- Configure Gradle build files

### Step 3: Build Next.js Static Export
```bash
npm run export
```

This will:
- Build the Next.js app
- Generate static files in the `out` folder
- Optimize for production

### Step 4: Sync with Capacitor
```bash
npm run cap:sync
```

This will:
- Copy web assets to Android project
- Update native dependencies
- Configure plugins

### Step 5: Open in Android Studio
```bash
npm run cap:open:android
```

This will:
- Open the Android project in Android Studio
- Allow you to build and sign the APK

---

## 🔨 Building the APK in Android Studio

### Option 1: Debug APK (Quick Testing)

1. In Android Studio, click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Wait for the build to complete
3. Click **locate** in the notification to find the APK
4. APK location: `AI-PA/android/app/build/outputs/apk/debug/app-debug.apk`

### Option 2: Release APK (Production)

1. **Generate Signing Key:**
```bash
cd AI-PA/android/app
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configure Signing in Android Studio:**
   - Go to **Build** → **Generate Signed Bundle / APK**
   - Select **APK**
   - Choose your keystore file
   - Enter keystore password and key alias
   - Select **release** build variant
   - Click **Finish**

3. **APK Location:**
   - `AI-PA/android/app/build/outputs/apk/release/app-release.apk`

---

## 📦 Quick Build Commands

### All-in-One Build Command
```bash
npm run android:build
```

This runs:
1. `npm run export` - Build Next.js
2. `npx cap sync` - Sync with Capacitor
3. `npx cap copy android` - Copy to Android

### Open Android Studio
```bash
npm run android:open
```

---

## 🔧 Troubleshooting

### Issue 1: "JAVA_HOME not set"
**Solution:**
```bash
# Windows
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.0.x"

# macOS/Linux
export JAVA_HOME=/path/to/jdk
```

### Issue 2: "Android SDK not found"
**Solution:**
1. Open Android Studio
2. Go to **Tools** → **SDK Manager**
3. Install Android SDK Platform 33 or higher
4. Set ANDROID_HOME environment variable

### Issue 3: "Gradle build failed"
**Solution:**
```bash
cd AI-PA/android
./gradlew clean
./gradlew build
```

### Issue 4: "Out of memory"
**Solution:**
Edit `AI-PA/android/gradle.properties`:
```
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m
```

---

## 📱 Testing the APK

### Install on Physical Device
1. Enable **Developer Options** on your Android device
2. Enable **USB Debugging**
3. Connect device via USB
4. Run:
```bash
adb install AI-PA/android/app/build/outputs/apk/debug/app-debug.apk
```

### Install on Emulator
1. Open Android Studio
2. Go to **Tools** → **Device Manager**
3. Create/Start an emulator
4. Drag and drop the APK onto the emulator

---

## 🎨 Customization

### App Icon
Replace icons in:
```
AI-PA/android/app/src/main/res/
├── mipmap-hdpi/ic_launcher.png
├── mipmap-mdpi/ic_launcher.png
├── mipmap-xhdpi/ic_launcher.png
├── mipmap-xxhdpi/ic_launcher.png
└── mipmap-xxxhdpi/ic_launcher.png
```

### App Name
Edit `AI-PA/android/app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">AI Personal Assistant</string>
```

### Package Name
Edit `AI-PA/capacitor.config.ts`:
```typescript
appId: 'com.yourcompany.aipa',
```

---

## 📊 Build Variants

### Debug Build
- Faster build time
- Includes debugging symbols
- Larger file size
- For testing only

### Release Build
- Optimized and minified
- Smaller file size
- Requires signing
- For production distribution

---

## 🚀 Next Steps

After building the APK:

1. **Test thoroughly** on multiple devices
2. **Optimize performance** for mobile
3. **Add splash screen** and app icons
4. **Configure permissions** in AndroidManifest.xml
5. **Prepare for Play Store** (if publishing)

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Capacitor docs: https://capacitorjs.com/docs
3. Check Android Studio logs
4. Verify all prerequisites are installed

---

**Happy Building! 🎉**


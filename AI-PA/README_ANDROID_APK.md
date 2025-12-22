# 📱 AI Personal Assistant - Android APK Build

## 🎯 Quick Start

### **Option 1: Automated Build (Recommended)**

**Windows (Command Prompt):**
```bash
cd AI-PA
build-android.bat
```

**Windows (PowerShell):**
```powershell
cd AI-PA
.\build-android.ps1
```

This will automatically:
1. ✅ Check prerequisites
2. ✅ Install dependencies
3. ✅ Build Next.js app
4. ✅ Add Android platform
5. ✅ Sync with Capacitor
6. ✅ Open Android Studio

---

### **Option 2: Manual Build**

```bash
# 1. Install dependencies
npm install

# 2. Build Next.js app
npm run export

# 3. Add Android platform (first time only)
npm run cap:add:android

# 4. Sync with Capacitor
npm run cap:sync

# 5. Open Android Studio
npm run cap:open:android
```

---

## 📋 Prerequisites Checklist

Before building, ensure you have:

- [ ] **Node.js 18+** - [Download](https://nodejs.org/)
- [ ] **Java JDK 17+** - [Download](https://adoptium.net/)
- [ ] **Android Studio** - [Download](https://developer.android.com/studio)
- [ ] **Android SDK** (installed via Android Studio)
- [ ] **Environment Variables** configured (see below)

---

## 🔧 Environment Setup

### **Windows**

1. **Install JDK 17:**
   - Download from https://adoptium.net/
   - Install to default location

2. **Set Environment Variables:**
   - Press `Win + X` → System → Advanced system settings → Environment Variables
   - Add new System Variables:
     ```
     JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-17.0.x
     ANDROID_HOME = C:\Users\YourUsername\AppData\Local\Android\Sdk
     ```
   - Edit `Path` variable and add:
     ```
     %JAVA_HOME%\bin
     %ANDROID_HOME%\platform-tools
     %ANDROID_HOME%\tools
     ```

3. **Verify Installation:**
   ```bash
   java -version
   node --version
   npm --version
   ```

---

## 🏗️ Build Process

### **Step 1: Prepare the Project**

```bash
cd AI-PA
npm install
```

### **Step 2: Build Next.js Static Export**

```bash
npm run export
```

This creates an `out` folder with static files.

### **Step 3: Add Android Platform**

```bash
npm run cap:add:android
```

This creates the `android` folder with the native Android project.

### **Step 4: Sync Web Assets**

```bash
npm run cap:sync
```

This copies the `out` folder to the Android project.

### **Step 5: Build APK in Android Studio**

```bash
npm run cap:open:android
```

In Android Studio:
1. Wait for Gradle sync to complete (bottom status bar)
2. Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Wait for build to complete (~5-10 minutes first time)
4. Click **locate** in the notification
5. Find APK at: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📦 APK Locations

### **Debug APK** (for testing)
```
AI-PA/android/app/build/outputs/apk/debug/app-debug.apk
```

### **Release APK** (for production)
```
AI-PA/android/app/build/outputs/apk/release/app-release.apk
```

---

## 🚀 Installing the APK

### **On Physical Device**

1. Enable Developer Options:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings → Developer Options
   - Enable "USB Debugging"

2. Connect device via USB

3. Install APK:
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

### **On Emulator**

1. Open Android Studio
2. Click **Tools** → **Device Manager**
3. Create/Start an emulator
4. Drag and drop the APK file onto the emulator

---

## 🎨 Customization

### **Change App Name**

Edit `capacitor.config.ts`:
```typescript
appName: 'Your App Name',
```

### **Change Package ID**

Edit `capacitor.config.ts`:
```typescript
appId: 'com.yourcompany.yourapp',
```

### **Change App Icon**

Replace icons in:
```
android/app/src/main/res/
├── mipmap-hdpi/ic_launcher.png (72x72)
├── mipmap-mdpi/ic_launcher.png (48x48)
├── mipmap-xhdpi/ic_launcher.png (96x96)
├── mipmap-xxhdpi/ic_launcher.png (144x144)
└── mipmap-xxxhdpi/ic_launcher.png (192x192)
```

---

## 🔍 Troubleshooting

### **Error: "JAVA_HOME not set"**

**Solution:**
```bash
# Windows
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.0.x"

# Restart terminal and verify
echo %JAVA_HOME%
```

### **Error: "Android SDK not found"**

**Solution:**
1. Open Android Studio
2. Go to **Tools** → **SDK Manager**
3. Install "Android SDK Platform 33" or higher
4. Set ANDROID_HOME environment variable

### **Error: "Gradle build failed"**

**Solution:**
```bash
cd android
gradlew clean
gradlew build
```

### **Error: "Out of memory"**

**Solution:**
Edit `android/gradle.properties`:
```
org.gradle.jvmargs=-Xmx4096m
```

---

## 📊 Project Structure

```
AI-PA/
├── src/                    # Next.js source code
├── out/                    # Built static files (after npm run export)
├── android/                # Android native project (after cap add android)
├── capacitor.config.ts     # Capacitor configuration
├── next.config.ts          # Next.js configuration
├── build-android.bat       # Windows build script
├── build-android.ps1       # PowerShell build script
└── ANDROID_BUILD_GUIDE.md  # Detailed build guide
```

---

## ✅ Build Checklist

- [ ] Prerequisites installed (Node.js, JDK, Android Studio)
- [ ] Environment variables configured
- [ ] Dependencies installed (`npm install`)
- [ ] Next.js app built (`npm run export`)
- [ ] Android platform added (`npm run cap:add:android`)
- [ ] Assets synced (`npm run cap:sync`)
- [ ] Android Studio opened (`npm run cap:open:android`)
- [ ] Gradle sync completed
- [ ] APK built successfully
- [ ] APK tested on device/emulator

---

## 🎉 Success!

Once you have the APK:
1. ✅ Test on multiple devices
2. ✅ Check all features work offline
3. ✅ Verify permissions are correct
4. ✅ Test performance on low-end devices
5. ✅ Prepare for distribution (if needed)

---

**For detailed instructions, see [ANDROID_BUILD_GUIDE.md](./ANDROID_BUILD_GUIDE.md)**


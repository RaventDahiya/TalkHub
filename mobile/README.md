# TalkHub Mobile App - React Native CLI Android

This is the Android mobile client for TalkHub, built using React Native CLI (not Expo) and replicating the exact feature set and branding/design guidelines of the web application.

## Prerequisites

1. **Node.js**: Version 22.11.0 or higher.
2. **Android Development Environment**:
   - Android Studio installed.
   - Android SDK, Build Tools, Platform Tools installed.
   - An Android Virtual Device (AVD) running, or a physical Android device connected via USB debugging.
   - `ANDROID_HOME` environment variable configured.

## Installation

1. Navigate to the mobile app folder:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Local Environment & Backend Configuration

The mobile client is preconfigured to connect to the backend server.
- File reference: [api.js](file:///d:/TalkHub/mobile/src/utils/api.js#L5)
- **Android Emulator Loopback IP**: By default, `api.js` points to `http://10.0.2.2:5000`. This is the special IP that allows the Android emulator to communicate with `localhost` of your host computer.
- **Physical Device**: If you are testing on a physical device, update `BASE_URL` in `d:\TalkHub\mobile\src\utils\api.js` to your computer's local IP address (e.g. `http://192.168.x.x:5000`), and ensure both your computer and the mobile device are on the same Wi-Fi network.

## Run Application on Android Emulator/Device

1. Start the Metro bundler:
   ```bash
   npm start
   ```

2. Run the application:
   ```bash
   npm run android
   ```

## Features Implemented
- **Branding & Theme Colors**: WhatsApp style Primary deep teal (`#075E54`) and Secondary teal (`#128C7E`) with identical chat wallpapers and bubble accents.
- **Secure Authentication & Token Persistence**: Register / login forms with JWT token persistence via `@react-native-async-storage/async-storage`.
- **Global WebSocket Integrations**: Real-time room list syncing using Socket.io.
- **Rich Chat Room Views**: Double/long-press message reaction drawer overlay, real-time typing indicators, and back-in-history pagination.
- **Membership Validation**: Members-only message viewing, public and private rooms with access key verification, and online member drawers.

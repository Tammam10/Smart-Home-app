# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start the development server (choose platform interactively)
npm start

# Start targeting a specific platform
npm run android
npm run ios
npm run web

# Lint
npm run lint

# Reset project (moves starter code to app-example/, creates blank app/)
npm run reset-project
```

There is no test runner configured in this project.

## Architecture

This is a React Native / Expo app for smart home device control. It has **two coexisting code structures** that should not be confused:

### Active app (`src/` + `App.js`)
The actual application lives in `src/` and is bootstrapped from the root `App.js`. This is what runs.

- **Entry point**: `App.js` → wraps everything in `ThemeProvider > SettingsProvider > SystemProvider` → renders `AppNavigator`
- **Navigation**: `src/navigation/AppNavigator.js` — native stack navigator with screens: Splash → PasscodeLogin → Home, and secondary screens (Login, Register, Profile, Emergency, Support, About, ChangePassword, Gate)
- **State**: `src/context/SystemContext.js` — global device state (led1, led2, doorLocked, alarmActive) and emergency mode actions. Consumed via `useSystem()` hook.
- **Screens**: `src/screens/` — each screen receives `navigation` prop from the stack navigator
- **Shared component**: `src/components/DeviceCard.js` — reusable card for displaying a device with icon, status badge, value, and optional toggle switch

Auth flow: Splash always navigates to PasscodeLogin → user picks account and enters PIN (or taps "Use Email & Password" → Login) → Home.

### Expo router scaffold (`app/` directory + `components/`, `hooks/`, `constants/`)
These are leftover Expo Router scaffolding files from `create-expo-app`. They are **not used** by the running app. `package.json` sets `"main": "node_modules/expo/AppEntry.js"` which loads the root `App.js`, bypassing the `app/` directory entirely.

- `components/`, `hooks/`, `constants/theme.ts` — scaffold boilerplate, not imported by the active app

## Firebase

Config is at `src/firebase/config.js`. Initializes the Firebase app and exports `auth` using `initializeAuth` with `AsyncStorage` persistence (via `@react-native-async-storage/async-storage`).

**To connect to a real project**, replace the placeholder values in `src/firebase/config.js` with your project's config from: Firebase Console → Project Settings → Your apps → SDK setup and configuration. Enable **Email/Password** sign-in under Authentication → Sign-in method.

Firebase Auth is wired to:
- `LoginScreen` — `signInWithEmailAndPassword`, `sendPasswordResetEmail`
- `RegisterScreen` — `createUserWithEmailAndPassword`
- `SplashScreen` — `onAuthStateChanged` (used to wait for SDK init before navigating)
- `ProfileScreen` — displays `auth.currentUser.email`, calls `signOut`
- `ChangePasswordScreen` — reauthenticates with `EmailAuthProvider.credential` then calls `updatePassword`

## Key patterns

- All screens use inline `StyleSheet.create()` — no shared style utilities
- Icons come from `@expo/vector-icons/MaterialIcons`
- The primary brand color is `#2f80ed` (blue); background is `#e6f4ff`

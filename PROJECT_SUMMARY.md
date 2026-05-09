# Smart Home Control System — Full Project Summary

---

## 1. Project Overview

**Smart Home Control** is a full-stack IoT system that allows a homeowner to monitor and control their home remotely in real time. The system is built on three layers:

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native / Expo (Android & iOS) |
| Cloud Backend | Firebase (Auth + Firestore + Realtime Database) |
| Hardware | ESP32 + ESP32-CAM + Sensors + Actuators |

The user opens the app → logs in → sees a live dashboard showing device states, sensor readings, camera stream, and gate status — all updated in real time from the ESP32 hardware via Firebase.

---

## 2. Software Tools & Technologies

### Mobile App
| Tool | Purpose |
|------|---------|
| React Native (Expo SDK 54) | Cross-platform mobile framework |
| React Navigation (native stack) | Screen navigation |
| React Context API | Global state management |
| AsyncStorage | Local persistence (theme, temperature unit) |
| React Animated API | Animations (splash, motion pulse, gate spin, FAB) |
| MaterialIcons (@expo/vector-icons) | All icons throughout the app |
| WebView (react-native-webview) | Renders live camera MJPEG stream |
| KeyboardAvoidingView + ScrollView | Keyboard-safe form layouts |

### Firebase Services
| Service | Purpose |
|---------|---------|
| Firebase Authentication | User login, registration, password reset |
| Cloud Firestore | Real-time device state + activity log |
| Firebase Realtime Database (RTDB) | Passcode PIN storage per user |

### Hardware / Embedded
| Tool | Purpose |
|------|---------|
| Arduino IDE | Firmware development and upload |
| ESP32 DevKit | Main microcontroller for all devices |
| ESP32-CAM (AI-Thinker) | Live camera streaming (MJPEG over WiFi) |
| Firebase ESP32 Client Library | Firestore read/write from firmware |
| esptool | Firmware upload utility |

---

## 3. Hardware Components

| Component | Model | GPIO |
|-----------|-------|------|
| Indoor LED 1 | Standard 5mm LED | GPIO 2 |
| Indoor LED 2 | Standard 5mm LED | GPIO 4 |
| Outdoor LED | Standard 5mm LED | GPIO 5 |
| Buzzer | Active buzzer | GPIO 18 |
| Door Lock Servo | SG90 / MG90S | GPIO 19 |
| Temperature Sensor | DHT11 | GPIO 21 |
| Motion Sensor | HC-SR501 PIR | GPIO 22 |
| Gate Stepper Driver IN1 | ULN2003 | GPIO 23 |
| Gate Stepper Driver IN2 | ULN2003 | GPIO 25 |
| Gate Stepper Driver IN3 | ULN2003 | GPIO 26 |
| Gate Stepper Driver IN4 | ULN2003 | GPIO 27 |
| Gate Stepper Motor | 28BYJ-48 | via ULN2003 |
| Ultrasonic TRIG | HC-SR04 | GPIO 16 |
| Ultrasonic ECHO | HC-SR04 | GPIO 17 (via divider) |
| Limit Switch OPEN | Microswitch | GPIO 32 |
| Limit Switch CLOSED | Microswitch | GPIO 33 |
| Camera Module | ESP32-CAM AI-Thinker | Separate board (WiFi) |

---

## 4. Hardware Wiring

### LEDs (Indoor 1, Indoor 2, Outdoor)
```
ESP32 GPIO → 220Ω Resistor → LED Anode (+) → LED Cathode (−) → GND
```

### Buzzer (with transistor driver)
```
GPIO 18 → 1kΩ → NPN Base (BC547)
Collector → Buzzer (−)
Buzzer (+) → 5V External
Emitter → GND
```

### Servo Motor (Door Lock)
```
Orange/Yellow → GPIO 19
Red           → External 5V  (NOT ESP32 pin — servo needs dedicated supply)
Brown/Black   → GND (shared with ESP32)
```

### DHT11 (Temperature Sensor)
```
VCC  → 3.3V
DATA → GPIO 21  +  10kΩ pull-up resistor to 3.3V
GND  → GND
```

### PIR Sensor (Motion Detection)
```
VCC → 5V
OUT → GPIO 22
GND → GND
```

### HC-SR04 (Ultrasonic Obstacle Sensor)
```
VCC  → 5V
TRIG → GPIO 16
ECHO → Voltage Divider → GPIO 17
       (1kΩ between ECHO and GPIO, 2kΩ from GPIO to GND)
       Converts 5V ECHO output to safe 3.3V for ESP32
GND  → GND
```

### 28BYJ-48 Stepper + ULN2003 Driver (Sliding Gate)
```
IN1  → GPIO 23
IN2  → GPIO 25
IN3  → GPIO 26
IN4  → GPIO 27
VCC  → External 5V 1A supply
GND  → Shared GND with ESP32
Motor connector → 28BYJ-48 5-wire plug
```

### Limit Switches (Gate End Positions)
```
GPIO 32 → Switch terminal A → Switch terminal B → GND   [OPEN position]
GPIO 33 → Switch terminal A → Switch terminal B → GND   [CLOSED position]
Configured as INPUT_PULLUP — no external resistors needed
```

### ESP32-CAM (Live Camera — Separate Board)

**Programming wiring (FTDI adapter):**
```
ESP32-CAM 5V  → FTDI 5V
ESP32-CAM GND → FTDI GND
U0TXD (TX)    → FTDI RX
U0RXD (RX)    → FTDI TX
IO0           → GND   ← only during upload, remove after flashing
```

**Standalone operation after upload:**
```
External 5V → ESP32-CAM 5V pin
GND → GND
(Remove FTDI, IO0 must be floating/unconnected)
```

### Resistor Summary
| Component | Resistor | Purpose |
|-----------|----------|---------|
| Each LED | 220Ω | Current limiting |
| DHT11 DATA | 10kΩ to 3.3V | Pull-up (required) |
| HC-SR04 ECHO | 1kΩ + 2kΩ divider | 5V → 3.3V level shift |
| Buzzer transistor | 1kΩ base | Gate drive current |

---

## 5. Project File Structure

```
smart-home-app/
├── App.js                           ← Entry point, wraps all providers
├── src/
│   ├── firebase/
│   │   └── config.js                ← Firebase init (Auth, Firestore, RTDB)
│   ├── context/
│   │   ├── ThemeContext.js          ← Light/Dark theme, persisted to AsyncStorage
│   │   ├── SettingsContext.js       ← Temperature unit (°C/°F), persisted
│   │   └── SystemContext.js         ← All device state, Firestore real-time sync
│   ├── navigation/
│   │   └── AppNavigator.js          ← React Navigation native stack
│   ├── components/
│   │   └── DeviceCard.js            ← Reusable card: icon + value + switch + badge
│   └── screens/
│       ├── SplashScreen.js          ← Animated intro + auth routing
│       ├── LoginScreen.js           ← Email/password login + reset
│       ├── RegisterScreen.js        ← Account + passcode creation
│       ├── PasscodeScreen.js        ← PIN pad unlock screen
│       ├── HomeScreen.js            ← Main dashboard
│       ├── GateScreen.js            ← Sliding gate control
│       ├── EmergencyScreen.js       ← Emergency mode toggle
│       ├── ProfileScreen.js         ← Settings: theme, unit, password, logout
│       ├── ChangePasswordScreen.js  ← Password update form
│       ├── SupportScreen.js         ← Emergency phone numbers
│       └── AboutScreen.js           ← App info
```

---

## 6. Screen-by-Screen Workflow

### SplashScreen
- Animated logo: spring scale in + fade + title slide up + loading dots loop
- Minimum display time: 2.6 seconds
- Simultaneously checks Firebase Auth (`onAuthStateChanged`)
- Fades screen to black before navigating
- **Routes to:** `PasscodeScreen` (logged in) or `LoginScreen` (no session)

---

### LoginScreen
- Email + password fields with validation
- `signInWithEmailAndPassword` → navigates to `Home` on success
- "Forgot Password?" → `sendPasswordResetEmail` (email must be entered first)
- Error messages mapped per Firebase error code (invalid-credential, too-many-requests, etc.)
- Link to `RegisterScreen`

---

### RegisterScreen
- 5 fields: Email, Password, Confirm Password, Passcode (4–6 digits numeric), Confirm Passcode
- All fields inlined directly in JSX — no helper component (prevents keyboard dismiss bug)
- `KeyboardAvoidingView` + `ScrollView` + `keyboardShouldPersistTaps="handled"`
- `useRef` focus chain: Email → Password → Confirm Password → Passcode → Confirm Passcode
- `returnKeyType="next"` on each field, last field = "done" triggers submit
- On submit:
  1. Validates all fields (email, password min 6, passcode min 4 digits, match checks)
  2. `createUserWithEmailAndPassword` (Firebase Auth)
  3. `set(ref(rtdb, users/${uid}), { email, passcode })` — stores PIN in RTDB
  4. Navigates to `Home` (skips PasscodeScreen since PIN was just set)

---

### PasscodeScreen
- On mount: fetches `users/${uid}/passcode` from Firebase RTDB
  - No passcode stored → skip directly to `Home`
  - No user session → redirect to `Login`
- Number pad: 3×4 grid (1–9, empty/0/del row)
- PIN dots: one dot per digit of stored code, fills as user types
- Auto-submits when `pin.length === storedCode.length`
- Wrong PIN:
  - Shake animation (`Animated.sequence`, 5 oscillations)
  - Attempt counter message shown
  - After 3 failures: `signOut` → `Login`
- "Forgot Passcode?" button → Alert → `signOut` → `Login`

---

### HomeScreen (Main Dashboard)

**Header:**
- App brand + user email greeting
- Live clock (updates every 1 second with `setInterval`)

**Status Chips (3 pills across top):**
- System: "ALERT" (red) or "Online" (green) — driven by `alarmActive`
- Temperature: Firestore value converted to °C or °F via `SettingsContext`
- Active Devices: count of led1, led2, doorLocked, outdoorLed that are true

**Emergency Banner:**
- Red flashing animated banner (Animated loop) — visible when `alarmActive === true`

**Camera Card:**
- Live MJPEG stream in `WebView` if `streamUrl` exists in Firestore
- Expand button → fullscreen Modal with clock overlay
- Placeholder shown if camera offline

**Gate Card:**
- Visual gate graphic: sliding panel width changes per gate state
- States and colors: open (green) / closed (gray) / opening & closing (blue) / stopped (orange) / obstacle_detected (red)
- Status badge overlaid on graphic
- Tap anywhere on card → navigates to `GateScreen`

**Devices Grid (2×2, using `DeviceCard` component):**
| Device | Control | Auto |
|--------|---------|------|
| Indoor LED 1 | Toggle switch | No |
| Indoor LED 2 | Toggle switch | No |
| Door Lock | Toggle switch | No |
| Outdoor LED | Read-only | Yes — follows motion |

**Sensors Row:**
- Temperature card (orange): shows `temperature`°C/°F from Firestore
- Motion card (green/red): shows "Detected!" with pulse ring animation when motion active

**Activity Log:**
- Last 10 events from Firestore `activity` subcollection
- Ordered by server timestamp descending
- Each row: colored icon + event text + time and date

**FAB (Floating Action Button):**
- Blue button (turns red during alarm) at bottom right
- Press → 4 sub-buttons animate upward: Profile, Emergency, Support, About

**Sensor Simulation:**
- Every 5 seconds: `simulateSensors()` writes random temperature (20–29°C) and motion (30% chance true) to Firestore

---

### GateScreen
- Reads `gateStatus` from `SystemContext` (Firestore real-time)
- Status icon animates: spins while moving, pulses on obstacle
- Obstacle detected → red warning banner at top
- **Open button:** disabled when already open or opening
- **Stop button:** always enabled
- **Close button:** disabled when already closed or closing
- Sends command by writing `gateCommand` to Firestore → ESP32 polls and executes
- Safety info card: lists all 4 hardware safety features

---

### EmergencyScreen
- Reads `alarmActive` from `SystemContext`
- Lists what emergency mode does (lights ON, door LOCKED, buzzer ON)
- Shows ACTIVE / INACTIVE status badge
- **Activate:** `activateEmergencyMode()` → sets led1, led2, doorLocked = true, alarmActive = true
- **Deactivate:** `deactivateEmergencyMode()` → sets alarmActive = false
- All changes reflected in Firestore → ESP32 physically triggers buzzer and servo

---

### ProfileScreen
**APPEARANCE section:**
- Dark Mode: Switch → `toggleTheme()` → persisted to AsyncStorage
- Temperature Unit: °C / °F pill buttons → `setTempUnit()` → persisted to AsyncStorage

**ACCOUNT section:**
- Change Password → navigates to `ChangePasswordScreen`
- Logout → `Alert.alert` confirmation dialog → `signOut(auth)` → `Login`

---

### ChangePasswordScreen
- 3 password fields with show/hide toggles
- `returnKeyType="next"` chains focus: current → new → confirm
- Auto-scrolls when confirm field is focused (keeps it above keyboard)
- Flow: `EmailAuthProvider.credential` → `reauthenticateWithCredential` → `updatePassword`
- Full error handling: wrong password, weak password, too many attempts

---

### SupportScreen
- Shows 2 emergency phone numbers
- Each number has a call button: `Linking.openURL("tel:XXXXXXX")`

---

### AboutScreen
- Static info page: app overview, main features list, purpose, version

---

## 7. State Management Architecture

```
App.js
└── ThemeProvider        ← light/dark palette, persisted to AsyncStorage
    └── SettingsProvider ← tempUnit (°C/°F), persisted to AsyncStorage
        └── SystemProvider ← all device state + activity from Firestore (real-time)
            └── AppNavigator
                └── All Screens
```

### SystemContext — All Exported Functions & Values

| Name | Type | Description |
|------|------|-------------|
| `led1` | boolean | Indoor LED 1 state |
| `setLed1(value)` | function | Write led1 to Firestore + log activity |
| `led2` | boolean | Indoor LED 2 state |
| `setLed2(value)` | function | Write led2 to Firestore + log activity |
| `doorLocked` | boolean | Door lock state |
| `setDoorLocked(value)` | function | Write doorLocked + log activity |
| `alarmActive` | boolean | Emergency alarm state |
| `outdoorLed` | boolean | Outdoor LED (auto, follows motion) |
| `temperature` | number | Temperature reading (°C) |
| `motionDetected` | boolean | PIR motion sensor state |
| `gateStatus` | string | open / closed / opening / closing / stopped / obstacle_detected |
| `setGateCommand(cmd)` | function | Write gateCommand to Firestore |
| `streamUrl` | string/null | Camera stream URL from Firestore |
| `activityLog` | array | Last 10 activity entries |
| `simulateSensors()` | function | Write random temp + motion to Firestore |
| `activateEmergencyMode()` | function | Set all safety fields + alarm = true |
| `deactivateEmergencyMode()` | function | Set alarmActive = false |
| `loading` | boolean | True while initial Firestore data loads |

### `updateDevice(fields, logEntry)` — Core Write Function
```
1. updateDoc(Firestore devices/state, fields)
   └── fallback: setDoc(merge:true) if document doesn't exist
2. If logEntry provided → addDoc(activity subcollection, { ...entry, timestamp: serverTimestamp() })
```

---

## 8. Firebase Database Structure

### Firebase Authentication
```
Provider: Email / Password
Session: Persisted via AsyncStorage (survives app restarts)
Identified by: uid (auto-generated unique user ID)
```

### Cloud Firestore — Device State Document
```
users/
└── {uid}/
    └── devices/
        └── state
            ├── led1: false
            ├── led2: true
            ├── doorLocked: true
            ├── alarmActive: false
            ├── temperature: 24
            ├── motionDetected: false
            ├── outdoorLed: false
            ├── gateCommand: "stop"
            ├── gateStatus: "closed"
            └── streamUrl: null | "http://192.168.x.x:81/stream"
```

### Cloud Firestore — Activity Log Subcollection
```
users/
└── {uid}/
    └── activity/
        └── {auto-generated-id}
            ├── icon: "lightbulb"
            ├── color: "#f59e0b"
            ├── text: "LED 1 turned on"
            └── timestamp: ServerTimestamp
```
*Query: `orderBy("timestamp", "desc"), limit(10)`*

### Firebase Realtime Database — Passcode Storage
```
users/
└── {uid}/
    ├── email: "user@example.com"
    └── passcode: "1234"
```

---

## 9. Firestore Real-Time Flow

```
App opens → user authenticated
      │
      ├── onSnapshot(devices/state)
      │       Fires immediately + on every change
      │       → updates React state → UI re-renders
      │
      └── onSnapshot(activity, desc, limit 10)
              Fires immediately + on every new event
              → activity log updates in real time

User toggles LED 1 in app
      │
      └── updateDoc({ led1: true }) + addDoc(activity)
              │
              ├── App UI updates instantly (optimistic via onSnapshot)
              └── ESP32 detects new value on next Firestore poll
                      └── digitalWrite(GPIO 2, HIGH) ← physical LED turns on
```

---

## 10. Arduino Firmware Workflow

### Startup — `setup()`
```
1. Connect to WiFi
2. Initialize Firebase (Firestore client + auth token)
3. Configure GPIO pins:
   - OUTPUT: LEDs (2,4,5), Buzzer (18), Servo (19), ULN2003 (23,25,26,27), TRIG (16)
   - INPUT_PULLUP: Limit SW_OPEN (32), SW_CLOSED (33)
   - INPUT: PIR (22), ECHO (17)
4. Initialize DHT11 on GPIO 21
5. Initialize servo object
6. Read initial Firestore state
```

### Main Loop — `loop()`
```
Every iteration:
├── Read Firestore document → get all device fields
├── led1 value → GPIO 2 HIGH/LOW
├── led2 value → GPIO 4 HIGH/LOW
├── doorLocked → servo.write(90 locked / 0 unlocked)
├── alarmActive → tone(18, 1000) / noTone(18)
├── Read DHT11 → temperature → write back to Firestore
├── Read PIR → motionDetected → outdoorLed follows → write back
└── gateCommand:
        "open"  → call openGate()
        "close" → call closeGate()
        "stop"  → stop stepper immediately
```

### Gate Motor Functions

**`rampDelay(step)`** — Smooth acceleration
```
Input:  step number (0 to 200+)
Output: delay in microseconds
        step 0   → 5000µs (slow start)
        step 200 → 1800µs (full speed)
Linear interpolation between these values
Used before each stepper pulse for smooth motion
```

**`openGate()`** — Blocking open sequence
```
Loop half-step sequence indefinitely:
├── Apply rampDelay(n) before each step pulse
├── Every step: check SW_OPEN (GPIO 32)
│       └── If LOW (switch hit) → stop, write gateStatus="open" → return
├── Every 80 steps: check Firestore for gateCommand
│       └── If "stop" → stop, write gateStatus="stopped" → return
└── Write gateStatus="opening" at start
```

**`closeGate()`** — Blocking close sequence with obstacle detection
```
Loop reverse half-step sequence:
├── Apply rampDelay(n) before each step pulse
├── Every step: check SW_CLOSED (GPIO 33)
│       └── If LOW → stop, write gateStatus="closed" → return
├── Every 25 steps: read HC-SR04 distance
│       └── If distance < 15cm (obstacle):
│               ├── Stop motor
│               ├── Reverse 300 steps (back-off for safety)
│               └── Write gateStatus="obstacle_detected" → return
├── Every 80 steps: check Firestore for gateCommand
│       └── If "stop" → stop, write gateStatus="stopped" → return
└── Write gateStatus="closing" at start
```

**`setGateStatus(newStatus)`** — Efficient Firestore write
```
Only writes to Firestore if status has changed from last known value
Writes only the gateStatus field (patch — does not overwrite other fields)
```

### 28BYJ-48 Half-Step Sequence
```
Step  IN1  IN2  IN3  IN4
  0    1    0    0    0
  1    1    1    0    0
  2    0    1    0    0
  3    0    1    1    0
  4    0    0    1    0
  5    0    0    1    1
  6    0    0    0    1
  7    1    0    0    1
Repeat → 8 steps per electrical cycle = smooth half-step drive
```

---

## 11. ESP32-CAM Firmware Workflow

```
setup()
├── Connect to same WiFi network as ESP32 main board
├── Initialize OV2640 camera sensor
│       (resolution, frame size, quality settings)
└── Start HTTP server on port 81

loop()
└── Serve MJPEG stream at endpoint: /stream
    Client connects → continuous JPEG frames sent in multipart HTTP response
    Stream URL: http://<ESP32-CAM-local-IP>:81/stream

After getting the IP:
└── Manually save URL to Firestore: devices/state.streamUrl
    App reads streamUrl → WebView renders live video
```

---

## 12. Navigation Flow

```
App Launch
    │
    ▼
SplashScreen (min 2.6s animated)
    ├── Logged in ──────────────────► PasscodeScreen
    │                                       ├── Correct PIN ──► HomeScreen ◄─────────┐
    │                                       └── 3 wrong ──────► LoginScreen           │
    └── No session ──────────────────► LoginScreen                                    │
                                            ├── Login success ──────────────────────► │
                                            └── Register ──► RegisterScreen           │
                                                                    └── Success ──────┘

HomeScreen (main hub)
    ├── FAB → ProfileScreen
    │              └── Change Password → ChangePasswordScreen
    ├── FAB → EmergencyScreen
    ├── FAB → SupportScreen
    ├── FAB → AboutScreen
    └── Gate card → GateScreen
```

---

## 13. Complete Data Flow — End to End

### Example: User locks the door from the app
```
User taps Door Lock switch in HomeScreen
    │
    ▼
setDoorLocked(true) called in SystemContext
    │
    ▼
updateDoc(Firestore: users/{uid}/devices/state, { doorLocked: true })
addDoc(activity, { icon:"lock", color:"#3b82f6", text:"Door locked", timestamp })
    │
    ▼
Firestore onSnapshot fires in app → React state updates → UI shows "Locked"
    │
    ▼
ESP32 polls Firestore (every ~1-2 seconds)
    │
    ▼
Reads doorLocked = true
    │
    ▼
servo.write(90) → physical servo rotates → door bolt extends → door locked
```

### Example: PIR detects motion
```
ESP32 reads PIR sensor HIGH (GPIO 22)
    │
    ▼
motionDetected = true, outdoorLed = true
    │
    ▼
updateDoc(Firestore: { motionDetected: true, outdoorLed: true })
addDoc(activity, { icon:"directions-run", text:"Motion detected" })
    │
    ▼
Firestore onSnapshot fires in app
    │
    ├── Motion sensor card → shows "Detected!" + starts pulse ring animation
    ├── Outdoor LED card → shows "On — Motion"
    └── Activity log → new entry appears at top in real time
    │
    ▼
ESP32 also: digitalWrite(GPIO 5, HIGH) → outdoor LED physically turns on
```

### Example: App sends gate open command
```
User taps "Open Gate" in GateScreen
    │
    ▼
setGateCommand("open") → updateDoc({ gateCommand: "open" })
    │
    ▼
ESP32 reads gateCommand = "open" from Firestore
    │
    ▼
Calls openGate() [blocking]
    ├── Writes gateStatus = "opening" → Firestore
    │       └── App receives via onSnapshot → gate card shows "Opening…" + spin animation
    ├── Runs stepper motor with ramp acceleration
    ├── Checks SW_OPEN limit switch every step
    └── SW_OPEN triggered → writes gateStatus = "open"
            └── App receives → gate card shows "Open" (green)
```

---

## 14. Security Features

| Feature | Implementation |
|---------|---------------|
| Firebase Auth | Email/password, session persisted via AsyncStorage |
| Passcode PIN lock | 4–6 digit PIN in RTDB, required on every app launch |
| 3-attempt lock | Wrong PIN 3× → forced `signOut` + redirect to Login |
| Re-authentication | Changing password requires entering current password first |
| Logout confirmation | Alert dialog before signing out (no accidental logout) |
| Door lock | Servo-controlled physical deadbolt, Firestore-synced |
| Emergency mode | One button: all lights ON + door LOCKED + buzzer ON |
| Gate obstacle sensor | HC-SR04 auto-stops and reverses gate when blocked |
| Gate limit switches | Hardware stop prevents mechanical over-travel |
| Gate stop button | Always enabled — emergency halt at any point |

---

## 15. App Theme System

Defined in `ThemeContext.js` — two complete palettes:

| Token | Light Value | Dark Value |
|-------|------------|-----------|
| `bg` | `#f0f4ff` | `#0f172a` |
| `card` | `#ffffff` | `#1e293b` |
| `header` | `#1e3a8a` | `#070d1a` |
| `text` | `#1e293b` | `#f1f5f9` |
| `subtext` | `#64748b` | `#94a3b8` |
| `primary` | `#2563eb` | `#3b82f6` |
| `border` | `#e2e8f0` | `#334155` |
| `inputBg` | `#f8fafc` | `#0f172a` |

- Toggled via switch in ProfileScreen
- Persisted to AsyncStorage key `@theme`
- Applied to every screen via `useTheme()` hook
- All components use `theme.xxx` tokens — no hardcoded colors in themed screens

---

## 16. Key Design Decisions

| Decision | Reason |
|----------|--------|
| All TextInput fields inlined (no helper components) | Components defined inside parent re-mount on every state change → keyboard dismisses on each keystroke |
| `KeyboardAvoidingView` + `keyboardShouldPersistTaps="handled"` | Prevents keyboard dismissing when scrolling or tapping non-input areas |
| Passcode stored in RTDB, not Firestore | RTDB is simpler key-value access; no real-time listener needed for a one-time read |
| `INPUT_PULLUP` for limit switches | Eliminates external pull-up resistors; active LOW logic |
| HC-SR04 ECHO through voltage divider | ECHO pin outputs 5V; ESP32 GPIO max safe input is 3.3V |
| Servo powered from external 5V | Current spikes from servo reset the ESP32 if powered from onboard pins |
| Stepper powered from external 5V | 28BYJ-48 draws 200–500mA — exceeds what USB-powered ESP32 can supply |
| `onSnapshot` for Firestore | Real-time push updates from Firebase; no polling loop needed in the app |
| `updateDoc` with `setDoc` fallback | `updateDoc` fails if document doesn't exist; `setDoc` with `merge:true` creates it |
| Activity log limited to 10 entries | Keeps Firestore reads cheap; Firestore `limit(10)` query |
| Gate STOP always enabled | Safety requirement — gate must always be haltable regardless of state |

---

## 17. Libraries & Packages

### Mobile App
| Package | Purpose |
|---------|---------|
| expo ~54 | App framework + build tools |
| react-native | Core mobile UI components |
| @react-navigation/native | Navigation container |
| @react-navigation/native-stack | Stack navigator |
| firebase | Auth + Firestore + Realtime Database SDK |
| @react-native-async-storage/async-storage | Local persistent storage |
| react-native-webview | Camera stream WebView |
| @expo/vector-icons | MaterialIcons icon set |

### Arduino IDE
| Library | Purpose |
|---------|---------|
| Firebase ESP Client | Firestore read/write from ESP32 |
| DHT sensor library (Adafruit) | DHT11 temperature + humidity |
| ESP32Servo | Servo PWM control |
| WiFi (ESP32 built-in) | WiFi connectivity |
| esp32-camera | ESP32-CAM OV2640 driver |

---

*Smart Home Control System — Version 1.0.0*

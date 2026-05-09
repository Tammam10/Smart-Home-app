import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/config";

const SystemContext = createContext(null);

// Firestore paths
const deviceDocRef = (uid) => doc(db, "users", uid, "devices", "state");
const activityColRef = (uid) => collection(db, "users", uid, "activity");

const DEFAULT_DEVICES = {
  led1: false,
  led2: true,
  doorLocked: true,
  alarmActive: false,
  temperature: 24,
  motionDetected: false,
  outdoorLed: false,
  streamUrl: null,
  gateCommand: "stop",
  gateStatus: "closed",
};

export function SystemProvider({ children }) {
  const [devices, setDevices] = useState(DEFAULT_DEVICES);
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDevices = null;
    let unsubscribeActivity = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeDevices) { unsubscribeDevices(); unsubscribeDevices = null; }
      if (unsubscribeActivity) { unsubscribeActivity(); unsubscribeActivity = null; }

      if (!user) {
        setDevices(DEFAULT_DEVICES);
        setActivityLog([]);
        setLoading(false);
        return;
      }

      // Listen to device state document
      const docRef = deviceDocRef(user.uid);
      unsubscribeDevices = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          setDevices({ ...DEFAULT_DEVICES, ...snapshot.data() });
        } else {
          setDoc(docRef, DEFAULT_DEVICES);
        }
        setLoading(false);
      });

      // Listen to activity subcollection — newest 10 entries, ordered by server timestamp
      const activityQuery = query(
        activityColRef(user.uid),
        orderBy("timestamp", "desc"),
        limit(10),
      );
      unsubscribeActivity = onSnapshot(activityQuery, (snapshot) => {
        const entries = snapshot.docs.map((d) => {
          const data = d.data();
          const ts = data.timestamp?.toDate();
          return {
            id: d.id,
            icon: data.icon,
            color: data.color,
            text: data.text,
            time: ts
              ? ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
                "  ·  " +
                ts.toLocaleDateString([], { month: "short", day: "numeric" })
              : "",
          };
        });
        setActivityLog(entries);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDevices) unsubscribeDevices();
      if (unsubscribeActivity) unsubscribeActivity();
    };
  }, []);

  // Write a new entry to the activity subcollection with a server-side timestamp
  const logActivity = (entry) => {
    const user = auth.currentUser;
    if (!user) return;
    addDoc(activityColRef(user.uid), {
      ...entry,
      timestamp: serverTimestamp(),
    });
  };

  // Update device fields in Firestore and optionally log an activity entry
  const updateDevice = (fields, logEntry = null) => {
    const user = auth.currentUser;
    if (!user) return;
    const docRef = deviceDocRef(user.uid);
    updateDoc(docRef, fields).catch(() => setDoc(docRef, fields, { merge: true }));
    if (logEntry) logActivity(logEntry);
  };

  // Simulates temperature & motion sensor updates every 5 seconds from HomeScreen
  // Outdoor LED is automatically driven by motion state — paused during emergency mode
  const simulateSensors = () => {
    if (devices.alarmActive) return;
    const temperature = Math.floor(Math.random() * 10) + 20;
    const motionDetected = Math.random() > 0.7;
    const outdoorLed = motionDetected;
    const motionChanged = motionDetected !== devices.motionDetected;

    updateDevice(
      { temperature, motionDetected, outdoorLed },
      motionDetected
        ? { icon: "directions-run", color: "#ef4444", text: "Motion detected" }
        : null,
    );

    if (motionChanged) {
      logActivity({
        icon: "wb-sunny",
        color: "#22c55e",
        text: outdoorLed
          ? "Outdoor LED on — triggered by motion"
          : "Outdoor LED off — motion cleared",
      });
    }
  };

  const activateEmergencyMode = () => {
    updateDevice(
      { led1: true, led2: true, outdoorLed: true, doorLocked: true, alarmActive: true, gateCommand: "close" },
      { icon: "warning", color: "#ef4444", text: "Emergency mode activated — all lights on, gate closing" },
    );
  };

  const deactivateEmergencyMode = () => {
    updateDevice(
      { alarmActive: false, gateCommand: "stop" },
      { icon: "check-circle", color: "#10b981", text: "Emergency mode deactivated" },
    );
  };

  return (
    <SystemContext.Provider
      value={{
        led1: devices.led1,
        setLed1: (value) =>
          updateDevice(
            { led1: value },
            { icon: "lightbulb", color: "#f59e0b", text: "LED 1 turned " + (value ? "on" : "off") },
          ),
        led2: devices.led2,
        setLed2: (value) =>
          updateDevice(
            { led2: value },
            { icon: "lightbulb-outline", color: "#eab308", text: "LED 2 turned " + (value ? "on" : "off") },
          ),
        doorLocked: devices.doorLocked,
        setDoorLocked: (value) =>
          updateDevice(
            { doorLocked: value },
            { icon: value ? "lock" : "lock-open", color: "#3b82f6", text: "Door " + (value ? "locked" : "unlocked") },
          ),
        alarmActive: devices.alarmActive,
        outdoorLed: devices.outdoorLed,
        streamUrl: devices.streamUrl ?? null,
        gateStatus: devices.gateStatus ?? "closed",
        setGateCommand: (cmd) => updateDevice({ gateCommand: cmd }),
        activateEmergencyMode,
        deactivateEmergencyMode,
        temperature: devices.temperature,
        motionDetected: devices.motionDetected,
        activityLog,
        simulateSensors,
        loading,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  const context = useContext(SystemContext);
  if (!context) throw new Error("useSystem must be used inside SystemProvider");
  return context;
}

// services/deviceService.js
import { onValue, ref, set, update } from "firebase/database";
import { database } from "../firebaseConfig";

const devicesRef = ref(database, "devices");

// create default device values one time
export const initializeDevices = async () => {
  const defaultDevices = {
    indoorLed1: false,
    indoorLed2: false,
    doorLocked: true,
    outdoorLed: false,
    temperature: 24,
    motionDetected: false,
    alarmActive: false,
  };

  await set(devicesRef, defaultDevices);
};

// listen to all device changes in realtime
export const subscribeToDevices = (callback) => {
  return onValue(devicesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data);
    }
  });
};

// update one or more device values
export const updateDeviceState = async (updates) => {
  await update(devicesRef, updates);
};

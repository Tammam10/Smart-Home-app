import { createContext, useContext, useState } from "react";

const SystemContext = createContext(null);

export function SystemProvider({ children }) {
  const [led1, setLed1] = useState(false);
  const [led2, setLed2] = useState(true);
  const [doorLocked, setDoorLocked] = useState(true);
  const [alarmActive, setAlarmActive] = useState(false);

  const activateEmergencyMode = () => {
    setLed1(true);
    setLed2(true);
    setDoorLocked(true);
    setAlarmActive(true);
  };

  const deactivateEmergencyMode = () => {
    setAlarmActive(false);
  };

  return (
    <SystemContext.Provider
      value={{
        led1,
        setLed1,
        led2,
        setLed2,
        doorLocked,
        setDoorLocked,
        alarmActive,
        activateEmergencyMode,
        deactivateEmergencyMode,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  const context = useContext(SystemContext);

  if (!context) {
    throw new Error("useSystem must be used inside SystemProvider");
  }

  return context;
}

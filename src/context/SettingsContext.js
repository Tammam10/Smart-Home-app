import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [tempUnit, setTempUnitState] = useState("C");

  useEffect(() => {
    AsyncStorage.getItem("@tempUnit").then((v) => { if (v) setTempUnitState(v); });
  }, []);

  const setTempUnit = useCallback((unit) => {
    setTempUnitState(unit);
    AsyncStorage.setItem("@tempUnit", unit);
  }, []);

  return (
    <SettingsContext.Provider value={{ tempUnit, setTempUnit }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}

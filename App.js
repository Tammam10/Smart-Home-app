import { SettingsProvider } from "./src/context/SettingsContext";
import { SystemProvider } from "./src/context/SystemContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <SystemProvider>
          <AppNavigator />
        </SystemProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

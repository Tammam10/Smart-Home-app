import { SystemProvider } from "./src/context/SystemContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <SystemProvider>
      <AppNavigator />
    </SystemProvider>
  );
}

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StyleSheet, Switch, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
export default function SettingsScreen() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <Text style={[styles.title, darkMode && styles.darkTitle]}>Settings</Text>

      <View style={[styles.card, darkMode && styles.darkCard]}>
        <View style={styles.row}>
          <View style={styles.leftRow}>
            <MaterialIcons
              name="dark-mode"
              size={24}
              color={darkMode ? "#facc15" : "#2f80ed"}
            />
            <Text style={[styles.label, darkMode && styles.darkLabel]}>
              Dark Mode
            </Text>
          </View>

          <Switch value={darkMode} onValueChange={toggleDarkMode} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7fb",
    padding: 20,
  },
  darkContainer: {
    backgroundColor: "#0f172a",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 20,
  },
  darkTitle: {
    color: "#f8fafc",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    elevation: 4,
  },
  darkCard: {
    backgroundColor: "#1e293b",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 17,
    color: "#111827",
    marginLeft: 10,
    fontWeight: "600",
  },
  darkLabel: {
    color: "#f8fafc",
  },
});

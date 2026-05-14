import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSystem } from "../context/SystemContext";
import { useTheme } from "../context/ThemeContext";

export default function EmergencyScreen({ navigation }) {
  const { alarmActive, gateStatus, activateEmergencyMode, deactivateEmergencyMode } = useSystem();
  const { theme } = useTheme();

  const handleEmergencyToggle = () => {
    if (!alarmActive) {
      activateEmergencyMode();
      Alert.alert(
        "Emergency Mode Activated",
        "All lights turned ON, doors LOCKED, gate CLOSING, and alarm/buzzer TRIGGERED.",
      );
    } else {
      deactivateEmergencyMode();
      Alert.alert(
        "Emergency Mode Deactivated",
        "Emergency actions have been stopped.",
      );
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={[styles.container, { backgroundColor: theme.bg }]}
    >
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#ef4444" />
        </TouchableOpacity>

        <Text style={[styles.title, { color: theme.text }]}>Emergency Mode</Text>

        <View style={styles.topSpacer} />
      </View>

      <View style={[styles.headerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="warning" size={56} color="#ef4444" />
        </View>

        <Text style={[styles.headerTitle, { color: theme.text }]}>Security Emergency Control</Text>
        <Text style={[styles.headerSubtitle, { color: theme.subtext }]}>
          Use this mode in dangerous situations to secure your home immediately.
        </Text>
      </View>

      <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.infoTitle, { color: theme.text }]}>
          What happens when Emergency Mode is activated?
        </Text>

        {[
          { icon: "lightbulb",    color: "#f59e0b", text: "Turn ON all indoor and outdoor lights" },
          { icon: "lock",         color: "#3b82f6", text: "Lock all connected doors" },
          { icon: "campaign",     color: "#ef4444", text: "Trigger alarm / buzzer alert" },
          { icon: "sensor-door",  color: "#7c3aed", text: "Close the gate automatically" },
        ].map((item, i) => (
          <View key={i} style={styles.infoRow}>
            <MaterialIcons name={item.icon} size={20} color={item.color} />
            <Text style={[styles.infoText, { color: theme.text }]}>{item.text}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.statusCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.statusLabel, { color: theme.subtext }]}>Current Status</Text>
        <Text style={[styles.statusValue, alarmActive ? styles.activeStatus : styles.inactiveStatus]}>
          {alarmActive ? "ACTIVE" : "INACTIVE"}
        </Text>

        {alarmActive && (
          <View style={styles.statusDetails}>
            <View style={styles.statusDetailRow}>
              <MaterialIcons name="sensor-door" size={16} color="#7c3aed" />
              <Text style={[styles.statusDetailText, { color: theme.text }]}>
                Gate: {gateStatus.toUpperCase()}
              </Text>
            </View>
            <View style={styles.statusDetailRow}>
              <MaterialIcons name="lock" size={16} color="#3b82f6" />
              <Text style={[styles.statusDetailText, { color: theme.text }]}>Door: LOCKED</Text>
            </View>
            <View style={styles.statusDetailRow}>
              <MaterialIcons name="campaign" size={16} color="#ef4444" />
              <Text style={[styles.statusDetailText, { color: theme.text }]}>Alarm: ON</Text>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.emergencyButton, alarmActive && styles.deactivateButton]}
        onPress={handleEmergencyToggle}
      >
        <MaterialIcons
          name={alarmActive ? "power-settings-new" : "warning-amber"}
          size={24}
          color="#fff"
        />
        <Text style={styles.emergencyButtonText}>
          {alarmActive ? "Deactivate Emergency Mode" : "Activate Emergency Mode"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  topSpacer: { width: 42 },
  title: { fontSize: 20, fontWeight: "bold" },

  headerCard: {
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
    elevation: 3,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  iconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", textAlign: "center" },
  headerSubtitle: { fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 22 },

  infoCard: {
    borderRadius: 20,
    padding: 18,
    elevation: 3,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  infoTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 14 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  infoText: { marginLeft: 10, fontSize: 14 },

  statusCard: {
    borderRadius: 20,
    padding: 18,
    elevation: 3,
    borderWidth: 1,
    marginBottom: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  statusLabel: { fontSize: 15, marginBottom: 8 },
  statusValue: { fontSize: 26, fontWeight: "bold" },
  activeStatus: { color: "#ef4444" },
  inactiveStatus: { color: "#10b981" },
  statusDetails: { marginTop: 14, gap: 8, alignSelf: "stretch" },
  statusDetailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusDetailText: { fontSize: 13, fontWeight: "600" },

  emergencyButton: {
    flexDirection: "row",
    backgroundColor: "#ef4444",
    minHeight: 58,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    gap: 10,
  },
  deactivateButton: { backgroundColor: "#111827" },
  emergencyButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
});

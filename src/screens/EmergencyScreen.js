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

export default function EmergencyScreen({ navigation }) {
  const { alarmActive, gateStatus, activateEmergencyMode, deactivateEmergencyMode } =
    useSystem();

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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#ef4444" />
        </TouchableOpacity>

        <Text style={styles.title}>Emergency Mode</Text>

        <View style={styles.topSpacer} />
      </View>

      <View style={styles.headerCard}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="warning" size={56} color="#ef4444" />
        </View>

        <Text style={styles.headerTitle}>Security Emergency Control</Text>
        <Text style={styles.headerSubtitle}>
          Use this mode in dangerous situations to secure your home immediately.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>
          What happens when Emergency Mode is activated?
        </Text>

        <View style={styles.infoRow}>
          <MaterialIcons name="lightbulb" size={20} color="#f59e0b" />
          <Text style={styles.infoText}>
            Turn ON all indoor and outdoor lights
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="lock" size={20} color="#3b82f6" />
          <Text style={styles.infoText}>Lock all connected doors</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="campaign" size={20} color="#ef4444" />
          <Text style={styles.infoText}>Trigger alarm / buzzer alert</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="sensor-door" size={20} color="#7c3aed" />
          <Text style={styles.infoText}>Close the gate automatically</Text>
        </View>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Current Status</Text>
        <Text
          style={[
            styles.statusValue,
            alarmActive ? styles.activeStatus : styles.inactiveStatus,
          ]}
        >
          {alarmActive ? "ACTIVE" : "INACTIVE"}
        </Text>

        {alarmActive && (
          <View style={styles.statusDetails}>
            <View style={styles.statusDetailRow}>
              <MaterialIcons name="sensor-door" size={16} color="#7c3aed" />
              <Text style={styles.statusDetailText}>
                Gate: {gateStatus.toUpperCase()}
              </Text>
            </View>
            <View style={styles.statusDetailRow}>
              <MaterialIcons name="lock" size={16} color="#3b82f6" />
              <Text style={styles.statusDetailText}>Door: LOCKED</Text>
            </View>
            <View style={styles.statusDetailRow}>
              <MaterialIcons name="campaign" size={16} color="#ef4444" />
              <Text style={styles.statusDetailText}>Alarm: ON</Text>
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
          {alarmActive
            ? "Deactivate Emergency Mode"
            : "Activate Emergency Mode"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#e6f4ff",
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
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  topSpacer: {
    width: 42,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
    elevation: 5,
    marginBottom: 16,
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
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    elevation: 4,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#374151",
  },
  statusCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    elevation: 4,
    marginBottom: 18,
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 26,
    fontWeight: "bold",
  },
  statusDetails: {
    marginTop: 14,
    gap: 8,
    alignSelf: "stretch",
  },
  statusDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDetailText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  activeStatus: {
    color: "#ef4444",
  },
  inactiveStatus: {
    color: "#10b981",
  },
  emergencyButton: {
    flexDirection: "row",
    backgroundColor: "#ef4444",
    minHeight: 58,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  deactivateButton: {
    backgroundColor: "#111827",
  },
  emergencyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

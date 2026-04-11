import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

export default function DeviceCard({
  title,
  value,
  icon,
  iconColor = "#555",
  onPress,
  active = false,
  showSwitch = false,
  switchValue = false,
  onSwitchChange,
  status = "",
}) {
  return (
    <TouchableOpacity
      style={[styles.card, active && styles.activeCard]}
      onPress={onPress}
      activeOpacity={0.9}
      disabled={showSwitch}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: `${iconColor}20` }]}>
          <MaterialIcons name={icon} size={28} color={iconColor} />
        </View>

        {status ? (
          <View
            style={[
              styles.statusBadge,
              status === "Online"
                ? styles.onlineBadge
                : status === "Offline"
                  ? styles.offlineBadge
                  : styles.warningBadge,
            ]}
          >
            <Text style={styles.statusText}>{status}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>

      {showSwitch ? (
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{switchValue ? "ON" : "OFF"}</Text>
          <Switch value={switchValue} onValueChange={onSwitchChange} />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    elevation: 4,
    minHeight: 150,
    justifyContent: "space-between",
  },

  activeCard: {
    borderWidth: 1.5,
    borderColor: "#cfe0ff",
    backgroundColor: "#f7fbff",
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    marginTop: 14,
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },

  value: {
    marginTop: 6,
    fontSize: 18,
    color: "#111827",
    fontWeight: "bold",
  },

  switchRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  switchLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  onlineBadge: {
    backgroundColor: "#dcfce7",
  },

  offlineBadge: {
    backgroundColor: "#fee2e2",
  },

  warningBadge: {
    backgroundColor: "#fef3c7",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#374151",
  },
});

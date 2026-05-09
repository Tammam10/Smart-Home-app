import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function DeviceCard({
  title, value, icon, iconColor = "#555",
  onPress,
  active = false,
  showSwitch = false, switchValue = false, onSwitchChange,
  status = "",
}) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
        active && { borderColor: theme.primary + "60", backgroundColor: theme.primarySoft + "30" },
      ]}
      onPress={onPress}
      activeOpacity={0.88}
      disabled={showSwitch}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: iconColor + "20" }]}>
          <MaterialIcons name={icon} size={28} color={iconColor} />
        </View>
        {status ? (
          <View style={[
            styles.badge,
            status === "Online"       ? { backgroundColor: theme.statOnline.bg } :
            status === "Offline"      ? { backgroundColor: theme.statAlert.bg }  :
            status.startsWith("Auto") ? { backgroundColor: theme.statDevice.bg } :
                                        { backgroundColor: "#fef3c7" },
          ]}>
            <Text style={[
              styles.badgeText,
              status === "Online"       ? { color: theme.statOnline.text } :
              status === "Offline"      ? { color: theme.statAlert.text }  :
              status.startsWith("Auto") ? { color: theme.statDevice.text } :
                                          { color: "#d97706" },
            ]}>{status}</Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.title, { color: theme.subtext }]}>{title}</Text>
      <Text style={[styles.value, { color: theme.text }]}>{value}</Text>

      {showSwitch ? (
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: theme.subtext }]}>{switchValue ? "ON" : "OFF"}</Text>
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            thumbColor={theme.primary}
            trackColor={{ false: theme.border, true: theme.primary + "60" }}
          />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%", borderRadius: 18, padding: 16,
    marginBottom: 14, elevation: 3, minHeight: 150,
    justifyContent: "space-between", borderWidth: 1,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  topRow:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  iconBox:    { width: 46, height: 46, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  title:      { marginTop: 14, fontSize: 13, fontWeight: "600" },
  value:      { marginTop: 4, fontSize: 17, fontWeight: "800" },
  switchRow:  { marginTop: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  switchLabel:{ fontSize: 13, fontWeight: "700" },
  badge:      { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  badgeText:  { fontSize: 10, fontWeight: "800" },
});

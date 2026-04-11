import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function DeviceCard({ title, value, icon, onPress, active }) {
  return (
    <TouchableOpacity
      style={[styles.card, active && styles.activeCard]}
      onPress={onPress}
    >
      <MaterialIcons
        name={icon}
        size={32}
        color={active ? "#2f80ed" : "#555"}
      />

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    alignItems: "center",
    elevation: 4,
  },
  activeCard: {
    backgroundColor: "#e3f2fd",
  },
  title: {
    fontSize: 14,
    marginTop: 8,
    color: "#333",
    fontWeight: "600",
    textAlign: "center",
  },
  value: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 6,
    color: "#111",
  },
});

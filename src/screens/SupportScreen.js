import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SupportScreen({ navigation }) {
  const numbers = [
    { label: "Primary Support", value: "76423892" },
    { label: "Secondary Support", value: "76539628" },
  ];

  const handleCall = (number) => {
    const phoneNumber = `tel:${number}`;

    Linking.openURL(phoneNumber).catch(() => {
      Alert.alert("Error", "Unable to make a call");
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#2f80ed" />
        </TouchableOpacity>

        <Text style={styles.title}>Emergency Support</Text>

        <View style={styles.topSpacer} />
      </View>

      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="support-agent" size={56} color="#2f80ed" />
        </View>

        <Text style={styles.header}>Emergency Assistance</Text>

        <Text style={styles.description}>
          If your smart home system fails or an emergency occurs, contact
          support immediately.
        </Text>

        {numbers.map((item, index) => (
          <View key={index} style={styles.numberRow}>
            <View style={styles.numberInfo}>
              <MaterialIcons name="phone" size={20} color="#2f80ed" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.numberLabel}>{item.label}</Text>
                <Text style={styles.number}>{item.value}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => handleCall(item.value)}
            >
              <MaterialIcons name="call" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 20,
    elevation: 5,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#eef5ff",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 14,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111827",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 18,
  },
  numberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  numberInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  numberLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  number: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  callBtn: {
    backgroundColor: "#2f80ed",
    padding: 10,
    borderRadius: 10,
  },
});

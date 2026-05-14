import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function SupportScreen({ navigation }) {
  const { theme } = useTheme();

  const numbers = [
    { label: "Primary Support",   value: "76423892" },
    { label: "Secondary Support", value: "76539628" },
  ];

  const handleCall = (number) => {
    Linking.openURL(`tel:${number}`).catch(() => {
      Alert.alert("Error", "Unable to make a call");
    });
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={[styles.container, { backgroundColor: theme.bg }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.primary} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: theme.text }]}>Emergency Support</Text>

        <View style={styles.topSpacer} />
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={[styles.iconCircle, { backgroundColor: theme.primarySoft }]}>
          <MaterialIcons name="support-agent" size={56} color={theme.primary} />
        </View>

        <Text style={[styles.header, { color: theme.text }]}>Emergency Assistance</Text>

        <Text style={[styles.description, { color: theme.subtext }]}>
          If your smart home system fails or an emergency occurs, contact
          support immediately.
        </Text>

        {numbers.map((item, index) => (
          <View key={index} style={[styles.numberRow, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <View style={styles.numberInfo}>
              <MaterialIcons name="phone" size={20} color={theme.primary} />
              <View style={{ marginLeft: 10 }}>
                <Text style={[styles.numberLabel, { color: theme.subtext }]}>{item.label}</Text>
                <Text style={[styles.number, { color: theme.text }]}>{item.value}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.callBtn, { backgroundColor: theme.primary }]}
              onPress={() => handleCall(item.value)}
            >
              <MaterialIcons name="call" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
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
  title: { fontSize: 18, fontWeight: "bold" },

  card: {
    borderRadius: 22,
    padding: 20,
    elevation: 3,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 14,
  },
  header: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 8 },
  description: { fontSize: 14, textAlign: "center", marginBottom: 18, lineHeight: 22 },

  numberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  numberInfo: { flexDirection: "row", alignItems: "center" },
  numberLabel: { fontSize: 13 },
  number: { fontSize: 16, fontWeight: "bold" },
  callBtn: { padding: 10, borderRadius: 10 },
});

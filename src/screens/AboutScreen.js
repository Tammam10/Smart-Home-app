import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function AboutScreen({ navigation }) {
  const { theme } = useTheme();

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

        <Text style={[styles.topTitle, { color: theme.text }]}>Smart-Home-Control</Text>

        <View style={styles.topSpacer} />
      </View>

      <View style={[styles.headerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <MaterialIcons name="home" size={52} color={theme.primary} />
        <Text style={[styles.headerTitle, { color: theme.text }]}>About This App</Text>
        <Text style={[styles.headerSubtitle, { color: theme.subtext }]}>
          A smart and secure mobile control system for your connected home.
        </Text>
      </View>

      {[
        {
          title: "Overview",
          text: "Smart-Home-Control is a mobile application designed to monitor and control important smart home devices in real time. It provides a simple and organized dashboard for indoor and outdoor home management.",
        },
        {
          title: "Main Features",
          bullets: [
            "Live camera streaming",
            "Indoor LED control",
            "Outdoor LED status",
            "Remote door lock control",
            "Temperature monitoring",
            "Motion detection and history",
            "Fullscreen camera view with time and date",
          ],
        },
        {
          title: "Purpose",
          text: "This application improves home safety, convenience, and automation by allowing users to control devices remotely and receive real-time system information from the smart home environment.",
        },
        {
          title: "Version",
          text: "Version 1.0.0",
        },
      ].map((section, i) => (
        <View key={i} style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{section.title}</Text>
          {section.text ? (
            <Text style={[styles.sectionText, { color: theme.subtext }]}>{section.text}</Text>
          ) : null}
          {section.bullets?.map((b, j) => (
            <Text key={j} style={[styles.bulletText, { color: theme.subtext }]}>• {b}</Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
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
  topTitle: { fontSize: 20, fontWeight: "bold" },
  topSpacer: { width: 42 },

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
  headerTitle: { fontSize: 24, fontWeight: "bold", marginTop: 12 },
  headerSubtitle: { fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 22 },

  infoCard: {
    borderRadius: 20,
    padding: 18,
    elevation: 3,
    borderWidth: 1,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  sectionText: { fontSize: 14, lineHeight: 22 },
  bulletText: { fontSize: 14, marginBottom: 8, lineHeight: 22 },
});

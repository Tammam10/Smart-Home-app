import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AboutScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#2f80ed" />
        </TouchableOpacity>

        <Text style={styles.topTitle}>Smart-Home-Control</Text>

        <View style={styles.topSpacer} />
      </View>

      <View style={styles.headerCard}>
        <MaterialIcons name="home" size={52} color="#2f80ed" />
        <Text style={styles.headerTitle}>About This App</Text>
        <Text style={styles.headerSubtitle}>
          A smart and secure mobile control system for your connected home.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.sectionText}>
          Smart-Home-Control is a mobile application designed to monitor and
          control important smart home devices in real time. It provides a
          simple and organized dashboard for indoor and outdoor home management.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Main Features</Text>
        <Text style={styles.bulletText}>• Live camera streaming</Text>
        <Text style={styles.bulletText}>• Indoor LED control</Text>
        <Text style={styles.bulletText}>• Outdoor LED status</Text>
        <Text style={styles.bulletText}>• Remote door lock control</Text>
        <Text style={styles.bulletText}>• Temperature monitoring</Text>
        <Text style={styles.bulletText}>• Motion detection and history</Text>
        <Text style={styles.bulletText}>
          • Fullscreen camera view with time and date
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Purpose</Text>
        <Text style={styles.sectionText}>
          This application improves home safety, convenience, and automation by
          allowing users to control devices remotely and receive real-time
          system information from the smart home environment.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Version</Text>
        <Text style={styles.sectionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6f4ff",
    paddingHorizontal: 16,
    paddingTop: 20,
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
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  topSpacer: {
    width: 42,
  },
  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
    elevation: 5,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 12,
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
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
  },
  bulletText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
    lineHeight: 22,
  },
});

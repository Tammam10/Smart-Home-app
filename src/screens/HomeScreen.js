import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useState } from "react";
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import DeviceCard from "../components/DeviceCard";
import { useSystem } from "../context/SystemContext";

export default function HomeScreen({ navigation }) {
  const {
    led1,
    setLed1,
    led2,
    setLed2,
    doorLocked,
    setDoorLocked,
    alarmActive,
  } = useSystem();

  const [isCameraFullScreen, setIsCameraFullScreen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const animation = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const toggleMenu = () => {
    Animated.timing(animation, {
      toValue: menuOpen ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.header}>Smart Home Dashboard</Text>
          </View>

          <TouchableOpacity style={styles.profileCircle}>
            <MaterialIcons name="person" size={26} color="#2f80ed" />
          </TouchableOpacity>
        </View>

        <View style={styles.cameraCard}>
          <View style={styles.cameraTopRow}>
            <View style={styles.cameraTitleRow}>
              <MaterialIcons name="videocam" size={24} color="#2f80ed" />
              <Text style={styles.cameraTitle}>Live Camera</Text>
            </View>

            <View style={styles.cameraActions}>
              <View style={styles.liveBadge}>
                <Text style={styles.liveText}>LIVE</Text>
              </View>

              <TouchableOpacity
                style={styles.expandButton}
                onPress={() => setIsCameraFullScreen(true)}
              >
                <MaterialIcons name="open-in-full" size={20} color="#2f80ed" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.cameraPreview}>
            <MaterialIcons name="camera-alt" size={48} color="#94a3b8" />
            <Text style={styles.cameraPlaceholder}>
              Streaming will appear here
            </Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>System Status</Text>
            <Text style={styles.summaryValue}>Online</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Temperature</Text>
            <Text style={styles.summaryValue}>24°C</Text>
          </View>
        </View>

        {alarmActive ? (
          <View style={styles.alertBanner}>
            <MaterialIcons name="warning" size={20} color="#fff" />
            <Text style={styles.alertBannerText}>Emergency Mode is ACTIVE</Text>
          </View>
        ) : null}

        <View style={styles.grid}>
          <DeviceCard
            title="Indoor LED 1"
            value={led1 ? "Active" : "Inactive"}
            icon="lightbulb"
            iconColor="#f59e0b"
            active={led1}
            showSwitch
            switchValue={led1}
            onSwitchChange={() => setLed1(!led1)}
            status="Online"
          />

          <DeviceCard
            title="Indoor LED 2"
            value={led2 ? "Active" : "Inactive"}
            icon="lightbulb-outline"
            iconColor="#eab308"
            active={led2}
            showSwitch
            switchValue={led2}
            onSwitchChange={() => setLed2(!led2)}
            status="Online"
          />

          <DeviceCard
            title="Door Lock"
            value={doorLocked ? "Locked" : "Unlocked"}
            icon="lock"
            iconColor="#3b82f6"
            active={doorLocked}
            showSwitch
            switchValue={doorLocked}
            onSwitchChange={() => setDoorLocked(!doorLocked)}
            status="Online"
          />

          <DeviceCard
            title="Temperature Sensor"
            value="24°C"
            icon="thermostat"
            iconColor="#f97316"
            status="Online"
          />

          <DeviceCard
            title="Motion Sensor"
            value={alarmActive ? "Alert" : "No Motion"}
            icon="directions-run"
            iconColor="#ef4444"
            status={alarmActive ? "Warning" : "Online"}
          />

          <DeviceCard
            title="Outdoor LED"
            value="Auto Mode"
            icon="wb-sunny"
            iconColor="#22c55e"
            status="Online"
          />
        </View>

        <View style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <MaterialIcons name="history" size={22} color="#2f80ed" />
            <Text style={styles.historyTitle}>Recent Activity</Text>
          </View>

          <View style={styles.historyItem}>
            <MaterialIcons name="motion-photos-on" size={18} color="#ef4444" />
            <Text style={styles.historyText}>Motion detected at 10:15 AM</Text>
          </View>

          <View style={styles.historyItem}>
            <MaterialIcons name="lock-open" size={18} color="#3b82f6" />
            <Text style={styles.historyText}>Door unlocked at 11:00 AM</Text>
          </View>

          <View style={styles.historyItem}>
            <MaterialIcons name="lightbulb" size={18} color="#f59e0b" />
            <Text style={styles.historyText}>LED 1 turned on at 12:20 PM</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.fabContainer}>
        <Animated.View
          style={[
            styles.fabItem,
            {
              transform: [
                {
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -70],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <MaterialIcons name="person" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.fabItem,
            {
              transform: [
                {
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -140],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity onPress={() => navigation.navigate("Emergency")}>
            <MaterialIcons name="warning" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.fabItem,
            {
              transform: [
                {
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -210],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity onPress={() => navigation.navigate("Support")}>
            <MaterialIcons name="call" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.fabItem,
            {
              transform: [
                {
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -280],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity onPress={() => navigation.navigate("About")}>
            <MaterialIcons name="info" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity style={styles.fabMain} onPress={toggleMenu}>
          <MaterialIcons name="settings" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isCameraFullScreen}
        animationType="slide"
        transparent={false}
      >
        <View style={styles.fullScreenContainer}>
          <View style={styles.fullScreenTopBar}>
            <Text style={styles.fullScreenTitle}>Live Camera Stream</Text>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsCameraFullScreen(false)}
            >
              <MaterialIcons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.fullScreenCameraArea}>
            <MaterialIcons name="camera-alt" size={80} color="#94a3b8" />
            <Text style={styles.fullScreenPlaceholder}>
              Streaming will appear here
            </Text>
          </View>

          <View style={styles.dateTimeContainer}>
            <Text style={styles.timeText}>{formatTime(currentDateTime)}</Text>
            <Text style={styles.dateText}>{formatDate(currentDateTime)}</Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6f4ff",
    paddingHorizontal: 14,
    paddingTop: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  welcomeText: {
    fontSize: 14,
    color: "#6b7280",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 4,
  },
  profileCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  cameraCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    elevation: 5,
  },
  cameraTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cameraTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cameraTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#111827",
    marginLeft: 8,
  },
  cameraActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  liveBadge: {
    backgroundColor: "#fee2e2",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
  },
  liveText: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "bold",
  },
  expandButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#eef5ff",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraPreview: {
    marginTop: 16,
    minHeight: 180,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cameraPlaceholder: {
    marginTop: 10,
    color: "#64748b",
    fontSize: 15,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  summaryCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    elevation: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 20,
    color: "#111827",
    fontWeight: "bold",
    marginTop: 8,
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  alertBannerText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  historyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 18,
    marginBottom: 30,
    elevation: 5,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginLeft: 8,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  historyText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#374151",
  },
  fabContainer: {
    position: "absolute",
    bottom: 30,
    right: 20,
    alignItems: "center",
  },
  fabMain: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2f80ed",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  fabItem: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  fullScreenTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  fullScreenTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenCameraArea: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenPlaceholder: {
    marginTop: 14,
    color: "#cbd5e1",
    fontSize: 18,
  },
  dateTimeContainer: {
    marginTop: 18,
    alignItems: "center",
  },
  timeText: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "bold",
  },
  dateText: {
    color: "#cbd5e1",
    fontSize: 16,
    marginTop: 6,
  },
});

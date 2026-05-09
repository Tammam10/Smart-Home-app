import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Animated, Modal,
  ScrollView, StyleSheet, Text,
  TouchableOpacity, View,
} from "react-native";
import WebView from "react-native-webview";
import DeviceCard from "../components/DeviceCard";
import { auth } from "../firebase/config";
import { useSettings } from "../context/SettingsContext";
import { useSystem } from "../context/SystemContext";
import { useTheme } from "../context/ThemeContext";

export default function HomeScreen({ navigation }) {
  const {
    led1, setLed1, led2, setLed2,
    doorLocked, setDoorLocked,
    alarmActive, outdoorLed,
    temperature, motionDetected,
    activityLog, simulateSensors, loading, streamUrl,
    gateStatus,
  } = useSystem();

  const { theme, isDark } = useTheme();
  const { tempUnit } = useSettings();
  const user = auth.currentUser;

  const [isCameraFullScreen, setIsCameraFullScreen] = useState(false);
  const [currentDateTime, setCurrentDateTime]       = useState(new Date());
  const [menuOpen, setMenuOpen]                     = useState(false);

  const fabAnimation      = useRef(new Animated.Value(0)).current;
  const motionRingScale   = useRef(new Animated.Value(1)).current;
  const motionRingOpacity = useRef(new Animated.Value(0)).current;
  const motionAnim        = useRef(null);
  const emergencyOpacity  = useRef(new Animated.Value(1)).current;
  const emergencyAnim     = useRef(null);

  // Motion pulse animation
  useEffect(() => {
    if (motionDetected) {
      motionAnim.current = Animated.loop(Animated.parallel([
        Animated.sequence([
          Animated.timing(motionRingScale,   { toValue: 2.2, duration: 900, useNativeDriver: true }),
          Animated.timing(motionRingScale,   { toValue: 1,   duration: 900, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(motionRingOpacity, { toValue: 0.7, duration: 450, useNativeDriver: true }),
          Animated.timing(motionRingOpacity, { toValue: 0,   duration: 900, useNativeDriver: true }),
        ]),
      ]));
      motionAnim.current.start();
    } else {
      if (motionAnim.current) motionAnim.current.stop();
      motionRingScale.setValue(1);
      motionRingOpacity.setValue(0);
    }
  }, [motionDetected]);

  // Emergency flash animation
  useEffect(() => {
    if (alarmActive) {
      emergencyAnim.current = Animated.loop(Animated.sequence([
        Animated.timing(emergencyOpacity, { toValue: 0.25, duration: 350, useNativeDriver: true }),
        Animated.timing(emergencyOpacity, { toValue: 1,    duration: 350, useNativeDriver: true }),
      ]));
      emergencyAnim.current.start();
    } else {
      if (emergencyAnim.current) emergencyAnim.current.stop();
      emergencyOpacity.setValue(1);
    }
  }, [alarmActive]);

  // Clock
  useEffect(() => {
    const t = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Sensor simulation every 5 s
  useEffect(() => {
    const i = setInterval(() => simulateSensors(), 5000);
    return () => clearInterval(i);
  }, [simulateSensors]);


  const formatTime = (d) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formatDate = (d) =>
    d.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  // Temperature with unit conversion
  const displayTemp = tempUnit === "F"
    ? Math.round(temperature * 9 / 5 + 32)
    : temperature;
  const tempLabel = `${displayTemp}°${tempUnit}`;

  const toggleFab = () => {
    Animated.timing(fabAnimation, {
      toValue: menuOpen ? 0 : 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
    setMenuOpen(!menuOpen);
  };

  const activeDevices = [led1, led2, doorLocked, outdoorLed].filter(Boolean).length;

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.subtext }]}>Loading devices…</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.root, { backgroundColor: theme.bg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <View style={[styles.header, { backgroundColor: theme.header }]}>
          <View style={styles.headerTop}>
            <View style={styles.headerBrand}>
              <View style={[styles.headerIconBox, { backgroundColor: theme.headerSub }]}>
                <MaterialIcons name="home" size={22} color={theme.headerText} />
              </View>
              <Text style={[styles.headerBrandText, { color: theme.headerText }]}>Smart Home</Text>
            </View>
            <TouchableOpacity
              style={[styles.avatarBtn, { backgroundColor: theme.headerSub }]}
              onPress={() => navigation.navigate("Profile")}
            >
              <MaterialIcons name="person" size={22} color={theme.headerText} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.headerGreeting, { color: "rgba(255,255,255,0.6)" }]}>Welcome back</Text>
          <Text style={[styles.headerEmail, { color: theme.headerText }]}>{user?.email ?? "User"}</Text>
          <View style={[styles.headerClock, { backgroundColor: theme.headerSub }]}>
            <Text style={[styles.headerTime, { color: theme.headerText }]}>
              {currentDateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
            <Text style={[styles.headerDate, { color: "rgba(255,255,255,0.6)" }]}>
              {currentDateTime.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
            </Text>
          </View>
        </View>

        {/* ── STAT CHIPS ─────────────────────────────────────────────── */}
        <View style={styles.statRow}>
          <View style={[styles.statChip, { backgroundColor: alarmActive ? theme.statAlert.bg : theme.statOnline.bg }]}>
            <MaterialIcons name="wifi" size={15} color={alarmActive ? theme.statAlert.text : theme.statOnline.text} />
            <Text style={[styles.statChipText, { color: alarmActive ? theme.statAlert.text : theme.statOnline.text }]}>
              {alarmActive ? "ALERT" : "Online"}
            </Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: theme.statTemp.bg }]}>
            <MaterialIcons name="thermostat" size={15} color={theme.statTemp.text} />
            <Text style={[styles.statChipText, { color: theme.statTemp.text }]}>{tempLabel}</Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: theme.statDevice.bg }]}>
            <MaterialIcons name="devices" size={15} color={theme.statDevice.text} />
            <Text style={[styles.statChipText, { color: theme.statDevice.text }]}>{activeDevices} Active</Text>
          </View>
        </View>

        {/* ── EMERGENCY BANNER ───────────────────────────────────────── */}
        {alarmActive && (
          <Animated.View style={[styles.emergencyBanner, { opacity: emergencyOpacity }]}>
            <MaterialIcons name="warning" size={20} color="#fff" />
            <Text style={styles.emergencyText}>EMERGENCY MODE ACTIVE</Text>
            <MaterialIcons name="warning" size={20} color="#fff" />
          </Animated.View>
        )}

        {/* ── CAMERA CARD ────────────────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardIconBox, { backgroundColor: theme.statDevice.bg }]}>
                <MaterialIcons name="videocam" size={18} color={theme.primary} />
              </View>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Live Camera</Text>
            </View>
            <View style={styles.cameraActions}>
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsCameraFullScreen(true)}
                style={[styles.expandBtn, { backgroundColor: theme.statDevice.bg }]}
              >
                <MaterialIcons name="open-in-full" size={18} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </View>
          {streamUrl ? (
            <WebView
              source={{ uri: streamUrl }}
              style={styles.cameraPreview}
              scrollEnabled={false}
              bounces={false}
              mediaPlaybackRequiresUserAction={false}
            />
          ) : (
            <View style={[styles.cameraPlaceholderBox, { backgroundColor: theme.sensorBg, borderColor: theme.border }]}>
              <MaterialIcons name="camera-alt" size={44} color={theme.subtext} />
              <Text style={[styles.cameraPlaceholderText, { color: theme.subtext }]}>
                Camera offline — start ESP32-S3
              </Text>
            </View>
          )}
        </View>

        {/* ── GATE CARD ──────────────────────────────────────────────── */}
        {(() => {
          const gateMap = {
            open:              { color: "#16a34a", bg: isDark ? "#14532d" : "#dcfce7", icon: "sensor-door",   label: "Open",      openPct: 0.15 },
            closed:            { color: "#64748b", bg: isDark ? "#1e293b" : "#f1f5f9", icon: "door-front",    label: "Closed",    openPct: 0.9  },
            opening:           { color: "#2563eb", bg: isDark ? "#1e3a8a" : "#dbeafe", icon: "arrow-forward", label: "Opening…",  openPct: 0.5  },
            closing:           { color: "#2563eb", bg: isDark ? "#1e3a8a" : "#dbeafe", icon: "arrow-back",    label: "Closing…",  openPct: 0.5  },
            stopped:           { color: "#d97706", bg: isDark ? "#451a03" : "#fef3c7", icon: "pause-circle",  label: "Stopped",   openPct: 0.5  },
            obstacle_detected: { color: "#dc2626", bg: isDark ? "#450a0a" : "#fee2e2", icon: "warning",       label: "Obstacle!", openPct: 0.5  },
          };
          const gc = gateMap[gateStatus] ?? gateMap.closed;
          return (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => navigation.navigate("Gate")}
              activeOpacity={0.88}
            >
              {/* Header */}
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <View style={[styles.cardIconBox, { backgroundColor: gc.bg }]}>
                    <MaterialIcons name="fence" size={18} color={gc.color} />
                  </View>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>Sliding Gate</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={[styles.statChip, { backgroundColor: gc.bg }]}>
                    <MaterialIcons name={gc.icon} size={14} color={gc.color} />
                    <Text style={[styles.statChipText, { color: gc.color }]}>{gc.label}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={theme.subtext} />
                </View>
              </View>

              {/* Gate visual */}
              <View style={[styles.gateVisual, { borderColor: theme.border, backgroundColor: isDark ? "#0f172a" : "#f8fafc" }]}>
                {/* Ground track */}
                <View style={[styles.gateTrack, { backgroundColor: theme.subtext + "40" }]} />
                {/* Gate panel */}
                <View style={[
                  styles.gatePanel,
                  { backgroundColor: gc.color + "25", borderColor: gc.color + "70", width: `${gc.openPct * 100}%` },
                ]}>
                  {[...Array(4)].map((_, i) => (
                    <View key={i} style={[styles.gateSlat, { backgroundColor: gc.color + "50" }]} />
                  ))}
                </View>
                {/* Fixed post */}
                <View style={[styles.gatePost, { backgroundColor: theme.subtext + "60" }]} />
                {/* Status label inside visual */}
                <View style={[styles.gateStatusBadge, { backgroundColor: gc.bg }]}>
                  <Text style={[styles.gateStatusBadgeText, { color: gc.color }]}>{gc.label}</Text>
                </View>
              </View>

              <Text style={[styles.gateTapHint, { color: theme.subtext }]}>
                Tap to control gate
              </Text>
            </TouchableOpacity>
          );
        })()}

        {/* ── DEVICES ────────────────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Devices</Text>
        <View style={styles.grid}>
          <DeviceCard
            title="Indoor LED 1" value={led1 ? "Active" : "Inactive"}
            icon="lightbulb" iconColor="#f59e0b" active={led1}
            showSwitch switchValue={led1} onSwitchChange={() => setLed1(!led1)} status="Online"
          />
          <DeviceCard
            title="Indoor LED 2" value={led2 ? "Active" : "Inactive"}
            icon="lightbulb-outline" iconColor="#eab308" active={led2}
            showSwitch switchValue={led2} onSwitchChange={() => setLed2(!led2)} status="Online"
          />
          <DeviceCard
            title="Door Lock" value={doorLocked ? "Locked" : "Unlocked"}
            icon="lock" iconColor="#3b82f6" active={doorLocked}
            showSwitch switchValue={doorLocked} onSwitchChange={() => setDoorLocked(!doorLocked)} status="Online"
          />
          <DeviceCard
            title="Outdoor LED" value={outdoorLed ? "On — Motion" : "Off — Clear"}
            icon="wb-sunny" iconColor="#22c55e" active={outdoorLed}
            status={outdoorLed ? "Auto: On" : "Auto: Off"}
          />
        </View>

        {/* ── SENSORS ────────────────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Sensors</Text>
        <View style={styles.sensorRow}>
          {/* Temperature */}
          <View style={[styles.sensorCard, { backgroundColor: isDark ? "#1c1100" : "#fff7ed" }]}>
            <View style={[styles.sensorIconBox, { backgroundColor: isDark ? "#431407" : "#fed7aa" }]}>
              <MaterialIcons name="thermostat" size={28} color="#ea580c" />
            </View>
            <Text style={[styles.sensorName, { color: theme.subtext }]}>Temperature</Text>
            <Text style={[styles.sensorReading, { color: "#ea580c" }]}>{tempLabel}</Text>
            <View style={[styles.sensorStatusPill, { backgroundColor: isDark ? "#431407" : "#fef3c7" }]}>
              <Text style={[styles.sensorStatusText, { color: "#d97706" }]}>Online</Text>
            </View>
          </View>

          {/* Motion */}
          <View style={[
            styles.sensorCard,
            motionDetected
              ? { backgroundColor: isDark ? "#1f0000" : "#fff5f5", borderWidth: 1.5, borderColor: "#fca5a5" }
              : { backgroundColor: isDark ? "#001a0d" : "#f0fdf4" },
          ]}>
            <View style={styles.motionIconWrapper}>
              <Animated.View style={[
                styles.motionPulseRing,
                { transform: [{ scale: motionRingScale }], opacity: motionRingOpacity },
              ]} />
              <View style={[styles.sensorIconBox, { backgroundColor: motionDetected ? "#fee2e2" : "#bbf7d0" }]}>
                <MaterialIcons name="directions-run" size={28} color={motionDetected ? "#dc2626" : "#16a34a"} />
              </View>
            </View>
            <Text style={[styles.sensorName, { color: theme.subtext }]}>Motion</Text>
            <Text style={[styles.sensorReading, {
              color: motionDetected ? "#dc2626" : "#16a34a", fontSize: 14,
            }]}>
              {motionDetected ? "Detected!" : "Clear"}
            </Text>
            <View style={[styles.sensorStatusPill, { backgroundColor: motionDetected ? "#fee2e2" : "#dcfce7" }]}>
              <Text style={[styles.sensorStatusText, { color: motionDetected ? "#dc2626" : "#16a34a" }]}>
                {motionDetected ? "⚠ Warning" : "● Online"}
              </Text>
            </View>
          </View>
        </View>

        {/* ── ACTIVITY LOG ───────────────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardIconBox, { backgroundColor: isDark ? "#2e1a47" : "#f5f3ff" }]}>
                <MaterialIcons name="history" size={18} color="#7c3aed" />
              </View>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Recent Activity</Text>
            </View>
          </View>
          {activityLog.length === 0 ? (
            <Text style={[styles.emptyLog, { color: theme.subtext }]}>No activity yet.</Text>
          ) : (
            activityLog.map((entry) => (
              <View key={entry.id} style={[styles.logItem, { borderBottomColor: theme.logBorder }]}>
                <View style={[styles.logIconBox, { backgroundColor: entry.color + "22" }]}>
                  <MaterialIcons name={entry.icon} size={16} color={entry.color} />
                </View>
                <View style={styles.logContent}>
                  <Text style={[styles.logText, { color: theme.text }]}>{entry.text}</Text>
                  <Text style={[styles.logTime, { color: theme.subtext }]}>{entry.time}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── FAB MENU ─────────────────────────────────────────────────── */}
      <View style={styles.fabContainer}>
        {[
          { offset: -70,  icon: "person",  route: "Profile"   },
          { offset: -140, icon: "warning", route: "Emergency" },
          { offset: -210, icon: "call",    route: "Support"   },
          { offset: -280, icon: "info",    route: "About"     },
        ].map(({ offset, icon, route }) => (
          <Animated.View key={route} style={[styles.fabItem, {
            transform: [{
              translateY: fabAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, offset] }),
            }],
          }]}>
            <TouchableOpacity onPress={() => navigation.navigate(route)}>
              <MaterialIcons name={icon} size={22} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        ))}
        <TouchableOpacity
          style={[styles.fabMain, alarmActive && styles.fabMainAlert]}
          onPress={toggleFab}
        >
          <MaterialIcons name="settings" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ── FULLSCREEN CAMERA ────────────────────────────────────────── */}
      <Modal visible={isCameraFullScreen} animationType="slide" transparent={false}>
        <View style={[styles.fullScreenContainer, { backgroundColor: "#0f172a" }]}>
          <View style={styles.fullScreenTopBar}>
            <Text style={styles.fullScreenTitle}>Live Camera Stream</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsCameraFullScreen(false)}>
              <MaterialIcons name="close" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
          {streamUrl ? (
            <WebView
              source={{ uri: streamUrl }}
              style={styles.fullScreenCamera}
              scrollEnabled={false}
              bounces={false}
              mediaPlaybackRequiresUserAction={false}
            />
          ) : (
            <View style={styles.fullScreenCamera}>
              <MaterialIcons name="camera-alt" size={72} color="#475569" />
              <Text style={styles.fullScreenPlaceholder}>Camera offline</Text>
            </View>
          )}
          <View style={styles.fullScreenClock}>
            <Text style={styles.fullScreenTime}>{formatTime(currentDateTime)}</Text>
            <Text style={styles.fullScreenDate}>{formatDate(currentDateTime)}</Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root:             { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText:      { marginTop: 14, fontSize: 15 },

  // Header
  header:          { paddingTop: 52, paddingBottom: 28, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerTop:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  headerBrand:     { flexDirection: "row", alignItems: "center" },
  headerIconBox:   { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 8 },
  headerBrandText: { fontSize: 18, fontWeight: "700" },
  avatarBtn:       { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  headerGreeting:  { fontSize: 13, fontWeight: "500" },
  headerEmail:     { fontSize: 20, fontWeight: "700", marginTop: 2 },
  headerClock:     { marginTop: 16, borderRadius: 14, padding: 12, alignItems: "center" },
  headerTime:      { fontSize: 28, fontWeight: "700", letterSpacing: 1 },
  headerDate:      { fontSize: 13, marginTop: 2 },

  // Stat chips
  statRow:      { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, marginTop: 16, marginBottom: 4 },
  statChip:     { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6 },
  statChipText: { fontSize: 13, fontWeight: "700" },

  // Emergency
  emergencyBanner: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#dc2626", borderRadius: 14, marginHorizontal: 16, marginTop: 12, paddingVertical: 14, paddingHorizontal: 16, gap: 10 },
  emergencyText:   { color: "#fff", fontWeight: "800", fontSize: 15, letterSpacing: 0.5 },

  // Cards
  card:       { borderRadius: 20, marginHorizontal: 16, marginTop: 14, padding: 16, elevation: 3, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  cardTitleRow:{ flexDirection: "row", alignItems: "center", gap: 10 },
  cardIconBox: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  cardTitle:   { fontSize: 16, fontWeight: "700" },

  // Camera
  cameraActions:        { flexDirection: "row", alignItems: "center", gap: 8 },
  livePill:             { flexDirection: "row", alignItems: "center", backgroundColor: "#fee2e2", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, gap: 5 },
  liveDot:              { width: 7, height: 7, borderRadius: 4, backgroundColor: "#dc2626" },
  liveText:             { color: "#dc2626", fontSize: 11, fontWeight: "800" },
  expandBtn:            { width: 32, height: 32, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  cameraPreview:        { minHeight: 170, borderRadius: 14 },
  cameraPlaceholderBox: { minHeight: 170, borderRadius: 14, justifyContent: "center", alignItems: "center", borderWidth: 1 },
  cameraPlaceholderText:{ marginTop: 10, fontSize: 14 },

  // Section
  sectionTitle: { fontSize: 17, fontWeight: "700", marginHorizontal: 20, marginTop: 20, marginBottom: 4 },
  grid:         { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 16, marginTop: 4 },

  // Sensors
  sensorRow:       { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, marginTop: 8 },
  sensorCard:      { width: "48%", borderRadius: 20, padding: 16, alignItems: "center", elevation: 3, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  sensorIconBox:   { width: 56, height: 56, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  sensorName:      { fontSize: 13, fontWeight: "600", marginTop: 10 },
  sensorReading:   { fontSize: 22, fontWeight: "800", marginTop: 4 },
  sensorStatusPill:{ borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8 },
  sensorStatusText:{ fontSize: 11, fontWeight: "700" },
  motionIconWrapper:{ position: "relative", width: 56, height: 56, justifyContent: "center", alignItems: "center" },
  motionPulseRing: { position: "absolute", width: 56, height: 56, borderRadius: 18, borderWidth: 2, borderColor: "#ef4444" },

  // Activity log
  emptyLog:   { fontSize: 14, textAlign: "center", paddingVertical: 12 },
  logItem:    { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1 },
  logIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
  logContent: { flex: 1 },
  logText:    { fontSize: 14, fontWeight: "500" },
  logTime:    { fontSize: 11, marginTop: 2 },

  // Gate card visual
  gateVisual: {
    height: 80, borderRadius: 14, borderWidth: 1, marginBottom: 10,
    overflow: "hidden", position: "relative", justifyContent: "flex-end",
  },
  gateTrack:  { position: "absolute", bottom: 6, left: 0, right: 0, height: 5, borderRadius: 3 },
  gatePanel:  {
    position: "absolute", left: 0, top: 0, bottom: 0,
    borderRightWidth: 2, borderTopRightRadius: 6, borderBottomRightRadius: 6,
    flexDirection: "row", alignItems: "stretch", paddingHorizontal: 4, gap: 4,
  },
  gateSlat:   { flex: 1, borderRadius: 2, marginVertical: 6 },
  gatePost:   {
    position: "absolute", right: 0, top: 0, bottom: 0,
    width: 12, borderTopLeftRadius: 4, borderBottomLeftRadius: 4,
  },
  gateStatusBadge: {
    position: "absolute", top: 8, right: 18,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  gateStatusBadgeText: { fontSize: 11, fontWeight: "800" },
  gateTapHint: { fontSize: 12, textAlign: "center", marginTop: 2 },

  // FAB
  fabContainer: { position: "absolute", bottom: 28, right: 20, alignItems: "center" },
  fabMain:      { width: 58, height: 58, borderRadius: 29, backgroundColor: "#2563eb", justifyContent: "center", alignItems: "center", elevation: 8, shadowColor: "#2563eb", shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  fabMainAlert: { backgroundColor: "#dc2626" },
  fabItem:      { position: "absolute", width: 46, height: 46, borderRadius: 23, backgroundColor: "#1e293b", justifyContent: "center", alignItems: "center", elevation: 6 },

  // Fullscreen camera
  fullScreenContainer: { flex: 1, paddingTop: 50, paddingHorizontal: 16, paddingBottom: 24 },
  fullScreenTopBar:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  fullScreenTitle:     { color: "#fff", fontSize: 20, fontWeight: "700" },
  closeBtn:            { width: 38, height: 38, borderRadius: 10, backgroundColor: "#1e293b", justifyContent: "center", alignItems: "center" },
  fullScreenCamera:    { flex: 1, borderRadius: 20, backgroundColor: "#1e293b", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#334155" },
  fullScreenPlaceholder:{ marginTop: 14, color: "#94a3b8", fontSize: 16 },
  fullScreenClock:     { marginTop: 16, alignItems: "center" },
  fullScreenTime:      { color: "#fff", fontSize: 30, fontWeight: "700" },
  fullScreenDate:      { color: "#94a3b8", fontSize: 14, marginTop: 4 },
});

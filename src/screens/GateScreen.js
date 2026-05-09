import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useRef, useState } from "react";
import {
  Animated, Easing, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from "react-native";
import { useSystem } from "../context/SystemContext";
import { useTheme } from "../context/ThemeContext";

const STATUS_CONFIG = {
  open:              { label: "Open",      icon: "sensor-door",   color: "#16a34a", bg: "#dcfce7", darkBg: "#14532d" },
  closed:            { label: "Closed",    icon: "door-front",    color: "#64748b", bg: "#f1f5f9", darkBg: "#1e293b" },
  opening:           { label: "Opening…",  icon: "arrow-forward", color: "#2563eb", bg: "#dbeafe", darkBg: "#1e3a8a" },
  closing:           { label: "Closing…",  icon: "arrow-back",    color: "#2563eb", bg: "#dbeafe", darkBg: "#1e3a8a" },
  stopped:           { label: "Stopped",   icon: "pause-circle",  color: "#d97706", bg: "#fef3c7", darkBg: "#451a03" },
  obstacle_detected: { label: "Obstacle!", icon: "warning",       color: "#dc2626", bg: "#fee2e2", darkBg: "#450a0a" },
};

export default function GateScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const { gateStatus = "closed", setGateCommand } = useSystem();

  const [lastCmd, setLastCmd] = useState(null);

  const cfg      = STATUS_CONFIG[gateStatus] ?? STATUS_CONFIG.closed;
  const isMoving = gateStatus === "opening" || gateStatus === "closing";
  const iconBg   = isDark ? cfg.darkBg : cfg.bg;

  const spinAnim  = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Spin while moving
  useEffect(() => {
    if (isMoving) {
      Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: true })
      ).start();
    } else {
      spinAnim.stopAnimation();
      spinAnim.setValue(0);
    }
  }, [isMoving]);

  // Pulse on obstacle
  useEffect(() => {
    if (gateStatus === "obstacle_detected") {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 380, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 380, useNativeDriver: true }),
      ])).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [gateStatus]);

  const spinDeg = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  // Simple disable rules — only block obvious conflicts
  const openDisabled  = gateStatus === "open"   || gateStatus === "opening";
  const closeDisabled = gateStatus === "closed" || gateStatus === "closing";
  const stopDisabled  = false; // STOP is always available

  const sendCommand = (cmd) => {
    setLastCmd(cmd);
    setGateCommand(cmd);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>

      {/* TOP BAR */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={22} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: theme.text }]}>Sliding Gate</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* OBSTACLE WARNING */}
        {gateStatus === "obstacle_detected" && (
          <Animated.View style={[styles.warningBanner, { transform: [{ scale: pulseAnim }] }]}>
            <MaterialIcons name="warning" size={22} color="#fff" />
            <View style={{ flex: 1 }}>
              <Text style={styles.warningTitle}>Obstacle Detected!</Text>
              <Text style={styles.warningBody}>Remove the obstacle, then press Open.</Text>
            </View>
          </Animated.View>
        )}

        {/* STATUS CARD */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionLabel, { color: theme.subtext }]}>GATE STATUS</Text>

          <Animated.View style={[
            styles.statusIconBox, { backgroundColor: iconBg },
            isMoving && { transform: [{ rotate: spinDeg }] },
          ]}>
            <MaterialIcons name={cfg.icon} size={52} color={cfg.color} />
          </Animated.View>

          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>

          <View style={[styles.statusPill, { backgroundColor: iconBg }]}>
            <View style={[styles.dot, { backgroundColor: cfg.color }]} />
            <Text style={[styles.pillText, { color: cfg.color }]}>
              {isMoving ? "Gate in motion…" : `Gate is ${cfg.label.toLowerCase()}`}
            </Text>
          </View>
        </View>

        {/* CONTROL CARD */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionLabel, { color: theme.subtext }]}>CONTROLS</Text>

          {/* OPEN */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: openDisabled ? theme.inputBg : "#16a34a" },
              lastCmd === "open" && !openDisabled && styles.activeBtn,
            ]}
            onPress={() => sendCommand("open")}
            disabled={openDisabled}
            activeOpacity={0.75}
          >
            <View style={[styles.actionIconBox, { backgroundColor: openDisabled ? theme.border : "#15803d" }]}>
              <MaterialIcons name="sensor-door" size={24} color="#fff" />
            </View>
            <View style={styles.actionTextBox}>
              <Text style={[styles.actionTitle, { color: openDisabled ? theme.subtext : "#fff" }]}>Open Gate</Text>
              <Text style={[styles.actionSub, { color: openDisabled ? theme.subtext + "88" : "#bbf7d0" }]}>
                {openDisabled ? (gateStatus === "open" ? "Already open" : "Gate is opening…") : "Send open command"}
              </Text>
            </View>
            {!openDisabled && <MaterialIcons name="arrow-forward-ios" size={16} color="#fff" />}
          </TouchableOpacity>

          {/* STOP */}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#d97706" }]}
            onPress={() => sendCommand("stop")}
            activeOpacity={0.75}
          >
            <View style={[styles.actionIconBox, { backgroundColor: "#b45309" }]}>
              <MaterialIcons name="stop-circle" size={24} color="#fff" />
            </View>
            <View style={styles.actionTextBox}>
              <Text style={[styles.actionTitle, { color: "#fff" }]}>Stop Gate</Text>
              <Text style={[styles.actionSub, { color: "#fde68a" }]}>Halt motion immediately</Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={16} color="#fff" />
          </TouchableOpacity>

          {/* CLOSE */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: closeDisabled ? theme.inputBg : "#2563eb" },
              lastCmd === "close" && !closeDisabled && styles.activeBtn,
            ]}
            onPress={() => sendCommand("close")}
            disabled={closeDisabled}
            activeOpacity={0.75}
          >
            <View style={[styles.actionIconBox, { backgroundColor: closeDisabled ? theme.border : "#1d4ed8" }]}>
              <MaterialIcons name="door-front" size={24} color="#fff" />
            </View>
            <View style={styles.actionTextBox}>
              <Text style={[styles.actionTitle, { color: closeDisabled ? theme.subtext : "#fff" }]}>Close Gate</Text>
              <Text style={[styles.actionSub, { color: closeDisabled ? theme.subtext + "88" : "#bfdbfe" }]}>
                {closeDisabled ? (gateStatus === "closed" ? "Already closed" : "Gate is closing…") : "Send close command"}
              </Text>
            </View>
            {!closeDisabled && <MaterialIcons name="arrow-forward-ios" size={16} color="#fff" />}
          </TouchableOpacity>
        </View>

        {/* INFO CARD */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionLabel, { color: theme.subtext }]}>SAFETY FEATURES</Text>
          {[
            { icon: "sensors",   color: "#2563eb", text: "Auto-stops at limit switches (open & close positions)" },
            { icon: "warning",   color: "#d97706", text: "Obstacle sensor stops gate while closing" },
            { icon: "undo",      color: "#16a34a", text: "Reverses slightly after obstacle detected" },
            { icon: "speed",     color: "#7c3aed", text: "Smooth acceleration & deceleration on 28BYJ-48" },
          ].map((item, i, arr) => (
            <View
              key={i}
              style={[styles.infoRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.logBorder }]}
            >
              <View style={[styles.infoIconBox, { backgroundColor: item.color + "20" }]}>
                <MaterialIcons name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={[styles.infoText, { color: theme.text }]}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, paddingTop: 52 },
  scroll: { padding: 16, gap: 14 },

  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: "center", alignItems: "center", borderWidth: 1, elevation: 2,
  },
  topBarTitle: { fontSize: 18, fontWeight: "700" },

  warningBanner: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#dc2626", borderRadius: 16, padding: 16,
  },
  warningTitle: { color: "#fff", fontWeight: "800", fontSize: 15 },
  warningBody:  { color: "#fecaca", fontSize: 13, marginTop: 2 },

  card: {
    borderRadius: 22, padding: 20, borderWidth: 1, elevation: 3,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  sectionLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 0.8, marginBottom: 18 },

  // Status
  statusIconBox: {
    width: 96, height: 96, borderRadius: 28,
    justifyContent: "center", alignItems: "center",
    alignSelf: "center", marginBottom: 14,
  },
  statusText: { fontSize: 28, fontWeight: "800", textAlign: "center", marginBottom: 14 },
  statusPill: {
    flexDirection: "row", alignItems: "center", gap: 8,
    alignSelf: "center", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  },
  dot:      { width: 8, height: 8, borderRadius: 4 },
  pillText: { fontSize: 13, fontWeight: "600" },

  // Action buttons (vertical list)
  actionBtn: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 16, padding: 16, marginBottom: 10,
  },
  activeBtn:     { opacity: 0.85 },
  actionIconBox: { width: 44, height: 44, borderRadius: 13, justifyContent: "center", alignItems: "center" },
  actionTextBox: { flex: 1 },
  actionTitle:   { fontSize: 16, fontWeight: "700" },
  actionSub:     { fontSize: 12, marginTop: 2 },

  // Info
  infoRow:    { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  infoIconBox:{ width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  infoText:   { flex: 1, fontSize: 13, lineHeight: 18 },
});

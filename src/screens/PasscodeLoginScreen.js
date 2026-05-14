import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Alert, Animated, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

const ACCOUNTS_KEY  = "@smart_home_accounts";
const CODE_LEN      = 4;
const MAX_ATTEMPTS  = 3;

const PAD = [
  ["1","2","3"],
  ["4","5","6"],
  ["7","8","9"],
  [null,"0","del"],
];

export default function PasscodeLoginScreen({ navigation }) {
  const { theme, isDark } = useTheme();

  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [pin,      setPin]      = useState("");
  const [attempts, setAttempts] = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const shakeAnim = useRef(new Animated.Value(0)).current;

  // ── Load accounts from AsyncStorage, stripping any legacy plaintext passwords ─
  useEffect(() => {
    (async () => {
      try {
        const raw  = await AsyncStorage.getItem(ACCOUNTS_KEY);
        const list = raw ? JSON.parse(raw) : [];
        // Migrate: remove password field from any previously stored entries
        const cleaned = list.map(({ uid, email, passcode }) => ({ uid, email, passcode }));
        if (list.some((a) => a.password !== undefined)) {
          await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(cleaned));
        }
        setAccounts(cleaned);
        if (cleaned.length === 1) setSelected(cleaned[0]);
      } catch {
        setAccounts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Shake animation ──────────────────────────────────────────────────────────
  const shake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue:  12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:   8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:   0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  // ── Numpad handlers ──────────────────────────────────────────────────────────
  const dots = Array.from({ length: CODE_LEN }, (_, i) => i < pin.length);

  const handleDigit = (d) => {
    if (!selected || pin.length >= CODE_LEN) return;
    const next = pin + d;
    setPin(next);
    setErrorMsg("");
    if (next.length === CODE_LEN) submitPin(next);
  };

  const handleDelete = () => {
    setPin((p) => p.slice(0, -1));
    setErrorMsg("");
  };

  // ── Submit passcode ───────────────────────────────────────────────────────────
  const submitPin = (entered) => {
    const stored = selected?.passcode != null ? String(selected.passcode).trim() : null;

    if (!stored) {
      setErrorMsg("No passcode found. Use email & password below.");
      setPin("");
      return;
    }

    if (String(entered).trim() !== stored) {
      const next = attempts + 1;
      setAttempts(next);
      setPin("");
      shake();
      if (next >= MAX_ATTEMPTS) {
        Alert.alert(
          "Too Many Attempts",
          "Please log in with your email and password.",
          [{ text: "OK", onPress: () => navigation.replace("Login") }],
        );
      } else {
        const left = MAX_ATTEMPTS - next;
        setErrorMsg(`Incorrect passcode — ${left} attempt${left === 1 ? "" : "s"} left.`);
      }
      return;
    }

    navigation.replace("Home");
  };

  // ── Select account ────────────────────────────────────────────────────────────
  const selectAccount = (acc) => {
    setSelected(acc);
    setPin("");
    setErrorMsg("");
    setAttempts(0);
  };

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.root, { backgroundColor: theme.bg, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // ── UI ────────────────────────────────────────────────────────────────────────
  return (
    <ScrollView
      style={[styles.root, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.logoBox, { backgroundColor: isDark ? "#1e3a8a" : "#dbeafe" }]}>
          <MaterialIcons name="home" size={40} color={theme.primary} />
        </View>
        <Text style={[styles.appName, { color: theme.text }]}>Smart Home</Text>
        <Text style={[styles.appSub,  { color: theme.subtext }]}>Select your account to continue</Text>
      </View>

      {/* Account list */}
      <Text style={[styles.sectionLabel, { color: theme.subtext }]}>ACCOUNTS</Text>

      {accounts.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.emptyIcon, { backgroundColor: isDark ? "#1e3a8a" : "#dbeafe" }]}>
            <MaterialIcons name="person-search" size={38} color={theme.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No accounts yet</Text>
          <Text style={[styles.emptyHint,  { color: theme.subtext }]}>
            Register a new account to get started.
          </Text>
          <TouchableOpacity
            style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate("Register")}
          >
            <MaterialIcons name="person-add-alt-1" size={18} color="#fff" />
            <Text style={styles.emptyBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      ) : (
        accounts.map((acc, i) => {
          const isSelected = selected?.uid === acc.uid;
          const initial    = (acc.email ?? "?").charAt(0).toUpperCase();
          return (
            <TouchableOpacity
              key={acc.uid ?? i}
              style={[
                styles.accountCard,
                { backgroundColor: theme.card, borderColor: isSelected ? theme.primary : theme.border },
                isSelected && styles.accountCardSelected,
              ]}
              onPress={() => selectAccount(acc)}
              activeOpacity={0.8}
            >
              <View style={[
                styles.avatar,
                { backgroundColor: isSelected ? theme.primary : (isDark ? "#334155" : "#e2e8f0") },
              ]}>
                <Text style={[styles.avatarText, { color: isSelected ? "#fff" : theme.text }]}>
                  {initial}
                </Text>
              </View>
              <View style={styles.accInfo}>
                <Text style={[styles.accEmail, { color: theme.text }]} numberOfLines={1}>
                  {acc.email}
                </Text>
                <Text style={[styles.accHint, { color: theme.subtext }]}>
                  {isSelected ? "Enter your passcode below" : "Tap to select"}
                </Text>
              </View>
              <MaterialIcons
                name={isSelected ? "check-circle" : "radio-button-unchecked"}
                size={22}
                color={isSelected ? theme.primary : theme.border}
              />
            </TouchableOpacity>
          );
        })
      )}

      {/* Passcode section */}
      {selected && (
        <View style={[styles.passcodeCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionLabel, { color: theme.subtext }]}>ENTER 4-DIGIT PASSCODE</Text>

          {/* Dots */}
          <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
            {dots.map((filled, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  filled
                    ? { backgroundColor: theme.primary, borderColor: theme.primary }
                    : { backgroundColor: "transparent", borderColor: isDark ? "#475569" : "#cbd5e1" },
                ]}
              />
            ))}
          </Animated.View>

          {/* Error */}
          <View style={styles.errorBox}>
            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
          </View>

          {/* Numpad */}
          <View style={styles.pad}>
            {PAD.map((row, ri) => (
              <View key={ri} style={styles.padRow}>
                {row.map((key, ki) => {
                  if (!key) return <View key={ki} style={styles.padKeyEmpty} />;
                  const isDel = key === "del";
                  return (
                    <TouchableOpacity
                      key={ki}
                      style={[
                        styles.padKey,
                        { backgroundColor: isDel ? "transparent" : (isDark ? "#1e293b" : "#f1f5f9") },
                      ]}
                      onPress={() => isDel ? handleDelete() : handleDigit(key)}
                      activeOpacity={0.6}
                    >
                      {isDel
                        ? <MaterialIcons name="backspace" size={22} color={theme.subtext} />
                        : <Text style={[styles.padKeyText, { color: theme.text }]}>{key}</Text>
                      }
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Bottom links */}
      <View style={styles.links}>
        <TouchableOpacity
          style={[styles.linkRow, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.navigate("Login")}
        >
          <View style={[styles.linkIcon, { backgroundColor: isDark ? "#1e3a8a" : "#eff6ff" }]}>
            <MaterialIcons name="login" size={18} color={theme.primary} />
          </View>
          <Text style={[styles.linkText, { color: theme.text }]}>Use Email & Password Instead</Text>
          <MaterialIcons name="chevron-right" size={20} color={theme.subtext} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.linkRow, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.navigate("Register")}
        >
          <View style={[styles.linkIcon, { backgroundColor: isDark ? "#14532d" : "#dcfce7" }]}>
            <MaterialIcons name="person-add-alt-1" size={18} color="#16a34a" />
          </View>
          <Text style={[styles.linkText, { color: theme.text }]}>Register New Account</Text>
          <MaterialIcons name="chevron-right" size={20} color={theme.subtext} />
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 24 },

  // Header
  header:  { alignItems: "center", marginBottom: 32 },
  logoBox: {
    width: 82, height: 82, borderRadius: 24,
    justifyContent: "center", alignItems: "center", marginBottom: 14,
    elevation: 5, shadowColor: "#2563eb", shadowOpacity: 0.18,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  appName: { fontSize: 28, fontWeight: "800" },
  appSub:  { fontSize: 14, marginTop: 6 },

  sectionLabel: {
    fontSize: 11, fontWeight: "800", letterSpacing: 0.8,
    marginBottom: 10, marginTop: 4,
  },

  // Empty state
  emptyCard: {
    borderRadius: 20, borderWidth: 1, padding: 28,
    alignItems: "center", marginBottom: 12,
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.05,
    shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  emptyIcon:    { width: 70, height: 70, borderRadius: 20, justifyContent: "center", alignItems: "center", marginBottom: 14 },
  emptyTitle:   { fontSize: 17, fontWeight: "700", marginBottom: 8 },
  emptyHint:    { fontSize: 13, textAlign: "center", lineHeight: 20, marginBottom: 20 },
  emptyBtn:     { flexDirection: "row", borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, alignItems: "center", gap: 8 },
  emptyBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  // Account cards
  accountCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 18, borderWidth: 1.5, padding: 14, marginBottom: 10,
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.05,
    shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  accountCardSelected: { elevation: 6, shadowOpacity: 0.12 },
  avatar:     { width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 21, fontWeight: "800" },
  accInfo:    { flex: 1 },
  accEmail:   { fontSize: 15, fontWeight: "600" },
  accHint:    { fontSize: 12, marginTop: 3 },

  // Passcode card
  passcodeCard: {
    borderRadius: 22, borderWidth: 1, padding: 22, marginTop: 16,
    elevation: 3, shadowColor: "#000", shadowOpacity: 0.06,
    shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },

  // Dots
  dotsRow: { flexDirection: "row", gap: 18, justifyContent: "center", marginBottom: 12 },
  dot:     { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },

  // Error
  errorBox:  { height: 28, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  errorText: { color: "#dc2626", fontSize: 13, fontWeight: "600", textAlign: "center" },

  // Numpad
  pad:         { gap: 10 },
  padRow:      { flexDirection: "row", gap: 10 },
  padKey:      { flex: 1, height: 68, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  padKeyEmpty: { flex: 1, height: 68 },
  padKeyText:  { fontSize: 28, fontWeight: "600" },

  // Bottom links
  links:   { marginTop: 24, gap: 10 },
  linkRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderWidth: 1, borderRadius: 16, padding: 14,
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.04,
    shadowRadius: 5, shadowOffset: { width: 0, height: 2 },
  },
  linkIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  linkText: { flex: 1, fontSize: 14, fontWeight: "600" },
});

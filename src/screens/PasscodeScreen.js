import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { signOut } from "firebase/auth";
import { get, ref } from "firebase/database";
import { useEffect, useRef, useState } from "react";
import {
  Alert, Animated, StyleSheet, Text,
  TouchableOpacity, View,
} from "react-native";
import { auth, rtdb } from "../firebase/config";
import { useTheme } from "../context/ThemeContext";

const MAX_ATTEMPTS = 3;
const PIN_LENGTH   = 4; // shown as 4 dots; accepts any length stored

export default function PasscodeScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const user = auth.currentUser;

  const [pin,          setPin]          = useState("");
  const [attempts,     setAttempts]     = useState(0);
  const [storedCode,   setStoredCode]   = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [errorMsg,     setErrorMsg]     = useState("");

  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Fetch stored passcode once on mount
  useEffect(() => {
    if (!user) { navigation.replace("Login"); return; }
    get(ref(rtdb, `users/${user.uid}/passcode`))
      .then((snap) => {
        if (snap.exists()) {
          setStoredCode(String(snap.val()));
        } else {
          // No passcode stored — skip to Home
          navigation.replace("Home");
        }
      })
      .catch(() => navigation.replace("Home"))
      .finally(() => setLoading(false));
  }, []);

  const shake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue:  10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  0,  duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleDigit = (digit) => {
    if (pin.length >= (storedCode?.length ?? PIN_LENGTH)) return;
    const next = pin + digit;
    setPin(next);
    setErrorMsg("");
    if (next.length === (storedCode?.length ?? PIN_LENGTH)) {
      submitPin(next);
    }
  };

  const handleDelete = () => {
    setPin((p) => p.slice(0, -1));
    setErrorMsg("");
  };

  const submitPin = (entered) => {
    if (entered === storedCode) {
      navigation.replace("Home");
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPin("");
      shake();

      if (newAttempts >= MAX_ATTEMPTS) {
        Alert.alert(
          "Too Many Attempts",
          "You have been logged out for security.",
          [{
            text: "OK",
            onPress: async () => {
              await signOut(auth);
              navigation.replace("Login");
            },
          }],
        );
      } else {
        setErrorMsg(`Incorrect passcode. ${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts === 1 ? "" : "s"} remaining.`);
      }
    }
  };

  const handleForgot = () => {
    Alert.alert(
      "Forgot Passcode?",
      "You will be signed out and asked to log in with your email and password.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await signOut(auth);
            navigation.replace("Login");
          },
        },
      ],
    );
  };

  const codeLength = storedCode?.length ?? PIN_LENGTH;
  const dots       = Array.from({ length: codeLength }, (_, i) => i < pin.length);

  const PAD = [
    ["1","2","3"],
    ["4","5","6"],
    ["7","8","9"],
    [null,"0","del"],
  ];

  if (loading) {
    return (
      <View style={[styles.root, { backgroundColor: theme.bg, justifyContent: "center", alignItems: "center" }]}>
        <MaterialIcons name="lock" size={40} color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.subtext }]}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>

      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: isDark ? "#1e3a8a" : "#dbeafe" }]}>
          <MaterialIcons name="lock" size={38} color={theme.primary} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Enter Passcode</Text>
        <Text style={[styles.subtitle, { color: theme.subtext }]}>
          {user?.email ?? "your account"}
        </Text>
      </View>

      {/* PIN dots */}
      <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
        {dots.map((filled, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              filled
                ? { backgroundColor: theme.primary, borderColor: theme.primary }
                : { backgroundColor: "transparent", borderColor: theme.border },
            ]}
          />
        ))}
      </Animated.View>

      {/* Error message */}
      <View style={styles.errorBox}>
        {errorMsg ? (
          <Text style={styles.errorText}>{errorMsg}</Text>
        ) : null}
      </View>

      {/* Number pad */}
      <View style={[styles.pad, { backgroundColor: theme.card, borderColor: theme.border }]}>
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
                  activeOpacity={0.65}
                >
                  {isDel ? (
                    <MaterialIcons name="backspace" size={22} color={theme.subtext} />
                  ) : (
                    <Text style={[styles.padKeyText, { color: theme.text }]}>{key}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* Forgot passcode */}
      <TouchableOpacity style={styles.forgotBtn} onPress={handleForgot}>
        <MaterialIcons name="help-outline" size={16} color={theme.subtext} />
        <Text style={[styles.forgotText, { color: theme.subtext }]}>Forgot Passcode?</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },

  loadingText: { marginTop: 14, fontSize: 16 },

  header:     { alignItems: "center", marginBottom: 36 },
  iconCircle: { width: 84, height: 84, borderRadius: 28, justifyContent: "center", alignItems: "center", marginBottom: 18 },
  title:      { fontSize: 26, fontWeight: "800" },
  subtitle:   { fontSize: 14, marginTop: 6 },

  // Dots
  dotsRow: { flexDirection: "row", gap: 18, marginBottom: 12 },
  dot:     { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },

  // Error
  errorBox:  { height: 28, justifyContent: "center", marginBottom: 20 },
  errorText: { color: "#dc2626", fontSize: 13, fontWeight: "600", textAlign: "center" },

  // Number pad
  pad: {
    width: "100%", maxWidth: 320, borderRadius: 22,
    borderWidth: 1, padding: 12, gap: 10,
    elevation: 3, shadowColor: "#000", shadowOpacity: 0.06,
    shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  padRow:      { flexDirection: "row", gap: 10 },
  padKey:      { flex: 1, height: 68, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  padKeyEmpty: { flex: 1, height: 68 },
  padKeyText:  { fontSize: 26, fontWeight: "600" },

  // Forgot
  forgotBtn:  { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 28 },
  forgotText: { fontSize: 14, fontWeight: "500" },
});

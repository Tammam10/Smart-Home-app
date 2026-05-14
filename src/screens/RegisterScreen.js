import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { doc, setDoc } from "firebase/firestore";
import { useRef, useState } from "react";
import {
  ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from "react-native";
import { auth, db, rtdb } from "../firebase/config";

export default function RegisterScreen({ navigation }) {
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passcode,        setPasscode]        = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [showPassword,    setShowPassword]    = useState(false);
  const [errors,          setErrors]          = useState({});
  const [loading,         setLoading]         = useState(false);

  const passwordRef        = useRef(null);
  const confirmPasswordRef = useRef(null);
  const passcodeRef        = useRef(null);
  const confirmPasscodeRef = useRef(null);

  const validate = () => {
    const e = {};
    if (!email.trim())                             e.email           = "Email is required.";
    if (!password.trim())                          e.password        = "Password is required.";
    else if (password.length < 6)                  e.password        = "Password must be at least 6 characters.";
    if (password && confirmPassword !== password)  e.confirmPassword = "Passwords do not match.";
    if (!passcode)                                 e.passcode        = "Passcode is required.";
    else if (!/^\d+$/.test(passcode))             e.passcode        = "Passcode must be numeric.";
    else if (passcode.length !== 4)               e.passcode        = "Passcode must be exactly 4 digits.";
    if (passcode && confirmPasscode !== passcode)  e.confirmPasscode = "Passcodes do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await set(ref(rtdb, `users/${user.uid}`), {
        email: email.trim(),
        passcode,
      });
      await setDoc(doc(db, "registered_users", user.uid), { email: email.trim() });

      // Save account to AsyncStorage for PasscodeLoginScreen
      try {
        const raw = await AsyncStorage.getItem("@smart_home_accounts");
        const list = raw ? JSON.parse(raw) : [];
        const idx = list.findIndex((a) => a.uid === user.uid);
        const entry = { uid: user.uid, email: email.trim(), passcode };
        if (idx >= 0) list[idx] = entry; else list.push(entry);
        await AsyncStorage.setItem("@smart_home_accounts", JSON.stringify(list));
      } catch { /* silent — account is created, storage failure won't block login */ }

      set(ref(rtdb, "activeUid"), user.uid).catch(() => {});
      navigation.replace("Home");
    } catch (error) {
      const messages = {
        "auth/email-already-in-use": "An account with this email already exists.",
        "auth/invalid-email":        "Please enter a valid email address.",
        "auth/weak-password":        "Password must be at least 6 characters.",
      };
      Alert.alert("Registration Failed", messages[error.code] ?? error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <MaterialIcons name="home" size={42} color="#2563eb" />
          </View>
          <Text style={styles.appName}>Smart Home</Text>
          <Text style={styles.appSub}>Create your account to get started</Text>
        </View>

        {/* ── Form card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create Account</Text>

          {/* ───────────── ACCOUNT ───────────── */}
          <Text style={styles.sectionLabel}>ACCOUNT</Text>

          {/* Email */}
          <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
            <MaterialIcons name="email" size={20} color={errors.email ? "#dc2626" : "#64748b"} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          {/* Password */}
          <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
            <MaterialIcons name="lock-outline" size={20} color={errors.password ? "#dc2626" : "#64748b"} />
            <TextInput
              ref={passwordRef}
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              blurOnSubmit={false}
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
              <MaterialIcons name={showPassword ? "visibility-off" : "visibility"} size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          {/* Confirm Password */}
          <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
            <MaterialIcons name="verified-user" size={20} color={errors.confirmPassword ? "#dc2626" : "#64748b"} />
            <TextInput
              ref={confirmPasswordRef}
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#94a3b8"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passcodeRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>
          {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

          {/* ───────────── PASSCODE ───────────── */}
          <Text style={[styles.sectionLabel, { marginTop: 14 }]}>QUICK LOGIN PASSCODE</Text>
          <Text style={styles.passcodeHint}>
            Set a 4-digit PIN to unlock the app on future launches.
          </Text>

          {/* Passcode */}
          <View style={[styles.inputWrapper, errors.passcode && styles.inputError]}>
            <MaterialIcons name="pin" size={20} color={errors.passcode ? "#dc2626" : "#64748b"} />
            <TextInput
              ref={passcodeRef}
              style={styles.input}
              placeholder="Passcode (4 digits)"
              placeholderTextColor="#94a3b8"
              value={passcode}
              onChangeText={(v) => setPasscode(v.replace(/\D/g, "").slice(0, 4))}
              keyboardType="number-pad"
              returnKeyType="next"
              onSubmitEditing={() => confirmPasscodeRef.current?.focus()}
              blurOnSubmit={false}
              maxLength={4}
            />
          </View>
          {errors.passcode ? <Text style={styles.errorText}>{errors.passcode}</Text> : null}

          {/* Confirm Passcode */}
          <View style={[styles.inputWrapper, errors.confirmPasscode && styles.inputError]}>
            <MaterialIcons name="check-circle-outline" size={20} color={errors.confirmPasscode ? "#dc2626" : "#64748b"} />
            <TextInput
              ref={confirmPasscodeRef}
              style={styles.input}
              placeholder="Confirm Passcode"
              placeholderTextColor="#94a3b8"
              value={confirmPasscode}
              onChangeText={(v) => setConfirmPasscode(v.replace(/\D/g, "").slice(0, 4))}
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              maxLength={4}
            />
          </View>
          {errors.confirmPasscode ? <Text style={styles.errorText}>{errors.confirmPasscode}</Text> : null}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="person-add-alt-1" size={20} color="#fff" />
                <Text style={styles.submitText}>Create Account</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate("PasscodeLogin")}>
            <Text style={styles.loginLinkText}>
              Already have an account?{"  "}
              <Text style={styles.loginLinkBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: "#f0f4ff" },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 24 },

  header:  { alignItems: "center", marginBottom: 28 },
  logoBox: {
    width: 82, height: 82, borderRadius: 24,
    backgroundColor: "#fff", justifyContent: "center", alignItems: "center",
    elevation: 5, marginBottom: 14,
    shadowColor: "#2563eb", shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  appName: { fontSize: 26, fontWeight: "800", color: "#1e293b" },
  appSub:  { fontSize: 14, color: "#64748b", marginTop: 6 },

  card: {
    backgroundColor: "#fff", borderRadius: 24, padding: 22, elevation: 4,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
  },
  cardTitle:    { fontSize: 22, fontWeight: "800", color: "#1e293b", marginBottom: 20, textAlign: "center" },
  sectionLabel: { fontSize: 11, fontWeight: "800", color: "#94a3b8", letterSpacing: 0.8, marginBottom: 10 },
  passcodeHint: { fontSize: 13, color: "#64748b", lineHeight: 18, marginBottom: 12, marginTop: -4 },

  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0",
    borderRadius: 14, paddingHorizontal: 14, minHeight: 54,
    gap: 10, marginBottom: 6,
  },
  inputError: { borderColor: "#dc2626", backgroundColor: "#fff5f5" },
  input:      { flex: 1, fontSize: 15, color: "#1e293b" },
  errorText:  { color: "#dc2626", fontSize: 12, marginBottom: 8, marginLeft: 4 },

  submitBtn:  {
    flexDirection: "row", backgroundColor: "#2563eb", borderRadius: 14,
    minHeight: 54, justifyContent: "center", alignItems: "center", gap: 8, marginTop: 14,
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  divider:    { flex: 1, height: 1, backgroundColor: "#e2e8f0" },
  dividerText:{ marginHorizontal: 12, fontSize: 13, color: "#94a3b8", fontWeight: "600" },
  loginLink:  { alignItems: "center" },
  loginLinkText: { fontSize: 14, color: "#64748b" },
  loginLinkBold: { color: "#2563eb", fontWeight: "700" },
});

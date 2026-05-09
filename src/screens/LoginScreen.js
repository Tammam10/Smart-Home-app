import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { get, ref } from "firebase/database";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, rtdb } from "../firebase/config";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Email is required.");
      isValid = false;
    }
    if (!password.trim()) {
      setPasswordError("Password is required.");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      isValid = false;
    }
    return isValid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);
      // Fetch passcode from RTDB and save account for PasscodeLoginScreen
      try {
        const snap = await get(ref(rtdb, `users/${user.uid}/passcode`));
        const passcode = snap.exists() ? String(snap.val()) : null;
        const raw = await AsyncStorage.getItem("@smart_home_accounts");
        const list = raw ? JSON.parse(raw) : [];
        const idx = list.findIndex((a) => a.uid === user.uid);
        const entry = { uid: user.uid, email: email.trim(), passcode, password };
        if (idx >= 0) list[idx] = entry; else list.push(entry);
        await AsyncStorage.setItem("@smart_home_accounts", JSON.stringify(list));
      } catch { /* silent — don't block login */ }
      navigation.replace("Home");
    } catch (error) {
      const messages = {
        "auth/invalid-credential": "Invalid email or password.",
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/too-many-requests": "Too many attempts. Try again later.",
      };
      Alert.alert("Login Failed", messages[error.code] ?? error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Reset Password", "Enter your email address above first.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert("Reset Email Sent", `A password reset link has been sent to ${email.trim()}.`);
    } catch (error) {
      const messages = {
        "auth/user-not-found": "No account found with this email.",
        "auth/invalid-email": "Please enter a valid email address.",
      };
      Alert.alert("Error", messages[error.code] ?? error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.logoBox}>
          <MaterialIcons name="home" size={42} color="#2f80ed" />
        </View>
        <Text style={styles.title}>SMART-HOME-CONTROL</Text>
        <Text style={styles.subtitle}>Secure access to your smart home system</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Welcome Back</Text>
        <Text style={styles.formSubtitle}>Login to your account</Text>

        <View style={styles.inputWrapper}>
          <MaterialIcons name="person-outline" size={22} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#888"
          />
        </View>
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        <View style={styles.inputWrapper}>
          <MaterialIcons name="lock-outline" size={22} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor="#888"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialIcons
              name={showPassword ? "visibility-off" : "visibility"}
              size={22}
              color="#666"
            />
          </TouchableOpacity>
        </View>
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <MaterialIcons
              name={rememberMe ? "check-box" : "check-box-outline-blank"}
              size={22}
              color="#2f80ed"
            />
            <Text style={styles.rememberText}>Remember Me</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="login" size={20} color="#fff" />
              <Text style={styles.loginButtonText}>Login</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate("Register")}
          disabled={loading}
        >
          <Text style={styles.registerLinkText}>
            Don't have an account?{" "}
            <Text style={styles.registerLinkBold}>Register</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#e6f4ff",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  topSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoBox: {
    width: 82,
    height: 82,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 22,
    elevation: 6,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
    textAlign: "center",
  },
  formSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#dbe2ea",
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 6,
    minHeight: 56,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#111",
  },
  errorText: {
    color: "#d93025",
    fontSize: 13,
    marginBottom: 10,
    marginLeft: 4,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 18,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  rememberText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#374151",
  },
  forgotText: {
    fontSize: 14,
    color: "#2f80ed",
    fontWeight: "600",
  },
  loginButton: {
    flexDirection: "row",
    backgroundColor: "#2f80ed",
    minHeight: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: "#9ca3af",
    fontWeight: "600",
  },
  registerLink: {
    alignItems: "center",
  },
  registerLinkText: {
    fontSize: 14,
    color: "#6b7280",
  },
  registerLinkBold: {
    color: "#2f80ed",
    fontWeight: "bold",
  },
});

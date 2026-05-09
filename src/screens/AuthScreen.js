import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
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
import { auth } from "../firebase/config";

export default function AuthScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateLoginForm = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

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

  const validateRegisterForm = () => {
    let isValid = validateLoginForm();
    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Please confirm your password.");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      isValid = false;
    }
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateLoginForm()) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
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

  const handleRegister = async () => {
    if (!validateRegisterForm()) return;
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      navigation.replace("Home");
    } catch (error) {
      const messages = {
        "auth/email-already-in-use":
          "An account with this email already exists.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/weak-password": "Password must be at least 6 characters.",
      };
      Alert.alert("Registration Failed", messages[error.code] ?? error.message);
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
      Alert.alert(
        "Reset Email Sent",
        `A password reset link has been sent to ${email.trim()}.`,
      );
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
        <Text style={styles.subtitle}>
          Secure access to your smart home system
        </Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Welcome Back</Text>
        <Text style={styles.formSubtitle}>Login or register to continue</Text>

        <View style={styles.inputWrapper}>
          <MaterialIcons name="person-outline" size={22} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="Email or Username"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
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
        {passwordError ? (
          <Text style={styles.errorText}>{passwordError}</Text>
        ) : null}

        <View style={styles.inputWrapper}>
          <MaterialIcons name="verified-user" size={22} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            placeholderTextColor="#888"
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <MaterialIcons
              name={showConfirmPassword ? "visibility-off" : "visibility"}
              size={22}
              color="#666"
            />
          </TouchableOpacity>
        </View>
        {confirmPasswordError ? (
          <Text style={styles.errorText}>{confirmPasswordError}</Text>
        ) : null}

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

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#2f80ed" />
          ) : (
            <>
              <MaterialIcons
                name="person-add-alt-1"
                size={20}
                color="#2f80ed"
              />
              <Text style={styles.registerButtonText}>Register</Text>
            </>
          )}
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
    marginTop: 8,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  registerButton: {
    flexDirection: "row",
    backgroundColor: "#eef5ff",
    minHeight: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#cfe0ff",
  },
  registerButtonText: {
    color: "#2f80ed",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

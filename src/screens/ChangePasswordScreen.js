import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../firebase/config";
import { useTheme } from "../context/ThemeContext";

export default function ChangePasswordScreen({ navigation }) {
  const { theme, isDark } = useTheme();

  const [currentPassword, setCurrentPassword]     = useState("");
  const [newPassword, setNewPassword]             = useState("");
  const [confirmPassword, setConfirmPassword]     = useState("");
  const [showCurrent, setShowCurrent]             = useState(false);
  const [showNew, setShowNew]                     = useState(false);
  const [showConfirm, setShowConfirm]             = useState(false);
  const [loading, setLoading]                     = useState(false);

  const scrollRef      = useRef(null);
  const newPassRef     = useRef(null);
  const confirmPassRef = useRef(null);

  const handleChangePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("Missing Information", "Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Weak Password", "New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Password Mismatch", "New password and confirm password do not match.");
      return;
    }

    const user = auth.currentUser;
    if (!user?.email) {
      Alert.alert("Error", "No authenticated user found.");
      return;
    }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      Alert.alert("Success", "Password changed successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (error) {
      const messages = {
        "auth/wrong-password":    "Current password is incorrect.",
        "auth/invalid-credential":"Current password is incorrect.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/weak-password":     "New password is too weak.",
      };
      Alert.alert("Error", messages[error.code] ?? error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {/* ── TOP BAR ────────────────────────────────────────────────── */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={22} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: theme.text }]}>Change Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── HEADER CARD ────────────────────────────────────────────── */}
        <View style={[styles.headerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.iconCircle, { backgroundColor: theme.primarySoft }]}>
            <MaterialIcons name="lock-reset" size={48} color={theme.primary} />
          </View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Update Your Password</Text>
          <Text style={[styles.headerSub, { color: theme.subtext }]}>
            Enter your current password and choose a new secure password.
          </Text>
        </View>

        {/* ── FORM CARD ──────────────────────────────────────────────── */}
        <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>

          {/* Current password */}
          <Text style={[styles.label, { color: theme.text }]}>Current Password</Text>
          <View style={[styles.inputRow, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <MaterialIcons name="lock-outline" size={20} color={theme.subtext} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Enter current password"
              placeholderTextColor={theme.subtext}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrent}
              returnKeyType="next"
              onSubmitEditing={() => newPassRef.current?.focus()}
              blurOnSubmit={false}
            />
            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
              <MaterialIcons name={showCurrent ? "visibility-off" : "visibility"} size={20} color={theme.subtext} />
            </TouchableOpacity>
          </View>

          {/* New password */}
          <Text style={[styles.label, { color: theme.text }]}>New Password</Text>
          <View style={[styles.inputRow, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <MaterialIcons name="vpn-key" size={20} color={theme.subtext} />
            <TextInput
              ref={newPassRef}
              style={[styles.input, { color: theme.text }]}
              placeholder="Enter new password"
              placeholderTextColor={theme.subtext}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNew}
              returnKeyType="next"
              onSubmitEditing={() => {
                confirmPassRef.current?.focus();
                setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
              }}
              blurOnSubmit={false}
            />
            <TouchableOpacity onPress={() => setShowNew(!showNew)}>
              <MaterialIcons name={showNew ? "visibility-off" : "visibility"} size={20} color={theme.subtext} />
            </TouchableOpacity>
          </View>

          {/* Confirm new password */}
          <Text style={[styles.label, { color: theme.text }]}>Confirm New Password</Text>
          <View style={[styles.inputRow, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <MaterialIcons name="verified-user" size={20} color={theme.subtext} />
            <TextInput
              ref={confirmPassRef}
              style={[styles.input, { color: theme.text }]}
              placeholder="Confirm new password"
              placeholderTextColor={theme.subtext}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              returnKeyType="done"
              onSubmitEditing={handleChangePassword}
              onFocus={() =>
                setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150)
              }
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              <MaterialIcons name={showConfirm ? "visibility-off" : "visibility"} size={20} color={theme.subtext} />
            </TouchableOpacity>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: theme.primary }, loading && { opacity: 0.7 }]}
            onPress={handleChangePassword}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="check-circle" size={20} color="#fff" />
                <Text style={styles.submitText}>Update Password</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, paddingTop: 52 },
  scroll: { padding: 16, paddingBottom: 32 },

  // Top bar
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: "center", alignItems: "center", borderWidth: 1, elevation: 2,
  },
  topBarTitle: { fontSize: 18, fontWeight: "700" },

  // Header card
  headerCard: {
    borderRadius: 22, padding: 24, alignItems: "center",
    marginBottom: 16, elevation: 3, borderWidth: 1,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  iconCircle: {
    width: 84, height: 84, borderRadius: 42,
    justifyContent: "center", alignItems: "center", marginBottom: 14,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", textAlign: "center" },
  headerSub:   { fontSize: 13, textAlign: "center", marginTop: 6, lineHeight: 20 },

  // Form card
  formCard: {
    borderRadius: 22, padding: 20, elevation: 3, borderWidth: 1,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  label:    { fontSize: 14, fontWeight: "600", marginBottom: 8, marginTop: 4 },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderRadius: 14, paddingHorizontal: 14,
    minHeight: 54, marginBottom: 16, gap: 10,
  },
  input: { flex: 1, fontSize: 15 },

  // Submit
  submitBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    minHeight: 54, borderRadius: 14, marginTop: 6, gap: 8,
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

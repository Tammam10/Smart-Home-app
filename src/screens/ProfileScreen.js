import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { signOut } from "firebase/auth"; // kept for real sign-out on account switch
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { auth } from "../firebase/config";
import { useSettings } from "../context/SettingsContext";
import { useTheme } from "../context/ThemeContext";

export default function ProfileScreen({ navigation }) {
  const user = auth.currentUser;
  const rawName = user?.displayName ?? user?.email?.split("@")[0] ?? "User";
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const { theme, isDark, toggleTheme } = useTheme();
  const { tempUnit, setTempUnit } = useSettings();

  const handleLogout = () => {
    Alert.alert(
      "Lock Screen",
      "Return to the passcode screen?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Lock",
          style: "destructive",
          onPress: () => navigation.replace("PasscodeLogin"),
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>

      {/* ── TOP BAR ──────────────────────────────────────────────────── */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={22} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: theme.text }]}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── AVATAR CARD ────────────────────────────────────────────── */}
        <View style={[styles.avatarCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.avatarCircle, { backgroundColor: theme.primarySoft }]}>
            <MaterialIcons name="person" size={52} color={theme.primary} />
          </View>
          <Text style={[styles.userName, { color: theme.text }]}>
            {displayName}
          </Text>
          <Text style={[styles.userEmail, { color: theme.subtext }]}>
            {user?.email ?? ""}
          </Text>
          <View style={[styles.rolePill, { backgroundColor: theme.statDevice.bg }]}>
            <MaterialIcons name="shield" size={12} color={theme.statDevice.text} />
            <Text style={[styles.roleText, { color: theme.statDevice.text }]}>Home Owner</Text>
          </View>
        </View>

        {/* ── APPEARANCE ─────────────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionLabel, { color: theme.subtext }]}>APPEARANCE</Text>

          {/* Dark mode */}
          <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: isDark ? "#1e3a8a" : "#eff6ff" }]}>
                <MaterialIcons name={isDark ? "dark-mode" : "light-mode"} size={20} color={isDark ? "#93c5fd" : "#2563eb"} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Dark Mode</Text>
                <Text style={[styles.settingSubtitle, { color: theme.subtext }]}>{isDark ? "Currently dark" : "Currently light"}</Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              thumbColor={theme.primary}
              trackColor={{ false: theme.border, true: theme.primary + "60" }}
            />
          </View>

          {/* Temperature unit */}
          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: isDark ? "#431407" : "#fff7ed" }]}>
                <MaterialIcons name="thermostat" size={20} color="#ea580c" />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Temperature Unit</Text>
                <Text style={[styles.settingSubtitle, { color: theme.subtext }]}>Shown on dashboard</Text>
              </View>
            </View>
            <View style={[styles.unitToggle, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
              <TouchableOpacity
                style={[styles.unitBtn, tempUnit === "C" && { backgroundColor: theme.primary }]}
                onPress={() => setTempUnit("C")}
              >
                <Text style={[styles.unitBtnText, { color: tempUnit === "C" ? "#fff" : theme.subtext }]}>°C</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.unitBtn, tempUnit === "F" && { backgroundColor: theme.primary }]}
                onPress={() => setTempUnit("F")}
              >
                <Text style={[styles.unitBtnText, { color: tempUnit === "F" ? "#fff" : theme.subtext }]}>°F</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── ACCOUNT ────────────────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionLabel, { color: theme.subtext }]}>ACCOUNT</Text>

          <TouchableOpacity
            style={[styles.settingRow, { borderBottomColor: theme.border }]}
            onPress={() => navigation.navigate("ChangePassword")}
            activeOpacity={0.75}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: isDark ? "#1e3a8a" : "#eff6ff" }]}>
                <MaterialIcons name="lock" size={20} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Change Password</Text>
                <Text style={[styles.settingSubtitle, { color: theme.subtext }]}>Update your credentials</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={theme.subtext} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingRow, { borderBottomWidth: 0 }]}
            onPress={handleLogout}
            activeOpacity={0.75}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: isDark ? "#450a0a" : "#fee2e2" }]}>
                <MaterialIcons name="lock" size={20} color="#dc2626" />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: "#dc2626" }]}>Lock Screen</Text>
                <Text style={[styles.settingSubtitle, { color: theme.subtext }]}>Return to passcode screen</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={theme.subtext} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 52 },
  scroll:    { paddingBottom: 24 },

  // Top bar
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
    borderWidth: 1, elevation: 2,
  },
  topBarTitle: { fontSize: 18, fontWeight: "700" },

  // Avatar card
  avatarCard: {
    margin: 16, borderRadius: 22, padding: 24,
    alignItems: "center", elevation: 3, borderWidth: 1,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44,
    justifyContent: "center", alignItems: "center", marginBottom: 14,
  },
  userName:  { fontSize: 22, fontWeight: "800" },
  userEmail: { fontSize: 14, marginTop: 4 },
  rolePill:  { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 12, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  roleText:  { fontSize: 12, fontWeight: "700" },

  // Sections
  section: {
    marginHorizontal: 16, marginTop: 12, borderRadius: 18,
    borderWidth: 1, overflow: "hidden", elevation: 2,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionLabel: {
    fontSize: 11, fontWeight: "800", letterSpacing: 0.8,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6,
  },
  settingRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  settingLeft:    { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  settingIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  settingTitle:   { fontSize: 15, fontWeight: "600" },
  settingSubtitle:{ fontSize: 12, marginTop: 2 },

  // Temperature unit toggle
  unitToggle: { flexDirection: "row", borderRadius: 10, borderWidth: 1, overflow: "hidden" },
  unitBtn:    { paddingHorizontal: 14, paddingVertical: 7 },
  unitBtnText:{ fontSize: 14, fontWeight: "700" },
});

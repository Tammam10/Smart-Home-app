import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { signOut } from "firebase/auth";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth } from "../firebase/config";

export default function ProfileScreen({ navigation }) {
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace("Login");
    } catch (error) {
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#2f80ed" />
        </TouchableOpacity>

        <Text style={styles.title}>Profile</Text>

        <View style={styles.topSpacer} />
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <MaterialIcons name="person" size={54} color="#2f80ed" />
        </View>

        <Text style={styles.username}>{user?.displayName ?? "User"}</Text>
        <Text style={styles.email}>{user?.email ?? ""}</Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate("ChangePassword")}
        >
          <MaterialIcons name="lock" size={22} color="#fff" />
          <Text style={styles.actionText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.logoutBtn]}
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={22} color="#fff" />
          <Text style={styles.actionText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6f4ff",
    padding: 16,
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },

  topSpacer: {
    width: 42,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },

  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
    elevation: 5,
    marginBottom: 20,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#eef5ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  username: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 4,
  },

  email: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 6,
  },

  actionsContainer: {
    gap: 14,
  },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2f80ed",
    padding: 16,
    borderRadius: 14,
  },

  logoutBtn: {
    backgroundColor: "#ef4444",
  },

  actionText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 15,
  },
});

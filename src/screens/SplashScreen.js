import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import { auth } from "../firebase/config";

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const timer = setTimeout(() => {
        navigation.replace(user ? "Home" : "Login");
      }, 3000);
      return () => clearTimeout(timer);
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/splash.png")}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2f80ed",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});

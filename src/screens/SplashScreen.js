import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { auth } from "../firebase/config";

export default function SplashScreen({ navigation }) {
  // ── Animated values ────────────────────────────────────────────────────────
  const screenOpacity  = useRef(new Animated.Value(1)).current;
  const logoScale      = useRef(new Animated.Value(0.25)).current;
  const logoOpacity    = useRef(new Animated.Value(0)).current;
  const titleOpacity   = useRef(new Animated.Value(0)).current;
  const titleY         = useRef(new Animated.Value(24)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const dot1Opacity    = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity    = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity    = useRef(new Animated.Value(0.3)).current;

  // ── Entry animations ───────────────────────────────────────────────────────
  useEffect(() => {
    // Logo pops in
    Animated.parallel([
      Animated.spring(logoScale,   { toValue: 1, tension: 55, friction: 7, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 550, useNativeDriver: true }),
    ]).start();

    // Title slides up and fades in
    const titleTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 480, useNativeDriver: true }),
        Animated.timing(titleY,       { toValue: 0, duration: 480, useNativeDriver: true }),
      ]).start();
    }, 350);

    // Tagline fades in after title
    const taglineTimer = setTimeout(() => {
      Animated.timing(taglineOpacity, { toValue: 1, duration: 450, useNativeDriver: true }).start();
    }, 650);

    // Sequentially pulsing loading dots
    const dotsAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(dot1Opacity, { toValue: 1,   duration: 280, useNativeDriver: true }),
        Animated.timing(dot2Opacity, { toValue: 1,   duration: 280, useNativeDriver: true }),
        Animated.timing(dot3Opacity, { toValue: 1,   duration: 280, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(dot1Opacity, { toValue: 0.3, duration: 280, useNativeDriver: true }),
          Animated.timing(dot2Opacity, { toValue: 0.3, duration: 280, useNativeDriver: true }),
          Animated.timing(dot3Opacity, { toValue: 0.3, duration: 280, useNativeDriver: true }),
        ]),
      ]),
    );
    dotsAnim.start();

    return () => {
      clearTimeout(titleTimer);
      clearTimeout(taglineTimer);
      dotsAnim.stop();
    };
  }, []);

  // ── Auth check + fade-out transition ──────────────────────────────────────
  useEffect(() => {
    let authResolved  = false;
    let minTimeReady  = false;
    let targetRoute   = null;
    let didNavigate   = false;

    const tryNavigate = () => {
      if (authResolved && minTimeReady && !didNavigate) {
        didNavigate = true;
        // Fade the whole screen to black before switching
        Animated.timing(screenOpacity, {
          toValue:  0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => navigation.replace(targetRoute));
      }
    };

    const unsubscribe = onAuthStateChanged(auth, () => {
      targetRoute  = "PasscodeLogin";
      authResolved = true;
      tryNavigate();
    });

    // Minimum display time so the splash doesn't flash past instantly
    const minTimer = setTimeout(() => {
      minTimeReady = true;
      tryNavigate();
    }, 2600);

    return () => {
      unsubscribe();
      clearTimeout(minTimer);
    };
  }, [navigation]);

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>

      {/* Background decoration circles */}
      <View style={styles.bgCircleTop} />
      <View style={styles.bgCircleBottom} />

      {/* Logo */}
      <Animated.View style={[
        styles.logoWrapper,
        { transform: [{ scale: logoScale }], opacity: logoOpacity },
      ]}>
        <View style={styles.logoOuterRing}>
          <View style={styles.logoInner}>
            <MaterialIcons name="home" size={52} color="#2563eb" />
          </View>
        </View>
      </Animated.View>

      {/* App name */}
      <Animated.Text style={[
        styles.appName,
        { opacity: titleOpacity, transform: [{ translateY: titleY }] },
      ]}>
        Smart Home
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Your home, in your hands
      </Animated.Text>

      {/* Loading dots */}
      <View style={styles.dotsRow}>
        <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
        <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
        <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
      </View>

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },

  // Decorative blurred circles (static, depth effect)
  bgCircleTop: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: "rgba(37,99,235,0.11)",
    top: -100,
    right: -100,
  },
  bgCircleBottom: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(37,99,235,0.07)",
    bottom: -70,
    left: -70,
  },

  // Logo
  logoWrapper: {
    marginBottom: 30,
  },
  logoOuterRing: {
    width: 124,
    height: 124,
    borderRadius: 38,
    backgroundColor: "rgba(37,99,235,0.14)",
    borderWidth: 1.5,
    borderColor: "rgba(37,99,235,0.28)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoInner: {
    width: 92,
    height: 92,
    borderRadius: 28,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
  },

  // Text
  appName: {
    fontSize: 38,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.4,
  },
  tagline: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 8,
    letterSpacing: 0.3,
  },

  // Loading dots
  dotsRow: {
    flexDirection: "row",
    marginTop: 52,
    gap: 9,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#2563eb",
  },
});

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useRouter } from "expo-router";

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>

        <View style={styles.logoContainer}>
          <Text style={styles.logo}>CODE</Text>
          <Text style={styles.logoPurple}>QUEST</Text>
        </View>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            CODEQUEST
          </Text>
        </View>

        <Text style={styles.title}>
          Learn. Code. Quest.
        </Text>

        <Text style={styles.subtitle}>
          Learn programming through lessons,
          challenges, and quests.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.primaryButtonText}>
            Get Started
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.secondaryButtonText}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#12051F",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  content: {
    width: "100%",
    alignItems: "center",
  },

  logoContainer: {
    flexDirection: "row",
    marginBottom: 40,
  },

  logo: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 2,
  },

  logoPurple: {
    fontSize: 20,
    fontWeight: "800",
    color: "#B82CFF",
    letterSpacing: 2,
  },

  placeholder: {
    width: 180,
    height: 180,
    borderRadius: 20,
    backgroundColor: "#4B0082",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 35,
  },

  placeholderText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 18,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
  },

  subtitle: {
    color: "#C7B5D4",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 12,
    marginBottom: 35,
  },

  primaryButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#B82CFF",
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  secondaryButton: {
    marginTop: 18,
    padding: 10,
  },

  secondaryButtonText: {
    color: "#C7B5D4",
    fontSize: 14,
  },
});
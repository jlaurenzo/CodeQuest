import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { auth, db } from "../firebase";

export default function Home() {
  const router = useRouter();

  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        router.replace("/login");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const data = userDoc.data();

        setUserName(data.name || "User");
        setLanguage(data.programmingLanguage || "Not selected");
      }
    } catch (error) {
      console.log("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const handleLogout = async () => {
    try {
      await signOut(auth);

      // Send user back to login screen
      router.replace("/login");
    } catch (error) {
      console.log("Logout error:", error);

      Alert.alert(
        "Logout Failed",
        "Something went wrong while logging out. Please try again."
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B1DFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back!</Text>

          <Text style={styles.nameText}>
            {userName}
          </Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>

        {/* Hero / Progress Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>
            Keep Learning!
          </Text>

          <Text style={styles.heroSubtitle}>
            Continue your coding journey and improve your skills.
          </Text>

          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>
              Your Progress
            </Text>

            <View style={styles.progressBarBackground}>
              <View style={styles.progressBar} />
            </View>

            <Text style={styles.progressText}>
              0% Complete
            </Text>
          </View>
        </View>

        {/* Language Card */}
        <View style={styles.languageCard}>
          <Text style={styles.cardTitle}>
            Current Language
          </Text>

          <Text style={styles.languageText}>
            {language}
          </Text>
        </View>

        {/* Placeholder Section */}
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>
            Learning
          </Text>

          <Text style={styles.placeholderText}>
            Lessons and challenges will appear here.
          </Text>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>

        {/* Home */}
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.placeholderIcon}>
            <Text style={styles.iconText}>?</Text>
          </View>

          <Text style={styles.navText}>
            Home
          </Text>
        </TouchableOpacity>

        {/* Learn */}
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.placeholderIcon}>
            <Text style={styles.iconText}>?</Text>
          </View>

          <Text style={styles.navText}>
            Learn
          </Text>
        </TouchableOpacity>

        {/* Challenges */}
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.placeholderIcon}>
            <Text style={styles.iconText}>?</Text>
          </View>

          <Text style={styles.navText}>
            Challenges
          </Text>
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.placeholderIcon}>
            <Text style={styles.iconText}>?</Text>
          </View>

          <Text style={styles.navText}>
            Profile
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
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#12051F",
  },

  loadingText: {
    color: "#FFFFFF",
    marginTop: 10,
    fontSize: 16,
  },

  // HEADER
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  welcomeText: {
    color: "#E9C7FF",
    fontSize: 16,
  },

  nameText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 4,
  },

  // LOGOUT
  logoutButton: {
    backgroundColor: "#8B1DFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },

  logoutText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  // CONTENT
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  heroCard: {
    backgroundColor: "#4B0082",
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },

  heroSubtitle: {
    color: "#E9C7FF",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },

  progressContainer: {
    marginTop: 25,
  },

  progressLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },

  progressBarBackground: {
    height: 10,
    backgroundColor: "#2B1540",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressBar: {
    width: "0%",
    height: "100%",
    backgroundColor: "#35B8E8",
    borderRadius: 10,
  },

  progressText: {
    color: "#E9C7FF",
    fontSize: 12,
    marginTop: 6,
  },

  // LANGUAGE
  languageCard: {
    backgroundColor: "#1E0B2F",
    borderWidth: 1,
    borderColor: "#4B0082",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },

  cardTitle: {
    color: "#E9C7FF",
    fontSize: 14,
  },

  languageText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 5,
  },

  // PLACEHOLDER
  placeholderCard: {
    backgroundColor: "#1E0B2F",
    borderWidth: 1,
    borderColor: "#4B0082",
    borderRadius: 16,
    padding: 20,
  },

  placeholderTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },

  placeholderText: {
    color: "#777777",
    fontSize: 14,
    marginTop: 8,
  },

  // BOTTOM NAVIGATION
  bottomNav: {
    height: 80,
    backgroundColor: "#1E0B2F",
    borderTopWidth: 1,
    borderTopColor: "#4B0082",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 5,
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  placeholderIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#8B1DFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },

  iconText: {
    color: "#8B1DFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  navText: {
    color: "#E9C7FF",
    fontSize: 11,
  },
});
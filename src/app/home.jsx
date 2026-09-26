import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, db } from "../services/firebase";
import { loadUserProgress } from "../services/userProgressService";
import learningContent from "../data/learningContent.json";
import { getOverallUnitProgress } from "../services/learningProgress";
import { loadUserAttempt, loadWeeklyBoss } from "../services/weeklyBossService";
import BottomNav from "../components/BottomNav";
import FireActive from "../../assets/icons/fire-active.svg";
import HeartIcon from "../../assets/icons/heart.svg";
import startYellow from "../../assets/icons/start-yellow.png";
import profileIcon from "../../assets/images/profile-placeholder.png";
import bossImage from "../../assets/images/bosses/boss-image.png";

function getNextMonday() {
  const nextMonday = new Date();
  nextMonday.setHours(0, 0, 0, 0);
  const daysUntilMonday = (8 - nextMonday.getDay()) % 7 || 7;
  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
  return nextMonday;
}

function formatDuration(totalSeconds) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  return `${days}d, ${String(hours).padStart(2, "0")}h`;
}

export default function Home() {
  const router = useRouter();

  const [userName, setUserName] = useState("");
  const [username, setUsername] = useState("");
  const [language, setLanguage] = useState("");
  const [hearts, setHearts] = useState(5);
  const [xp, setXp] = useState(0);
  const [heartRefillSeconds, setHeartRefillSeconds] = useState(0);
  const [learningProgress, setLearningProgress] = useState({ completedUnits: 0, totalUnits: 0 });
  const [weeklyAttemptStatus, setWeeklyAttemptStatus] = useState(null);
  const [weeklySeconds, setWeeklySeconds] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    loadHearts();
    loadWeeklyStatus();
  }, []);

  useEffect(() => {
    if (!weeklySeconds) return undefined;

    const timer = setInterval(() => {
      setWeeklySeconds((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [weeklySeconds]);

  const loadWeeklyStatus = async () => {
    try {
      const weeklyData = await loadWeeklyBoss();
      const attempt = await loadUserAttempt(weeklyData.weekId);
      setWeeklyAttemptStatus(attempt?.status || "not_started");

      const nextMonday = getNextMonday();
      setWeeklySeconds(
        Math.max(0, Math.ceil((nextMonday.getTime() - Date.now()) / 1000)),
      );
    } catch (error) {
      console.log("Error loading weekly challenge status:", error);
    }
  };

  useEffect(() => {
    if (!heartRefillSeconds) return undefined;

    const timer = setInterval(() => {
      setHeartRefillSeconds((seconds) => {
        const nextSeconds = Math.max(seconds - 1, 0);
        if (nextSeconds === 0) {
          loadHearts();
        }
        return nextSeconds;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [heartRefillSeconds]);

  const loadHearts = async () => {
    try {
      const savedProgressStr = await AsyncStorage.getItem("level1Progress");
      if (savedProgressStr) {
        const progress = JSON.parse(savedProgressStr);
        if (typeof progress.hearts === "number") {
          setHearts(progress.hearts);
        }
      }

      const progress = await loadUserProgress();
      setHearts(progress.hearts);
      setXp(progress.xp);
      if (progress.heartRefillAt) {
        setHeartRefillSeconds(
          Math.max(0, Math.ceil((progress.heartRefillAt - Date.now()) / 1000)),
        );
      }
    } catch (error) {
      console.log("Error loading hearts:", error);
    }
  };

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
        setUsername(
          data.username ||
            data.email?.split("@")[0] ||
            "username",
        );
        setLanguage(data.programmingLanguage || "Not selected");
        const progressLanguage = data.programmingLanguage || "JavaScript";
        const languageContent = learningContent[progressLanguage] || learningContent.JavaScript;
        setLearningProgress(
          await getOverallUnitProgress(progressLanguage, languageContent.units),
        );
      }
    } catch (error) {
      console.log("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const weeklySubtitle =
    weeklyAttemptStatus === "completed" || weeklyAttemptStatus === "failed"
      ? `Next challenge in ${formatDuration(weeklySeconds)}`
      : `Ends in ${formatDuration(weeklySeconds)}`;


  const handleLogout = async () => { //Hindi na ginagamit
    try {
      await signOut(auth);

      router.replace("/login");
    } catch (error) {
      console.log("Logout error:", error);

      Alert.alert(
        "Logout Failed",
        "Something went wrong while logging out. Please try again.",
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <View style={styles.profileSummary}>
            <View style={styles.avatarPlaceholder}>
              <Image source={profileIcon} style={styles.avatarIcon} />
            </View>

            <View style={styles.profileText}>
              <Text style={styles.nameText}>{userName || "Name Here"}</Text>
              <Text style={styles.usernameText}>@{username}</Text>
            </View>
          </View>

          <View style={styles.streakContainer}>
            <FireActive width={32} height={38} />
            <Text style={styles.streakText}>7</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.xpHeaderRow}>
              <Image source={startYellow} style={styles.xpSvgIcon} />
              <Text style={styles.statLabel}>XP</Text>
            </View>
            <Text style={styles.xpValue}>{xp}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Hearts</Text>
            <View style={styles.heartsRow}>
              <HeartIcon width={20} height={18} />
              <Text style={styles.statValue}>{hearts}</Text>
              {heartRefillSeconds > 0 && (
                <Text style={styles.heartTimer}>
                  + {Math.floor(heartRefillSeconds / 60)}:
                  {String(heartRefillSeconds % 60).padStart(2, "0")}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>League</Text>
            <Text style={styles.statValue}>Silver II</Text>
          </View>
        </View>

        <View style={styles.content}>

          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>Keep Learning!</Text>

            <Text style={styles.heroSubtitle}>
              Continue your coding journey and improve your skills.
            </Text>

            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Your Progress</Text>

              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: learningProgress.totalUnits
                        ? `${(learningProgress.completedUnits / learningProgress.totalUnits) * 100}%`
                        : "0%",
                    },
                  ]}
                />
              </View>

              <Text style={styles.progressText}>
                {learningProgress.completedUnits} of {learningProgress.totalUnits} units complete
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.weeklyCard} onPress={() => router.push("/weeklybossHome")}>
            <View style={styles.weeklyCardCopy}>
              <Text style={styles.weeklyEyebrow}>WEEKLY CHALLENGE</Text>
              <Text style={styles.weeklyTitle}>Defeat the Bug King</Text>
              <Text style={styles.weeklySubtitle}>{weeklySubtitle}</Text>
              <Text style={styles.fightBoss}>Fight Now!</Text>
            </View>
            <Image source={bossImage} style={styles.bossImage} />
          </TouchableOpacity>

          <View style={styles.primaryButtonBase}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
              onPress={() => router.push("/phase-map")}
            >
              <Text style={styles.primaryButtonText}>START LEARNING</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#8A8194",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 50,
    paddingBottom: 12,
  },
  profileSummary: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarPlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#A72BFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarIcon: {
    width: 50,
    height: 50,
    tintColor: "#000000",
    resizeMode: "contain",
  },
  profileText: {
    marginLeft: 16,
    flexShrink: 1,
  },
  usernameText: {
    fontFamily: "Nunito_600SemiBold",
    fontWeight: "600",
    fontSize: 12,
    color: "#737373",
  },
  nameText: {
    fontFamily: "Nunito_900Black",
    fontSize: 22,
    fontWeight: "900",
    color: "#1F1130",
    maxWidth: 190,
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  fireIcon: {
    fontSize: 30,
    marginRight: 6,
  },
  streakText: {
    fontFamily: "Nunito_900Black",
    color: "#1F1130",
    fontSize: 27,
    fontWeight: "900",
    marginLeft: 7,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 8,
  },
  statCard: {
    width: "31.5%",
    minHeight: 85,
    borderWidth: 2,
    borderColor: "#E7E7E7",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    marginBottom: 20,
  },
  statLabel: {
    color: "#737373",
    fontFamily: "Nunito_500Medium",
    fontSize: 16,
    lineHeight: 28,
    textAlign: "center",
  },
  xpHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  xpSvgIcon: {
    width: 16,
    height: 16,
    resizeMode: "contain",
    marginRight: 4,
  },
  xpValue: {
    color: "#29B956",
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    lineHeight: 32,
    marginTop: 3,
  },
  heartsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
  },
  heartTimer: {
    color: "#29B956",
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
  },
  statValue: {
    color: "#111111",
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    lineHeight: 28,
    marginTop: 3,
    textAlign: "center",
  },
  logoutButton: {
    alignSelf: "flex-end",
    marginRight: 24,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F3E8FF",
  },
  logoutText: {
    color: "#9333EA",
    fontWeight: "600",
    fontSize: 13,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  heroCard: {
    backgroundColor: "#9333EA",
    borderColor: "#D894FF",
    borderWidth: 3,
    borderRadius: 20,
    padding: 22,
    marginBottom: 18,
  },
  heroTitle: {
    fontFamily: "Nunito_800ExtraBold",
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  heroSubtitle: {
    fontFamily: "Nunito_400Regular",
    fontWeight: 400,
    color: "#FFFFFF",
    fontSize: 15,
    marginTop: 6,
    lineHeight: 18,
  },
  progressContainer: {
    marginTop: 18,
  },
  progressLabel: {
    fontFamily: "Nunito_400Regular",
    fontWeight: 400,
    color: "#FFFFFF",
    fontSize: 15,
    marginBottom: 6,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  progressText: {
    fontFamily: "Nunito_400Regular",
    fontWeight: 400,
    color: "#FFFFFF",
    fontSize: 15,
    marginTop: 6,
  },
  languageCard: {
    backgroundColor: "#F9F5FF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },
  cardTitle: {
    fontSize: 13,
    color: "#8A8194",
    marginBottom: 4,
  },
  languageText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F1130",
    textTransform: "capitalize",
  },
  placeholderCard: {
    backgroundColor: "#F9F5FF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    marginBottom: 20,
    borderColor: "#E9D5FF",
  },
  placeholderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F1130",
    marginBottom: 4,
  },
  placeholderText: {
    fontSize: 13,
    color: "#8A8194",
    lineHeight: 18,
  },
  weeklyCard: { 
    backgroundColor: "#FFFA54", 
    borderRadius: 16, 
    padding: 18, 
    marginBottom: 18, 
    borderWidth: 2, 
    borderColor: "#D1A30F", 
    flexDirection: "row", 
    alignItems: "center" 
  },
  weeklyCardCopy: { 
    flex: 1 
  }, 
  weeklyEyebrow: { 
    fontFamily: "Nunito_800ExtraBold",
    color: "#000000", 
    fontSize: 19, 
    fontWeight: "900" 
  }, 
  fightBoss: { 
    fontFamily: "Nunito_800ExtraBold",
    color: "#000000", 
    fontSize: 20, 
    fontWeight: "900", 
    marginTop: 12
  }, 
  weeklyTitle: { 
    fontFamily: "Nunito_500Medium",
    color: "#000000", 
    fontSize: 14, 
    fontWeight: "500", 
    marginTop: 5 
  }, 
  weeklySubtitle: { 
    fontFamily: "Nunito_500Medium",
    color: "#000000", 
    fontSize: 14, 
    fontWeight: "500", 
    marginTop: 4 
  }, 
  bossImage: {
    width: 110,
    height: 110,
    resizeMode: "contain",
    marginLeft: 8,
  },
  primaryButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#B42CFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateY: -7 }],
  },
  primaryButtonBase: {
    width: "100%",
    height: 61,
    backgroundColor: "#7200B8",
    borderRadius: 12,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  primaryButtonPressed: {
    backgroundColor: "#9D20E8",
    transform: [{ translateY: 0 }],
  },
  primaryButtonText: {
    fontFamily: "Nunito_900Black",
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },
});

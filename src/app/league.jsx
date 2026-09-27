import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import BronzeActive from "../../assets/icons/bronze-active.png";
import BronzeGray from "../../assets/icons/bronze-gray.png";
import StreakIcon from "../../assets/icons/streak-1.png";
import BottomNav from "../components/BottomNav";
import { auth, db } from "../services/firebase";
import { loadUserProgress } from "../services/userProgressService";

const LEAGUES = [
  { name: "Bronze", color: "#B87333", active: BronzeActive, locked: BronzeGray },
  { name: "Silver", color: "#858585", active: BronzeActive, locked: BronzeGray },
  { name: "Gold", color: "#E5A900", active: BronzeActive, locked: BronzeGray },
  { name: "Diamond", color: "#36A9D6", active: BronzeActive, locked: BronzeGray },
];
const XP_PER_LEAGUE = 500;

function getLeagueIndex(xp) {
  return Math.min(Math.floor(Math.max(xp, 0) / XP_PER_LEAGUE), LEAGUES.length - 1);
}

function getDaysUntilMonday() {
  const day = new Date().getDay();
  return day === 1 ? 7 : (8 - day) % 7 || 7;
}

export default function LeagueScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [xp, setXp] = useState(0);
  const [players, setPlayers] = useState([]);

  const loadLeagueData = useCallback(async () => {
    try {
      const progress = await loadUserProgress();
      setXp(progress.xp || 0);

      const user = auth.currentUser;
      if (!user) {
        router.replace("/login");
        return;
      }

      let rankedPlayers = [];

      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        rankedPlayers = usersSnapshot.docs
          .map((userDoc) => ({
            id: userDoc.id,
            ...userDoc.data(),
            xp: Number(userDoc.data().xp) || 0,
          }))
          .filter((player) => player.xp > 0)
          .sort((first, second) => {
            if (second.xp !== first.xp) return second.xp - first.xp;
            return String(first.name || first.username || "").localeCompare(
              String(second.name || second.username || ""),
            );
          });
      } catch (error) {
        console.log("Error loading league users:", error);
      }

      if (rankedPlayers.length === 0 && progress.xp > 0) {
        const currentUserSnapshot = await getDoc(doc(db, "users", user.uid));
        if (currentUserSnapshot.exists()) {
          rankedPlayers = [{
            id: user.uid,
            ...currentUserSnapshot.data(),
            xp: Number(currentUserSnapshot.data().xp) || progress.xp,
          }];
        }
      }

      setPlayers(rankedPlayers);
    } catch (error) {
      console.log("Error loading league:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      loadLeagueData();
    }, [loadLeagueData]),
  );

  const currentIndex = getLeagueIndex(xp);
  const currentLeague = LEAGUES[currentIndex];
  const xpToNextLeague = (currentIndex + 1) * XP_PER_LEAGUE - xp;
  const daysUntilReset = getDaysUntilMonday();

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#A72BFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.badgeRow}>
          {LEAGUES.map((league, index) => {
            const badge = index <= currentIndex ? league.active : league.locked;
            const isCurrent = index === currentIndex;
            return (
              <View key={league.name} style={styles.badgeSlot}>
                <Image
                  source={badge}
                  style={[
                    styles.badge,
                    isCurrent ? styles.currentBadge : styles.otherBadge,
                  ]}
                />
              </View>
            );
          })}
        </View>

        <Text style={[styles.leagueTitle, { color: currentLeague.color }]}>
          {currentLeague.name} League
        </Text>
        <Text style={styles.subtitle}>
          {currentIndex < LEAGUES.length - 1
            ? `${xpToNextLeague} XP needed to proceed`
            : "You reached the highest league"}
        </Text>
        <Text style={styles.countdown}>{daysUntilReset} days</Text>

        <View style={styles.progressBand}>
          <Text style={styles.progressText}>League resets every Monday</Text>
        </View>

        {players.length > 0 ? (
          players.map((player, index) => {
            const playerName = player.name || player.username || "Learner";
            const playerColor = player.avatar === "female" ? "#e3befa" : "#6EC1E9";
            const isCurrentUser = player.id === auth.currentUser?.uid;

            return (
              <View key={player.id} style={[styles.userRow, isCurrentUser && styles.currentUserRow]}>
                <Text style={styles.rank}>{index + 1}</Text>
                <View style={[styles.avatar, { backgroundColor: playerColor }]}>
                  <Text style={styles.avatarText}>{playerName.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={[styles.userName, { color: "#000000" }]} numberOfLines={1}>
                    {playerName}
                  </Text>
                  <View style={styles.streakRow}>
                    <Image source={StreakIcon} style={styles.streakIcon} />
                    <Text style={styles.userLeague}>{player.streak || 0} days</Text>
                  </View>
                </View>
                <Text style={styles.userXp}>{player.xp} XP</Text>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyLeaderboard}>
            <Text style={styles.emptyLeaderboardText}>Earn XP to join the league.</Text>
          </View>
        )}

        <View style={styles.primaryButtonBase}>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.primaryButtonText}>BACK TO HOME</Text>
          </Pressable>
        </View>
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 44,
  },
  badgeRow: {
    minHeight: 98,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  badgeSlot: {
    width: "25%",
    height: 92,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    resizeMode: "contain",
  },
  currentBadge: {
    width: 78,
    height: 86,
  },
  otherBadge: {
    width: 48,
    height: 54,
  },
  leagueTitle: {
    marginTop: 4,
    fontFamily: "Nunito_900Black",
    fontSize: 25,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 5,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 20,
    color: "#777777",
    textAlign: "center",
  },
  countdown: {
    marginTop: 15,
    fontFamily: "Nunito_900Black",
    fontSize: 20,
    color: "#FFC800",
    textAlign: "center",
  },
  progressBand: {
    height: 45,
    marginTop: 10,
    backgroundColor: "#E7E7E7",
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 20,
    color: "#737373",
  },
  userRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  currentUserRow: {
    backgroundColor: "#C8F0FF",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#63C8F2",
  },
  rank: {
    width: 30,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 20,
    color: "#000000",
  },
  avatar: {
    width: 43,
    height: 43,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 20,
    color: "#FFFFFF",
  },
  userDetails: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 18,
  },
  userLeague: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#929292",
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 1,
  },
  streakIcon: {
    width: 11,
    height: 14,
    resizeMode: "contain",
  },
  userXp: {
    marginLeft: 8,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 20,
    color: "#000000",
  },
  emptyLeaderboard: {
    minHeight: 70,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  emptyLeaderboardText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 15,
    color: "#929292",
  },
  primaryButtonBase: {
    height: 61,
    marginHorizontal: 24,
    marginTop: "auto",
    marginBottom: 24,
    alignSelf: "stretch",
    backgroundColor: "#7200B8",
    borderRadius: 12,
    justifyContent: "flex-end",
    overflow: "hidden",
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
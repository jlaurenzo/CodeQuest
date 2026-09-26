import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ArrowBlack from "../../assets/icons/arrowblack.svg";
import startYellow from "../../assets/icons/start-yellow.png";
import bossDefeated from "../../assets/images/bosses/boss-defeated.png";
import bossSlayerAward from "../../assets/images/awards/boss-slayer.png";
import RibbonImage from "../../assets/icons/ribbon.svg"; 
import {
  awardWeeklyBossXp,
  loadUserAttempt,
  loadWeeklyBoss,
} from "../services/weeklyBossService";

export default function WeeklyBossWin() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVictoryData() {
      try {
        const weeklyData = await loadWeeklyBoss();
        setData(weeklyData);
        const userAttempt = await loadUserAttempt(weeklyData.weekId);
        setAttempt(userAttempt);
        if (userAttempt?.status === "completed") {
          await awardWeeklyBossXp(weeklyData.weekId, weeklyData.boss.rewardXP);
        }
      } catch (error) {
        Alert.alert("Error", "Could not load the victory information.");
      } finally {
        setLoading(false);
      }
    }

    loadVictoryData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#A72BFF" size="large" />
        <Text style={styles.loadingText}>Loading victory...</Text>
      </View>
    );
  }

  const boss = data?.boss || {
    name: "Bug King",
    rewardXP: 100,
    badge: "Bug Slayer",
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowBlack width={22} height={22} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>WEEKLY BOSS CHALLENGE</Text>
          <View style={styles.spacer} />
        </View>

        <Text style={styles.victory}>VICTORY!</Text>
        <Text style={styles.bossName}>{boss.name.toUpperCase()}</Text>
        <View style={styles.ribbon}>
          <RibbonImage style={styles.ribbonImage} />
          <Text style={styles.ribbonText}>DEFEATED</Text>
        </View>
        <Image source={bossDefeated} style={styles.bossImage} />
        <Text style={styles.seeYou}>See you next time!</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>REWARDS</Text>
          <View style={styles.rewards}>
            <View style={styles.rewardItem}>
              <Image source={startYellow} style={styles.rewardXpIcon} />
              <Text style={styles.rewardText}>+{boss.rewardXP || 100} XP</Text>
            </View>
            <View style={styles.rewardItem}>
              <Image source={bossSlayerAward} style={styles.badgeImage} />
              <Text style={styles.rewardText}>{boss.badge || "Boss Badge"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonBase}>
          <Pressable style={styles.button} onPress={() => router.replace("/home")}>
            <Text style={styles.buttonText}>CLAIM REWARDS!</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#FFFFFF" 
  },
  content: { 
    paddingHorizontal: 24, 
    paddingBottom: 30, 
    alignItems: "center" 
  },
  loading: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  loadingText: {
     marginTop: 10, 
     color: "#6C7278" 
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  backButton: { 
    padding: 4 
  },
  headerTitle: { 
    fontFamily: "Nunito_900Black", 
    fontWeight: 900,
    fontSize: 16, 
    color: "#000000" 
  },
  spacer: { 
    width: 22 
  },
  victory: { 
    fontFamily: "Nunito_900Black", 
    fontWeight: 900,
    color: "#000000",
    fontSize: 25, 
    marginTop: 24 
  },
  bossName: {
    fontFamily: "Nunito_900Black",
    fontSize: 60,
    color: "#AF32FF",
    marginTop: -10,
  },
  ribbon: { 
    width: "100%",
    height: 100,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -10,
  },
  ribbonText: { 
    position: "absolute",
    fontFamily: "Nunito_900Black",
    fontSize: 36,
    color: "#000000",
    zIndex: 2,
  },
  ribbonImage: {
    width: "150",
    paddingTop: 10,
  },
  bossImage: {
    width: 330, 
    height: 330, 
    resizeMode: "contain", 
    marginTop: 10,
    marginBottom: -20,
  },
  seeYou: { 
    fontFamily: "Nunito_900Black", 
    fontSize: 16, 
    marginVertical: 14 
  },
  card: { 
    width: "100%", 
    borderWidth: 2, 
    borderColor: "#E5E5E5", 
    borderRadius: 16, 
    padding: 14 
  },
  cardTitle: { 
    fontFamily: "Nunito_900Black", 
    fontSize: 14, 
    color: "#4A4A4A" 
  },
  rewards: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    marginTop: 12 
  },
  rewardItem: { 
    alignItems: "center" 
  },
  rewardXpIcon: {
    width: 24,
    height: 26,
    resizeMode: "contain",
  },
  badge: { 
    fontSize: 25 
  },
  badgeImage: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  rewardText: { 
    fontFamily: "Nunito_700Bold", 
    marginTop: 6, 
    color: "#211426" 
  },
  buttonBase: { 
    width: "100%", 
    height: 60, 
    backgroundColor: "#7200B8", 
    borderRadius: 16, 
    justifyContent: "flex-end", 
    overflow: "hidden", 
    marginTop: 16 
  },
  button: { 
    height: 54, 
    backgroundColor: "#B42CFF", 
    borderRadius: 16, 
    alignItems: "center", 
    justifyContent: "center", 
    transform: [{ translateY: -6 }] 
  },
  buttonText: { 
    fontFamily: "Nunito_900Black", 
    color: "#FFFFFF", 
    fontSize: 18 
  },
});

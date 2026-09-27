import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import StreakIcon from "../../assets/icons/streak-1.png";
import CheckOn from "../../assets/icons/streak-checkon.png";
import CheckGray from "../../assets/icons/streak-checkgray.png";
import { getDateKey, loadUserProgress } from "../services/userProgressService";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function getTodayIndex() {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

function getWeekDates() {
  const today = new Date();
  const monday = new Date(today);
  const day = monday.getDay();
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);

  return DAY_LABELS.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return { label, key: getDateKey(date), future: date > today };
  });
}

function Streak() {
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [streakDates, setStreakDates] = useState([]);

  const loadStreak = useCallback(async () => {
    try {
      const progress = await loadUserProgress();
      setStreak(progress.streak || 0);
      setStreakDates(progress.streakDates || []);
    } catch (error) {
      console.log("Error loading streak:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStreak();
    }, [loadStreak]),
  );

  const weekDates = getWeekDates();
  const earnedDays = weekDates.map((day) => streakDates.includes(day.key));

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.fireArea}>
          <Image source={StreakIcon} style={styles.fireIcon} />
        </View>

        <View style={styles.weekRow}>
          {weekDates.map((day, index) => (
            <View key={day.key} style={styles.dayColumn}>
              <Text style={[styles.dayLabel, index === getTodayIndex() && styles.todayLabel]}>
                {day.label}
              </Text>
              {earnedDays[index] && !day.future ? (
                <Image source={CheckOn} style={styles.checkIcon} />
              ) : (
                <Image source={CheckGray} style={styles.checkIcon} />
              )}
            </View>
          ))}
        </View>

        <Text style={styles.title}>{streak} Day Streak!</Text>
        <Text style={styles.subtitle}>You’re on fire! Keep the flame lit</Text>
        <Text style={styles.subtitle}>every day!</Text>

        <View style={styles.primaryButtonBase}>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.primaryButtonText}>CONTINUE</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    minHeight: 415,
    borderWidth: 1.5,
    borderColor: "#E6E6E6",
    borderRadius: 12,
    alignItems: "center",
    paddingTop: 34,
    paddingHorizontal: 10,
  },
  fireArea: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  fireIcon: {
    width: 250,

    resizeMode: "contain",
  },
  weekRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  dayColumn: {
    alignItems: "center",
    gap: 7,
  },
  checkIcon: {
    width: 35,
    height: 35,
    resizeMode: "contain",
  },
  dayLabel: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 16,
    color: "#85818A",
  },
  todayLabel: {
    color: "#A72BFF",
  },
  title: {
    marginTop: 25,
    fontFamily: "Nunito_700Bold",
    fontSize: 20,
    color: "#000000",
  },
  subtitle: {
    marginTop: 5,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    color: "#8E8E93",
  },
  primaryButtonBase: {
    alignSelf: "stretch",
    height: 61,
    marginTop: 36,
    marginBottom: 12,
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
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "900",
  },
});

export default Streak;
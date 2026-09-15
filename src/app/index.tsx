import { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

function Streak() {
  const [streak, setStreak] = useState(0);
  const [lastCompletedDate, setLastCompleteDate] = useState(null);
  const [streakFreeze, setStreakFreeze] = useState(0);

  useEffect(() => {
    loadStreak();
  }, []);

  async function loadStreak() {
    const savedStreak = await AsyncStorage.getItem("streak");
    const savedDate = await AsyncStorage.getItem("lastCompletedDate");
    const savedFreeze = await AsyncStorage.getItem("streakFreeze");

    setStreak(savedStreak ? Number(savedStreak) : 0);
    setLastCompleteDate(savedDate);
    setStreakFreeze(savedFreeze ? Number(savedFreeze) : 0);
  }

  async function completeLesson() {
    const today = new Date().toDateString();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toDateString();

    console.log("Today:", today);
    console.log("Last Completed:", lastCompletedDate);
    console.log("Yesterday:", yesterdayDate);

    if (lastCompletedDate === today) {
      return;
    }

    let newStreak = 0;
    let newFreeze = streakFreeze;

    if (lastCompletedDate === yesterdayDate) {
      newStreak = streak + 1;

      if (newStreak % 7 === 0) {
        newFreeze = streakFreeze + 1;
      }
    } else {
      if (streakFreeze > 0) {
        newStreak = streak;
        newFreeze = streakFreeze - 1;
      } else {
        newStreak = 1;
      }
    }

    setStreak(newStreak);
    setStreakFreeze(newFreeze);
    setLastCompleteDate(today);

    await AsyncStorage.setItem("streak", String(newStreak));
    await AsyncStorage.setItem("lastCompletedDate", today);
    await AsyncStorage.setItem("streakFreeze", String(newFreeze));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.streak}>🔥 {streak} Day Streak</Text>

      <Text style={styles.freeze}>❄️ Streak Freeze: {streakFreeze}</Text>

      <Pressable style={styles.button} onPress={completeLesson}>
        <Text style={styles.buttonText}>Complete Lesson</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 100,
    backgroundColor: "white",
  },

  streak: {
    fontSize: 28,
    fontWeight: "bold",
    color: "black",
  },

  freeze: {
    fontSize: 18,
    marginTop: 15,
    color: "black",
  },

  button: {
    marginTop: 25,
    padding: 15,
    backgroundColor: "purple",
    borderRadius: 10,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default Streak;
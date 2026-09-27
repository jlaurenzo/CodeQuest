import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
import HeartIcon from "../../assets/icons/heart.svg";
import HeartBrokenIcon from "../../assets/icons/heart-broken.svg";
import TimerIcon from "../../assets/icons/timer.svg";
import bossAttack from "../../assets/images/bosses/boss-fight.png";
import bossHurt from "../../assets/images/bosses/boss-hurt.png";
import bossNormal from "../../assets/images/bosses/boss-normal.png";
import {
  loadQuestions,
  loadUserAttempt,
  loadWeeklyBoss,
  awardWeeklyBossXp,
  saveUserAttempt,
} from "../services/weeklyBossService";

const PURPLE = "#A72BFF";

const bossArtByState = {
  normal: bossNormal,
  attack: bossAttack,
  hurt: bossHurt,
};

function formatTime(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function WeeklyBoss() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [bossState, setBossState] = useState("normal");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBattle() {
      try {
        const weeklyData = await loadWeeklyBoss();
        const userAttempt = await loadUserAttempt(weeklyData.weekId);

        if (!userAttempt || userAttempt.status !== "in_progress") {
          router.replace("/weeklybossHome");
          return;
        }

        setData(weeklyData);
        setAttempt(userAttempt);
        setQuestions(await loadQuestions(weeklyData.boss.id));
      } catch (error) {
        Alert.alert("Boss Battle", "The battle could not be loaded.");
        router.back();
      } finally {
        setLoading(false);
      }
    }

    loadBattle();
  }, [router]);

  useEffect(() => {
    if (!data || !attempt || attempt.status !== "in_progress") return undefined;

    const updateTimer = () => {
      const elapsed = Math.floor(
        (Date.now() - new Date(attempt.startedAt).getTime()) / 1000,
      );
      const remaining = Math.max(data.boss.timeLimit - elapsed, 0);
      setSecondsLeft(remaining);

      if (remaining === 0) {
        saveUserAttempt(data.weekId, {
          status: "failed",
          completedAt: new Date().toISOString(),
        }).catch(() => {});
        router.replace("/weeklybossloose");
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [attempt, data, router]);

  const questionMap = useMemo(
    () => new Map(questions.map((question) => [question.id, question])),
    [questions],
  );
  const questionId =
    attempt?.questionIds?.[
      (attempt.currentQuestionIndex || 0) % (attempt.questionIds?.length || 1)
    ];
  const question = questionMap.get(questionId);

  async function checkAnswer() {
    if (selected === null || !question || feedback || !attempt || !data) return;

    const correct = selected === question.correctAnswer;
    const nextCombo = correct ? attempt.combo + 1 : 0;
    const damage = correct ? Math.min(10 + attempt.combo * 5, 40) : 0;
    const nextHP = Math.max(attempt.bossHP - damage, 0);
    const nextLives = correct ? attempt.lives : attempt.lives - 1;
    const nextStatus =
      nextHP === 0 ? "completed" : nextLives === 0 ? "failed" : "in_progress";
    const nextAttempt = {
      ...attempt,
      bossHP: nextHP,
      lives: nextLives,
      combo: nextCombo,
      highestCombo: Math.max(attempt.highestCombo, nextCombo),
      currentQuestionIndex: attempt.currentQuestionIndex + 1,
      status: nextStatus,
      completedAt:
        nextStatus === "in_progress" ? null : new Date().toISOString(),
    };

    setFeedback({
      correct,
      damage,
      answer: question.correctAnswer,
      explanation: question.explanation,
    });
    setBossState(correct ? "hurt" : "attack");
    setAttempt(nextAttempt);

    try {
      await saveUserAttempt(data.weekId, nextAttempt);
      if (nextStatus === "completed") {
        const xpResult = await awardWeeklyBossXp(data.weekId, data.boss.rewardXP);
        if (xpResult?.firstXpToday) {
          router.push("/streaksytem");
        }
      }
    } catch (error) {
      Alert.alert("Save failed", "Your answer could not be saved.");
    }
  }

  function continueBattle() {
    if (attempt.status === "completed") {
      router.replace("/weeklybosswin");
      return;
    }

    if (attempt.status === "failed") {
      router.replace("/weeklybossloose");
      return;
    }

    setSelected(null);
    setFeedback(null);
    setBossState("normal");
  }

  if (loading || !data || !attempt || !question) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PURPLE} />
        <Text style={styles.loadingText}>Loading boss battle...</Text>
      </View>
    );
  }

  const hpPercent = Math.max(attempt.bossHP / data.boss.maxHP, 0) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Exit battle"
          >
            <ArrowBlack width={22} height={22} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>BOSS BATTLE</Text>
          <View style={styles.timerContainer}>
            <TimerIcon width={20} height={20} />
            <Text style={styles.timer}>{formatTime(secondsLeft)}</Text>
          </View>
        </View>

        <View style={styles.bossContainer}>
          <Image source={bossArtByState[bossState]} style={styles.bossImage} />
        </View>

        <View style={styles.bosscard}>
          <View style={styles.bossNameRow}>
            <Text style={styles.bossName}>{data.boss.name.toUpperCase()}</Text>
            <Text style={styles.hpValueText}>
              {attempt.bossHP} / {data.boss.maxHP} HP
            </Text>
          </View>
          <View style={styles.hpRow}>
            <View style={styles.hpBarBg}>
              <View style={[styles.hpBarFill, { width: `${hpPercent}%` }]} />
            </View>
            <HeartIcon style={styles.heart} />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionNumber}>
              Question {attempt.currentQuestionIndex + 1}/10
            </Text>
            <View style={styles.questionHearts}>
              {[0, 1, 2].map((heart) =>
                heart < attempt.lives ? (
                  <HeartIcon
                    key={heart}
                    width={30}
                    height={30}
                    style={styles.heartOn}
                  />
                ) : (
                  <HeartBrokenIcon
                    key={heart}
                    width={30}
                    height={30}
                    style={styles.heartOn}
                  />
                ),
              )}
            </View>
          </View>

          <Text style={styles.questionPrompt}>{question.question}</Text>
          <Text style={styles.codeBox}>{question.code}</Text>

          {question.options.map((option, index) => (
            <Pressable
              key={`${question.id}-${index}`}
              disabled={Boolean(feedback)}
              onPress={() => setSelected(index)}
              style={[
                styles.option,
                selected === index && styles.optionSelected,
                feedback && index === question.correctAnswer && styles.optionCorrect,
                feedback &&
                  selected === index &&
                  selected !== question.correctAnswer &&
                  styles.optionWrong,
              ]}
            >
              <Text style={styles.radio}>{selected === index ? "●" : "○"}</Text>
              <Text style={styles.optionText}>{option}</Text>
            </Pressable>
          ))}

          {feedback && (
            <Text style={feedback.correct ? styles.correctText : styles.wrongText}>
              {feedback.correct
                ? `✓ CORRECT!  -${feedback.damage} HP`
                : `✕ WRONG: ${question.options[feedback.answer]}`}
            </Text>
          )}
        </View>

        <View style={styles.primaryButtonBase}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
            onPress={feedback ? continueBattle : checkAnswer}
          >
            <Text style={styles.primaryButtonText}>
              {feedback
                ? attempt.status === "in_progress"
                  ? "CONTINUE"
                  : "SEE RESULTS"
                : "CHECK"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 30,
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 12,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 15,
    color: "#6C7278",
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
    fontSize: 16,
    color: "#000000",
    letterSpacing: 0.5,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timer: {
    fontFamily: "Nunito_700Bold",
    fontSize: 18,
    color: "#000000",
  },
  bossContainer: { 
    alignItems: "center", 
    marginBottom: 8 
  },
  bossImage: { 
    width: 200, 
    height: 200, 
    resizeMode: "contain" 
  },
  card: {
    width: "100%",
    borderWidth: 3,
    borderColor: "#E5E5E5",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 14,
  },
    bosscard: {
    width: "100%",
    borderWidth: 0,
    borderColor: "#E5E5E5",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 14,
  },
  bossNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  bossName: {
    fontFamily: "Nunito_900Black",
    fontSize: 15,
    color: "#AF32FF",
  },
  hpValueText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: "#6C7278",
  },
  hpRow: { 
    flexDirection: "row", alignItems: "center"
  },
  hpBarBg: {
    flex: 1,
    height: 14,
    backgroundColor: "#E8E8E8",
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 10,
  },
  hpBarFill: {
    height: "100%",
    backgroundColor: "#24B874",
    borderRadius: 8,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questionNumber: {
    fontFamily: "Nunito_500Medium",
    fontSize: 15,
    color: "#8E8E93",
  },
  questionHearts: { 
    flexDirection: "row", gap: 3 
  },
  heart: {
    width: 30,
    height: 30,
  },
  heartOn: { 
    opacity: 1 
  },
  heartOff: { 
    opacity: 0.2 
  },
  questionPrompt: {
    fontFamily: "Nunito_900Black",
    fontSize: 16,
    color: "#000000",
    marginTop: 10,
  },
  codeBox: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    color: "#000000",
    fontFamily: "Nunito_600SemiBold",
    fontSize: 20,
    marginTop: 10,
    marginBottom: 4,
  },
  option: {
    minHeight: 42,
    borderWidth: 3,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginTop: 8,
  },
  optionSelected: { 
    borderColor: "#AF32FF", 
    backgroundColor: "#EFD5FF" 
  },
  optionCorrect: { 
    borderColor: "#338B33", 
    backgroundColor: "#EBF9EC" 
  },
  optionWrong: { 
    borderColor: "#CD101A", 
    backgroundColor: "#FDEFF1" 
  },
  radio: { 
    width: 26, 
    color: PURPLE, 
    fontSize: 20 
  },
  optionText: {
    flex: 1,
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: "#111111",
  },
  correctText: {
    fontFamily: "Nunito_900Black",
    fontSize: 12,
    color: "#299C50",
    marginTop: 12,
  },
  wrongText: {
    fontFamily: "Nunito_900Black",
    fontSize: 12,
    color: "#D23845",
    marginTop: 12,
  },
  primaryButtonBase: {
    width: "100%",
    height: 60,
    backgroundColor: "#7200B8",
    borderRadius: 16,
    justifyContent: "flex-end",
    overflow: "hidden",
    marginTop: 6,
  },
  primaryButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#B42CFF",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateY: -6 }],
  },
  primaryButtonPressed: {
    backgroundColor: "#9D20E8",
    transform: [{ translateY: 0 }],
  },
  primaryButtonText: {
    fontFamily: "Nunito_900Black",
    color: "#FFFFFF",
    fontSize: 20,
  },
});

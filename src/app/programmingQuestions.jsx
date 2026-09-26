import React, { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import FireActive from "../../assets/icons/fire-active.svg";
import HeartIcon from "../../assets/icons/heart.svg";
import HeartBrokenIcon from "../../assets/icons/heart-broken.svg";
import startYellow from "../../assets/icons/start-yellow.png";
import starGray from "../../assets/icons/star-gray.png";
import onboardingIcon from "../../assets/images/onboarding-icon.png";
import bossDefeated from "../../assets/images/level-win.png";
import learningContent from "../data/learningContent.json";
import { markLevelComplete } from "../services/learningProgress";

function getContentLanguage(language) {
  const requested = String(language).toLowerCase();
  const key = Object.keys(learningContent).find(
    (item) => item.toLowerCase() === requested,
  );
  return key ? learningContent[key] : learningContent.JavaScript;
}
import {
  HEART_REFILL_SECONDS,
  addUserXp,
  loadUserProgress,
  saveHearts,
} from "../services/userProgressService";

const questions = [
  {
    question: "Which command is used to display output in C++?",
    choices: ["print()", "cout;", "System.out.println", "display()"],
    answer: 1,
    type: "choice",
  },
  {
    question: 'Print Output\n______("Hello, World!") using javascript;',
    answerText: "console.log",
    type: "text",
  },
  {
    question: "Which data type stores whole numbers?",
    choices: ["String", "double", "int", "boolean"],
    answer: 2,
    type: "choice",
  },
  {
    question: `#include <iostream> 
using namespace std; 

int main() { 
    cout << "Hello World!" 
    return 0; 
} 

Which line fixes the error?`,
    choices: [
      'cout << "Hello World!";',
      'cout << "Hello World!"',
      'cout << "Hello World!";;',
    ],
    answer: 0,
    type: "choice",
  },
  {
    question: `Add Two Numbers using Javascript 

Create two numbers and display their sum. 

Concept: Variables, operators 

let a = 10; 
let b = 5; 

Which code correctly displays the answer 15?`,
    choices: [
      "console.log(a + b);",
      "cout << a + b;",
      "System.out.println(a + b);",
    ],
    answer: 0,
    type: "choice",
  },
];

const TIMER_SECONDS = HEART_REFILL_SECONDS;
const LEVEL_HEARTS = 3;

export default function App() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const language = Array.isArray(params.language) ? params.language[0] : params.language || "JavaScript";
  const unit = Array.isArray(params.unit) ? params.unit[0] : params.unit || "unit-1";
  const moduleId = Array.isArray(params.module) ? params.module[0] : params.module || "module-1";
  const level = Array.isArray(params.level) ? params.level[0] : params.level || "level-1";
  const languageData = getContentLanguage(language);
  const routeLevel = languageData?.units
    ?.find((item) => item.id === unit)?.modules
    ?.find((item) => item.id === moduleId)?.levels
    ?.find((item) => item.id === level);
  const activeQuestions = routeLevel?.questions?.length ? routeLevel.questions : questions;
  const [started, setStarted] = useState(false);
  const [levelQuestions, setLevelQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [hearts, setHearts] = useState(LEVEL_HEARTS);
  const [accountHearts, setAccountHearts] = useState(5);
  const [heartRefillAt, setHeartRefillAt] = useState(null);
  const [waitTime, setwaitTime] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  async function saveProgress(newQuestions, newCurrentQuestion, newHearts) {
    await AsyncStorage.setItem(
      "level1Progress",
      JSON.stringify({
        questions: newQuestions,
        currentQuestion: newCurrentQuestion,
        hearts: newHearts,
      }),
    );
  }

  useEffect(() => {
    const loadData = async () => {
      const accountProgress = await loadUserProgress();
      const currentHearts = typeof accountProgress.hearts === "number" ? accountProgress.hearts : 5;
      setAccountHearts(currentHearts);
      setHeartRefillAt(accountProgress.heartRefillAt);

      if (currentHearts > 0) {
        await AsyncStorage.removeItem("heartRefillTime");
        setWaiting(false);
        setwaitTime(0);
        setHearts(Math.min(currentHearts, LEVEL_HEARTS));
      } else {
        setHearts(0);
        if (accountProgress.heartRefillAt) {
          const remaining = Math.max(
            0,
            Math.floor((accountProgress.heartRefillAt - Date.now()) / 1000)
          );
          if (remaining > 0) {
            setwaitTime(remaining);
            setWaiting(true);
            setStarted(false);
          }
        }
      }

      const savedProgressStr = await AsyncStorage.getItem("level1Progress");
      if (savedProgressStr) {
        const progress = JSON.parse(savedProgressStr);
        setLevelQuestions(progress.questions);
        setCurrentQuestion(progress.currentQuestion);
        if (currentHearts > 0) {
          setHearts(Math.min(typeof progress.hearts === "number" ? progress.hearts : LEVEL_HEARTS, currentHearts, LEVEL_HEARTS));
        }
        setHasSavedProgress(true);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!waiting) return;

    const timer = setInterval(async () => {
      const accountProgress = await loadUserProgress();
      const currentHearts = typeof accountProgress.hearts === "number" ? accountProgress.hearts : 0;
      
      if (currentHearts > 0) {
        clearInterval(timer);
        setAccountHearts(currentHearts);
        setHearts(Math.min(currentHearts, LEVEL_HEARTS));
        setHeartRefillAt(accountProgress.heartRefillAt);
        setWaiting(false);
        setwaitTime(0);
        await AsyncStorage.removeItem("heartRefillTime");
        return;
      }

      if (accountProgress.heartRefillAt) {
        const remaining = Math.max(
          0,
          Math.floor((accountProgress.heartRefillAt - Date.now()) / 1000)
        );
        setwaitTime(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [waiting]);

  const startLevel = async () => {
    const accountProgress = await loadUserProgress();
    const currentHearts = typeof accountProgress.hearts === "number" ? accountProgress.hearts : 5;
    setAccountHearts(currentHearts);
    setHeartRefillAt(accountProgress.heartRefillAt);

    if (currentHearts <= 0) {
      if (accountProgress.heartRefillAt) {
        const remaining = Math.max(
          0,
          Math.floor((accountProgress.heartRefillAt - Date.now()) / 1000)
        );
        if (remaining > 0) {
          setwaitTime(remaining);
          setWaiting(true);
          setStarted(false);
          return;
        }
      }
    }

    const savedProgressStr = await AsyncStorage.getItem("level1Progress");

    if (savedProgressStr) {
      const progress = JSON.parse(savedProgressStr);
      setLevelQuestions(progress.questions);
      setCurrentQuestion(progress.currentQuestion);
      setHearts(Math.min(typeof progress.hearts === "number" && progress.hearts > 0 ? progress.hearts : LEVEL_HEARTS, currentHearts, LEVEL_HEARTS));
      setStarted(true);
      return;
    }

    const randomQuestions = [...activeQuestions].sort(() => Math.random() - 0.5);
    setLevelQuestions(randomQuestions);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setTypedAnswer("");
    setHearts(Math.min(currentHearts, LEVEL_HEARTS));
    setFinished(false);
    setAnswered(false);
    setIsCorrect(false);
    setStarted(true);
  };

  const checkAnswer = async () => {
    const current = levelQuestions[currentQuestion];
    let correct = false;

    if (current.type === "text") {
      correct =
        typedAnswer.trim().toLowerCase() === current.answerText.toLowerCase();
    } else {
      correct = selectedAnswer === current.answer;
    }

    setIsCorrect(correct);
    setAnswered(true);

    if (!correct) {
      const newHearts = Math.max(0, hearts - 1);
      const nextHeartRefillAt = heartRefillAt || Date.now() + HEART_REFILL_SECONDS * 1000;
      setHearts(newHearts);
      const newAccountHearts = Math.max(0, accountHearts - 1);
      setAccountHearts(newAccountHearts);
      setHeartRefillAt(nextHeartRefillAt);
      saveProgress(levelQuestions, currentQuestion, newHearts);
      await saveHearts(newAccountHearts, nextHeartRefillAt);

      if (newHearts === 0) {
        const endTime = nextHeartRefillAt;
        await AsyncStorage.setItem("heartRefillTime", String(endTime));
        setwaitTime(TIMER_SECONDS);
        setStarted(false);
        setAnswered(false);
        setWaiting(true);
      }
    }
  };

  const continueQuestion = async () => {
    const nextQuestion = currentQuestion + 1;

    if (nextQuestion >= levelQuestions.length) {
      setFinished(true);
      setStarted(false);
      await AsyncStorage.removeItem("level1Progress");

      const oldXPStr = await AsyncStorage.getItem("xp");
      const oldXP = Number(oldXPStr) || 0;
      await AsyncStorage.setItem("xp", String(oldXP + 20));
      await addUserXp(20);
      await markLevelComplete(language, unit, moduleId, level);
      return;
    }

    setCurrentQuestion(nextQuestion);
    setSelectedAnswer(null);
    setTypedAnswer("");
    setAnswered(false);
    setIsCorrect(false);
    saveProgress(levelQuestions, nextQuestion, hearts);
  };

  const leaveLevel = () => {
    saveProgress(levelQuestions, currentQuestion, hearts);
    setStarted(false);
    setSelectedAnswer(null);
    setTypedAnswer("");
    setAnswered(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {!started && !finished && !waiting && (
        <View style={styles.startContainer}>
          <Image source={onboardingIcon} style={styles.startImage} />
          <Text style={styles.startTitle}>Ready for the challenge?</Text>
          <Text style={styles.startSubtitle}>
            Complete the level to earn XP{"\n"}and stars!
          </Text>
          <View style={styles.starRow}>
            {[0, 1, 2].map((star) => (
              <Image key={star} source={starGray} style={styles.star} />
            ))}
          </View>
          <TouchableOpacity style={styles.checkButton} onPress={startLevel}>
            <Text style={styles.checkButtonText}>
              {hasSavedProgress ? "CONTINUE LEVEL" : "START LEVEL"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {started && !waiting && levelQuestions.length > 0 && (
        <View style={styles.questionContainer}>
          <ScrollView
            style={styles.questionScroll}
            contentContainerStyle={styles.questionContent}
          >
            <View style={styles.questionTopBar}>
            <TouchableOpacity onPress={leaveLevel}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${((currentQuestion + 1) / levelQuestions.length) * 100}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.hearts}>
              {Array.from({ length: LEVEL_HEARTS }, (_, heart) =>
                heart < hearts ? (
                  <HeartIcon key={heart} width={20} height={19} style={styles.heartOn} />
                ) : (
                  <HeartBrokenIcon key={heart} width={20} height={19} style={styles.heartBroken} />
                ),
              )}
            </View>
            </View>

          <View style={styles.questionBox}>
            <Text style={styles.questionBoxText}>
              {levelQuestions[currentQuestion].question}
            </Text>
          </View>

          {levelQuestions[currentQuestion].type === "text" && (
            <View>
              <Text style={styles.inputLabel}>Type your answer</Text>
              <TextInput
                style={[
                  styles.input,
                  answered && (isCorrect ? styles.inputCorrect : styles.inputWrong),
                ]}
                value={typedAnswer}
                onChangeText={setTypedAnswer}
                editable={!answered}
                placeholder="Type your answer"
                placeholderTextColor="#999"
              />

              {answered && !isCorrect && (
                <Text style={styles.correctAnswer}>
                  Correct answer: {levelQuestions[currentQuestion].answerText}
                </Text>
              )}
            </View>
          )}

          {levelQuestions[currentQuestion].type === "choice" && (
            <View style={styles.choices}>
              {levelQuestions[currentQuestion].choices.map((choice, index) => {
                let choiceStyle = styles.choice;
                let spanStyle = styles.choiceSpan;
                let spanTextStyle = styles.choiceSpanText;

                if (answered) {
                  if (index === levelQuestions[currentQuestion].answer) {
                    choiceStyle = [styles.choice, styles.choiceCorrect];
                    spanStyle = [styles.choiceSpan, styles.choiceCorrectSpan];
                    spanTextStyle = styles.whiteText;
                  } else if (
                    index === selectedAnswer &&
                    index !== levelQuestions[currentQuestion].answer
                  ) {
                    choiceStyle = [styles.choice, styles.choiceWrong];
                    spanStyle = [styles.choiceSpan, styles.choiceWrongSpan];
                    spanTextStyle = styles.whiteText;
                  }
                } else if (selectedAnswer === index) {
                  choiceStyle = [styles.choice, styles.choiceSelected];
                  spanStyle = [styles.choiceSpan, styles.choiceSelectedSpan];
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={choiceStyle}
                    disabled={answered}
                    onPress={() => setSelectedAnswer(index)}
                  >
                    <View style={spanStyle}>
                      <Text style={spanTextStyle}>
                        {String.fromCharCode(65 + index)}
                      </Text>
                    </View>
                    <Text style={styles.choiceText}>
                      {choice}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          </ScrollView>

          {!answered && (
            <TouchableOpacity style={styles.checkQuestionButton} onPress={checkAnswer}>
              <Text style={styles.checkQuestionButtonText}>CHECK</Text>
            </TouchableOpacity>
          )}

          {answered && (
            <TouchableOpacity style={styles.checkQuestionButton} onPress={continueQuestion}>
              <Text style={styles.checkQuestionButtonText}>
                {currentQuestion === levelQuestions.length - 1
                  ? "LEVEL 2"
                  : "CONTINUE"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {waiting && (
        <View style={styles.waitingContainer}>
          <View style={styles.waitingTopBar}>
            <TouchableOpacity onPress={() => setWaiting(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.waitingCard}>
            <View style={styles.brokenHeartCircle}>
              <HeartBrokenIcon width={48} height={46} />
            </View>

            <Text style={styles.waitingTitle}>Out of Hearts!</Text>
            <Text style={styles.waitingSubtitle}>
              You need hearts to continue this level.{"\n"}Wait for a heart to refill.
            </Text>

            <View style={styles.timerBadge}>
              <Text style={styles.timerLabel}>NEXT HEART IN</Text>
              <Text style={styles.timerText}>
                {Math.floor(waitTime / 60)}:{String(waitTime % 60).padStart(2, "0")}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.checkButton}
              onPress={() => router.replace({ pathname: "/LevelMap2", params: { language, unit, module: moduleId } })}
            >
              <Text style={styles.checkButtonText}>BACK TO MAP</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {finished && (
        <View style={styles.completeContainer}>
          <Image source={bossDefeated} style={styles.completeImage} />
          <Text style={styles.completeTitle}>Level Complete!</Text>
          <View style={styles.rewardRow}>
            <Text style={styles.xpReward}>+20 XP</Text>
            <View style={styles.fireReward}>
              <Text style={styles.fireRewardText}>+1</Text>
              <FireActive width={19} height={24} />
            </View>
          </View>
          <View style={styles.starRow}>
            <Image source={startYellow} style={styles.star} />
            <Image source={startYellow} style={styles.star} />
            <Image source={starGray} style={styles.star} />
          </View>

          <TouchableOpacity
            style={[styles.checkButton, styles.completeButton]}
            onPress={() => router.replace({ pathname: "/LevelMap2", params: { language, unit, module: moduleId } })}
          >
            <Text style={styles.checkButtonText}>CONTINUE</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
  },
  startContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingBottom: 20,
  },
  startImage: {
    marginTop: "30%",
    width: 280,
    height: 280,
    resizeMode: "contain",
    marginBottom: 8,
  },
  startTitle: {
    textAlign: "center",
    fontFamily: "Nunito_900Black",
    fontSize: 30,
    fontWeight: "900",
    color: "#000000",
  },
  startSubtitle: {
    marginTop: 6,
    textAlign: "center",
    color: "#737373",
    fontFamily: "Nunito_600SemiBold",
    fontWeight: 600,
    fontSize: 20,
  },
  starRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginVertical: 18,
  },
  star: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  questionTopBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 0,
    marginBottom: 34,
  },
  closeButton: {
    color: "#A8A8A8",
    fontSize: 30,
    lineHeight: 30,
  },
  progressTrack: {
    flex: 1,
    height: 9,
    borderRadius: 8,
    backgroundColor: "#E5E5E8",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 8,
    backgroundColor: "#65C900",
  },
  hearts: {
    flexDirection: "row",
    gap: 3,
  },
  heartOn: {
    opacity: 1,
  },
  heartOff: {
    opacity: 0.2,
  },
  heartBroken: {
    opacity: 1,
  },
  waitingContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: "space-between",
  },
  waitingTopBar: {
    width: "100%",
    alignItems: "flex-end",
  },
  waitingCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    marginVertical: "auto",
  },
  brokenHeartCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#FFE5E5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#FFA8A8",
  },
  waitingTitle: {
    fontFamily: "Nunito_900Black",
    fontSize: 28,
    fontWeight: "900",
    color: "#222222",
    textAlign: "center",
  },
  waitingSubtitle: {
    marginTop: 8,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 16,
    lineHeight: 22,
    color: "#737373",
    textAlign: "center",
  },
  timerBadge: {
    marginTop: 24,
    marginBottom: 16,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    backgroundColor: "#FFF0F0",
    borderWidth: 1.5,
    borderColor: "#FFD0D0",
    alignItems: "center",
  },
  timerLabel: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 12,
    color: "#FF4D4D",
    letterSpacing: 1,
    marginBottom: 4,
  },
  timerText: {
    fontFamily: "Nunito_900Black",
    fontSize: 34,
    fontWeight: "900",
    color: "#FF3333",
  },
  inputLabel: {
    marginBottom: 8,
    color: "#4A4A4A",
    fontSize: 15,
    fontWeight: "bold",
  },
  completeContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 34,
    paddingBottom: 14,
  },
  completeImage: {
    marginTop: 40,
    width: 270,
    resizeMode: "contain",
    marginBottom: 8,
  },
  completeTitle: {
    fontFamily: "Nunito_900Black",
    marginTop: 15,
    fontSize: 35,
    fontWeight: "900",
    color: "#000000",
  },
  rewardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  xpReward: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 7,
    backgroundColor: "#DDF8D2",
    color: "#5CCF04",
    fontFamily: "Nunito_900Black",
    fontSize: 22,
    fontWeight: "900",
  },
  fireReward: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 7,
    backgroundColor: "#F2D9FF",
  },
  fireRewardText: {
    color: "#AF32FF",
    fontFamily: "Nunito_900Black",
    fontSize: 22,
    fontWeight: "900",
  },
  completeButton: {
    marginTop: "auto",
    marginBottom: 20,
  },
  questionBox: {
    marginBottom: 28,
    paddingHorizontal: 12,
  },
  questionContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  questionContent: {
    paddingTop: 18,
    paddingBottom: 20,
  },
  questionBoxText: {
    fontFamily: "Nunito_900Black",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    color: "#000000",
  },
  choices: {
    marginHorizontal: 0,
  },
  choice: {
    width: "100%",
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
    marginBottom: 25,
  },
  choiceSpan: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#eeeeee",
    marginRight: 12,
  },
  choiceSpanText: {
    fontFamily: "Nunito_900Black",
    fontWeight: "bold",
    color: "#000",
  },
  choiceText: {
    flex: 1,
    fontFamily: "Nunito_900Black",
    fontSize: 18,
    color: "#000000",
  },
  choiceSelected: {
    backgroundColor: "#E7C8FF",
    borderColor: "#B42CFF",
    borderWidth: 2,
  },
  choiceSelectedSpan: {
    backgroundColor: "#d9a9ff",
  },
  choiceCorrect: {
    backgroundColor: "#d9f7df",
    borderColor: "#2ecc71",
  },
  choiceCorrectSpan: {
    backgroundColor: "#2ecc71",
  },
  choiceWrong: {
    backgroundColor: "#ffd6d6",
    borderColor: "#ff4d4d",
  },
  choiceWrongSpan: {
    backgroundColor: "#ff4d4d",
  },
  whiteText: {
    color: "white",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: "white",
  },
  inputCorrect: {
    backgroundColor: "#d9f7df",
    borderColor: "#2ecc71",
  },
  inputWrong: {
    backgroundColor: "#ffd6d6",
    borderColor: "#ff4d4d",
  },
  correctAnswer: {
    color: "#2ecc71",
    fontWeight: "bold",
    marginTop: 8,
  },
  checkButton: {
    width: "100%",
    height: 61,
    marginTop: "10%",
    backgroundColor: "#7200B8",
    borderRadius: 22,
    justifyContent: "flex-end",
    overflow: "hidden",
    paddingBottom: 7,
  },
  checkButtonText: {
    width: "100%",
    height: 54,
    paddingTop: 16,
    textAlign: "center",
    backgroundColor: "#B42CFF",
    borderRadius: 22,
    color: "white",
    fontFamily: "Nunito_900Black",
    fontSize: 20,
    fontWeight: "900",
  },
  checkQuestionButton: {
    width: "100%",
    height: 61,
    marginTop: 12,
    marginBottom: 30,
    backgroundColor: "#7200B8",
    borderRadius: 12,
    justifyContent: "flex-end",
    overflow: "hidden",
    paddingBottom: 7,
  },
  checkQuestionButtonText: {
    width: "100%",
    height: 54,
    paddingTop: 16,
    textAlign: "center",
    backgroundColor: "#B42CFF",
    borderRadius: 12,
    color: "white",
    fontFamily: "Nunito_900Black",
    fontSize: 20,
    fontWeight: "900",
  },
});
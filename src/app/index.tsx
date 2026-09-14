import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const TEST_MODE = true;
const TIMER_SECONDS = TEST_MODE ? 10 : 30 * 60;

export default function App() {
  const [started, setStarted] = useState(false);
  const [levelQuestions, setLevelQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [hearts, setHearts] = useState(3);
  const [waitTime, setwaitTime] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const savedTimeStr = await AsyncStorage.getItem("heartRefillTime");
      const savedProgressStr = await AsyncStorage.getItem("level1Progress");

      if (savedTimeStr) {
        const savedTime = Number(savedTimeStr);
        const remaining = Math.max(
          0,
          Math.floor((savedTime - Date.now()) / 1000)
        );

        if (remaining > 0) {
          setwaitTime(remaining);
          setWaiting(true);
          setStarted(false);
          return;
        } else {
          await AsyncStorage.removeItem("heartRefillTime");
          setHearts(3);
        }
      }

      if (savedProgressStr) {
        const progress = JSON.parse(savedProgressStr);
        setLevelQuestions(progress.questions);
        setCurrentQuestion(progress.currentQuestion);
        setHearts(progress.hearts);
        setHasSavedProgress(true);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!waiting) return;

    const timer = setInterval(async () => {
      const savedTimeStr = await AsyncStorage.getItem("heartRefillTime");
      const savedTime = Number(savedTimeStr);

      const remaining = Math.max(
        0,
        Math.floor((savedTime - Date.now()) / 1000)
      );

      setwaitTime(remaining);

      if (remaining === 0) {
        clearInterval(timer);
        setHearts(3);
        setWaiting(false);
        await AsyncStorage.removeItem("heartRefillTime");
        saveProgress(levelQuestions, currentQuestion, 3);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [waiting]);

  const saveProgress = async (newQuestions, newCurrentQuestion, newHearts) => {
    await AsyncStorage.setItem(
      "level1Progress",
      JSON.stringify({
        questions: newQuestions,
        currentQuestion: newCurrentQuestion,
        hearts: newHearts,
      })
    );
  };

  const startLevel = async () => {
    const savedTimeStr = await AsyncStorage.getItem("heartRefillTime");
    if (savedTimeStr) {
      const remaining = Math.max(
        0,
        Math.floor((Number(savedTimeStr) - Date.now()) / 1000)
      );
      if (remaining > 0) {
        setwaitTime(remaining);
        setWaiting(true);
        setStarted(false);
        return;
      }
    }

    const savedProgressStr = await AsyncStorage.getItem("level1Progress");

    if (savedProgressStr) {
      const progress = JSON.parse(savedProgressStr);
      setLevelQuestions(progress.questions);
      setCurrentQuestion(progress.currentQuestion);
      setHearts(progress.hearts);
      setStarted(true);
      return;
    }

    const randomQuestions = [...questions].sort(() => Math.random() - 0.5);
    setLevelQuestions(randomQuestions);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setTypedAnswer("");
    setHearts(3);
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
      setHearts(newHearts);
      saveProgress(levelQuestions, currentQuestion, newHearts);

      if (newHearts === 0) {
        const endTime = Date.now() + TIMER_SECONDS * 1000;
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
    <SafeAreaView style={styles.phone}>
      {!started && !finished && !waiting && (
        <View style={{ flex: 1, justifyContent: "flex-end", paddingBottom: 20 }}>
          <TouchableOpacity style={styles.checkButton} onPress={startLevel}>
            <Text style={styles.checkButtonText}>
              {hasSavedProgress ? "Continue Level 1" : "Start Level 1"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {started && !waiting && levelQuestions.length > 0 && (
        <ScrollView style={{ flex: 1 }}>
          <TouchableOpacity style={{ alignSelf: "flex-start", marginBottom: 10 }} onPress={leaveLevel}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>X</Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 22, fontWeight: "bold" }}>Level 1</Text>

          <Text style={{ fontSize: 18, marginVertical: 10 }}>
            {"❤️".repeat(hearts)}
            {"🖤".repeat(3 - hearts)}
          </Text>

          <View style={styles.questionBox}>
            <Text style={styles.questionBoxText}>
              {levelQuestions[currentQuestion].question}
            </Text>
          </View>

          <Text style={{ fontSize: 14, marginBottom: 15, color: "#666" }}>
            Question {currentQuestion + 1}/{levelQuestions.length}
          </Text>

          {levelQuestions[currentQuestion].type === "text" && (
            <View>
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
                    <Text style={{ fontSize: 16, fontWeight: "bold", flex: 1 }}>
                      {choice}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {!answered && (
            <TouchableOpacity style={styles.checkButton} onPress={checkAnswer}>
              <Text style={styles.checkButtonText}>CHECK</Text>
            </TouchableOpacity>
          )}

          {answered && (
            <TouchableOpacity style={styles.checkButton} onPress={continueQuestion}>
              <Text style={styles.checkButtonText}>
                {currentQuestion === levelQuestions.length - 1
                  ? "LEVEL 2"
                  : "CONTINUE"}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {waiting && (
        <View style={{ flex: 1, alignItems: "center", paddingTop: 50 }}>
          <View style={{ width: "100%", alignItems: "flex-end" }}>
            <TouchableOpacity onPress={() => setWaiting(false)}>
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>X</Text>
            </TouchableOpacity>
          </View>

          <View style={{ paddingTop: 100, alignItems: "center" }}>
            <Text style={{ fontSize: 22, fontWeight: "bold" }}>Out of Hearts! ❤️</Text>
            <Text style={{ fontSize: 16, marginVertical: 10 }}>Wait for a heart to refill.</Text>
            <Text style={{ fontSize: 26, fontWeight: "bold", color: "#ff4d4d" }}>
              {Math.floor(waitTime / 60)}:
              {String(waitTime % 60).padStart(2, "0")}
            </Text>
          </View>
        </View>
      )}

      {finished && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 22, fontWeight: "bold" }}>Level 1 Complete!</Text>
          <Text style={{ fontSize: 16, marginVertical: 5 }}>You survived Level 1!</Text>
          <Text style={{ fontSize: 16, marginBottom: 20 }}>🎉 +20 XP</Text>

          <TouchableOpacity style={styles.checkButton} onPress={() => setFinished(false)}>
            <Text style={styles.checkButtonText}>LEVEL 2</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  phone: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },
  questionBox: {
    marginVertical: 15,
  },
  questionBoxText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  choices: {
    marginTop: 15,
  },
  choice: {
    width: "100%",
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    marginBottom: 12,
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
    fontWeight: "bold",
    color: "#000",
  },
  choiceSelected: {
    backgroundColor: "#e8c8ff",
    borderColor: "#b52cff",
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
    height: 55,
    marginTop: 15,
    backgroundColor: "#b52cff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
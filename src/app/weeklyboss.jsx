import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import ArrowBlack from "../../assets/icons/arrowblack.svg";
import HeartBrokenIcon from "../../assets/icons/heart-broken.svg";
import HeartIcon from "../../assets/icons/heart.svg";
import TimerIcon from "../../assets/icons/timer.svg";

import bossAttack from "../../assets/images/bosses/boss-fight.png";
import bossHurt from "../../assets/images/bosses/boss-hurt.png";
import bossNormal from "../../assets/images/bosses/boss-normal.png";

import {
  loadQuestions,
  loadUserAttempt,
  loadWeeklyBoss,
  QUESTION_TYPES,
  saveUserAttempt,
} from "../services/weeklyBossService";

const PURPLE = "#A72BFF";

const bossArtByState = {
  normal: bossNormal,
  attack: bossAttack,
  hurt: bossHurt,
};

function formatTime(seconds) {
  return `${Math.floor(
    seconds / 60,
  )}:${String(
    seconds % 60,
  ).padStart(2, "0")}`;
}

function normalizeAnswer(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeCode(value) {
  return String(value ?? "")
    .trim()
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n+/g, "\n")
    .trim();
}

function isActiveStatus(status) {
  return (
    status === "active" ||
    status === "in_progress"
  );
}

function getTimestampMillis(value) {
  if (!value) {
    return Date.now();
  }

  if (
    typeof value.toMillis ===
    "function"
  ) {
    return value.toMillis();
  }

  if (
    typeof value.toDate ===
    "function"
  ) {
    return value
      .toDate()
      .getTime();
  }

  if (
    value instanceof Date
  ) {
    return value.getTime();
  }

  if (
    typeof value ===
    "string"
  ) {
    const parsed =
      new Date(value).getTime();

    if (
      !Number.isNaN(parsed)
    ) {
      return parsed;
    }
  }

  if (
    typeof value ===
      "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  return Date.now();
}

function checkAcceptedTextAnswer(
  answer,
  acceptedAnswers,
) {
  const userAnswer =
    normalizeAnswer(answer);

  if (!userAnswer) {
    return false;
  }

  const answers = Array.isArray(
    acceptedAnswers,
  )
    ? acceptedAnswers
    : [];

  return answers.some(
    (accepted) =>
      normalizeAnswer(
        accepted,
      ) === userAnswer,
  );
}

function checkEnumerationAnswer(
  answer,
  acceptedAnswers,
) {
  const expected =
    Array.isArray(
      acceptedAnswers,
    )
      ? acceptedAnswers
          .map((item) =>
            normalizeAnswer(item),
          )
          .filter(Boolean)
      : [];

  const student = String(
    answer ?? "",
  )
    .split(/[\n,]+/)
    .map((item) =>
      normalizeAnswer(item),
    )
    .filter(Boolean);

  if (
    expected.length === 0 ||
    student.length === 0
  ) {
    return false;
  }

  const expectedUnique = [
    ...new Set(expected),
  ].sort();

  const studentUnique = [
    ...new Set(student),
  ].sort();

  if (
    expectedUnique.length !==
    studentUnique.length
  ) {
    return false;
  }

  return expectedUnique.every(
    (item, index) =>
      item ===
      studentUnique[index],
  );
}

function checkCodeAnswer(
  answer,
  acceptedAnswers,
) {
  const userCode =
    normalizeCode(answer);

  if (!userCode) {
    return false;
  }

  const answers = Array.isArray(
    acceptedAnswers,
  )
    ? acceptedAnswers
    : [];

  return answers.some(
    (accepted) =>
      normalizeCode(
        accepted,
      ) === userCode,
  );
}

export default function WeeklyBoss() {
  const router = useRouter();

  const [data, setData] =
    useState(null);

  const [attempt, setAttempt] =
    useState(null);

  const [questions, setQuestions] =
    useState([]);

  const [
    selectedAnswer,
    setSelectedAnswer,
  ] = useState(null);

  const [textAnswer, setTextAnswer] =
    useState("");

  const [feedback, setFeedback] =
    useState(null);

  const [bossState, setBossState] =
    useState("normal");

  const [secondsLeft, setSecondsLeft] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [checking, setChecking] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadBattle() {
      try {
        const weeklyData =
          await loadWeeklyBoss();

        if (cancelled) {
          return;
        }

        if (!weeklyData?.boss) {
          throw new Error(
            "No Weekly Boss is available for your programming language.",
          );
        }

        const userAttempt =
          await loadUserAttempt(
            weeklyData.weekId,
          );

        if (cancelled) {
          return;
        }

        if (
          !userAttempt ||
          !isActiveStatus(
            userAttempt.status,
          )
        ) {
          router.replace(
            "/weeklybossHome",
          );
          return;
        }

        const questionList =
          await loadQuestions(
            weeklyData.boss.id,
            weeklyData.weekId,
          );

        if (
          !questionList.length
        ) {
          throw new Error(
            "There are no questions available for this Weekly Boss. Please ask the administrator to prepare the challenge.",
          );
        }

        const validQuestionIds =
          new Set(
            questionList.map(
              (item) => item.id,
            ),
          );

        const hasMissingQuestion =
          userAttempt.questionIds?.some(
            (id) =>
              !validQuestionIds.has(
                id,
              ),
          );

        if (
          hasMissingQuestion
        ) {
          throw new Error(
            "This battle uses an outdated question set. Please return to the Weekly Boss home and start a new challenge.",
          );
        }

        setData(
          weeklyData,
        );

        setAttempt(
          userAttempt,
        );

        setQuestions(
          questionList,
        );
      } catch (error) {
        console.log(
          "Weekly Boss load error:",
          error,
        );

        if (
          !cancelled
        ) {
          Alert.alert(
            "Boss Battle",
            error.message ||
              "The battle could not be loaded.",
            [
              {
                text: "OK",
                onPress: () =>
                  router.replace(
                    "/weeklybossHome",
                  ),
              },
            ],
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBattle();

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (
      !data ||
      !attempt ||
      !isActiveStatus(
        attempt.status,
      )
    ) {
      return undefined;
    }

    let expired = false;

    const updateTimer = async () => {
      if (expired) {
        return;
      }

      const startedAt =
        getTimestampMillis(
          attempt.startedAt,
        );

      const elapsed =
        Math.floor(
          (Date.now() -
            startedAt) /
            1000,
        );

      const remaining =
        Math.max(
          Number(
            data.boss.timeLimit,
          ) -
            elapsed,
          0,
        );

      setSecondsLeft(
        remaining,
      );

      if (
        remaining <= 0
      ) {
        expired = true;

        const failedAttempt = {
          ...attempt,

          status: "failed",

          completedAt:
            new Date().toISOString(),
        };

        setAttempt(
          failedAttempt,
        );

        try {
          await saveUserAttempt(
            data.weekId,
            failedAttempt,
          );
        } catch (error) {
          console.log(
            "Could not save timer expiration:",
            error,
          );
        }

        router.replace(
          "/weeklybossloose",
        );
      }
    };

    updateTimer();

    const timer =
      setInterval(
        updateTimer,
        1000,
      );

    return () =>
      clearInterval(timer);
  }, [
    attempt,
    data,
    router,
  ]);

  const questionMap =
    useMemo(
      () =>
        new Map(
          questions.map(
            (question) => [
              question.id,
              question,
            ],
          ),
        ),
      [questions],
    );

  const questionIndex =
    Number(
      attempt?.currentQuestionIndex,
    ) || 0;

  const questionIds =
    attempt?.questionIds ||
    [];

  const questionId =
    questionIds.length > 0
      ? questionIds[
          questionIndex %
            questionIds.length
        ]
      : null;

  const question =
    questionId
      ? questionMap.get(
          questionId,
        )
      : null;

  const questionType =
    question?.type ||
    QUESTION_TYPES.MULTIPLE_CHOICE;

  function hasAnswer() {
    if (
      questionType ===
        QUESTION_TYPES.MULTIPLE_CHOICE ||
      questionType ===
        QUESTION_TYPES.TRUE_FALSE
    ) {
      return (
        selectedAnswer !==
        null
      );
    }

    return (
      textAnswer.trim()
        .length > 0
    );
  }

  function isAnswerCorrect() {
    if (!question) {
      return false;
    }

    if (
      questionType ===
      QUESTION_TYPES.MULTIPLE_CHOICE
    ) {
      return (
        Number(
          selectedAnswer,
        ) ===
        Number(
          question.correctAnswer,
        )
      );
    }

    if (
      questionType ===
      QUESTION_TYPES.TRUE_FALSE
    ) {
      return (
        Number(
          selectedAnswer,
        ) ===
        Number(
          question.correctAnswer,
        )
      );
    }

    if (
      questionType ===
      QUESTION_TYPES.ENUMERATION
    ) {
      return checkEnumerationAnswer(
        textAnswer,
        question.answers,
      );
    }

    if (
      questionType ===
      QUESTION_TYPES.FINISH_CODE
    ) {
      return checkCodeAnswer(
        textAnswer,
        question.answers,
      );
    }

    if (
      questionType ===
      QUESTION_TYPES.CODE_OUTPUT
    ) {
      const acceptedAnswers =
        Array.isArray(
          question.answers,
        ) &&
        question.answers.length
          ? question.answers
          : question.expectedOutput
          ? [
              question.expectedOutput,
            ]
          : [];

      return checkCodeAnswer(
        textAnswer,
        acceptedAnswers,
      );
    }

    return checkAcceptedTextAnswer(
      textAnswer,
      question.answers,
    );
  }

  function getCorrectAnswerDisplay() {
    if (!question) {
      return "";
    }

    if (
      questionType ===
        QUESTION_TYPES.MULTIPLE_CHOICE ||
      questionType ===
        QUESTION_TYPES.TRUE_FALSE
    ) {
      return (
        question.options?.[
          Number(
            question.correctAnswer,
          )
        ] || ""
      );
    }

    if (
      questionType ===
      QUESTION_TYPES.ENUMERATION
    ) {
      return Array.isArray(
        question.answers,
      )
        ? question.answers.join(
            ", ",
          )
        : "";
    }

    if (
      questionType ===
      QUESTION_TYPES.CODE_OUTPUT
    ) {
      return (
        question.expectedOutput ||
        question.answers?.[0] ||
        ""
      );
    }

    return Array.isArray(
      question.answers,
    )
      ? question.answers[0] ||
          ""
      : "";
  }

  async function checkAnswer() {
    if (
      checking ||
      !hasAnswer() ||
      !question ||
      feedback ||
      !attempt ||
      !data
    ) {
      return;
    }

    setChecking(true);

    try {
      const correct =
        isAnswerCorrect();

      const currentCombo =
        Number(
          attempt.combo,
        ) || 0;

      const currentLives =
        Number(
          attempt.lives,
        ) || 0;

      const currentHP =
        Number(
          attempt.currentHP ??
            attempt.bossHP ??
            data.boss.maxHP,
        ) || 0;

      const currentHighestCombo =
        Number(
          attempt.highestCombo,
        ) || 0;

      const nextCombo =
        correct
          ? currentCombo + 1
          : 0;

      const damage =
        correct
          ? Math.min(
              10 +
                currentCombo *
                  5,
              40,
            )
          : 0;

      const nextHP =
        Math.max(
          currentHP -
            damage,
          0,
        );

      const nextLives =
        correct
          ? currentLives
          : Math.max(
              currentLives -
                1,
              0,
            );

      const nextStatus =
        nextHP === 0
          ? "completed"
          : nextLives === 0
          ? "failed"
          : "active";

      const nextAttempt = {
        ...attempt,

        currentHP:
          nextHP,

        bossHP:
          nextHP,

        lives:
          nextLives,

        combo:
          nextCombo,

        highestCombo:
          Math.max(
            currentHighestCombo,
            nextCombo,
          ),

        currentQuestionIndex:
          questionIndex + 1,

        status:
          nextStatus,

        completedAt:
          nextStatus ===
          "active"
            ? null
            : new Date().toISOString(),
      };

      setFeedback({
        correct,

        damage,

        answer:
          getCorrectAnswerDisplay(),

        explanation:
          question.explanation ||
          "",
      });

      setBossState(
        correct
          ? "hurt"
          : "attack",
      );

      setAttempt(
        nextAttempt,
      );

      await saveUserAttempt(
        data.weekId,
        nextAttempt,
      );
    } catch (error) {
      console.log(
        "Save answer error:",
        error,
      );

      Alert.alert(
        "Save Failed",
        error.message ||
          "Your answer could not be saved.",
      );
    } finally {
      setChecking(false);
    }
  }

  function continueBattle() {
    if (
      attempt.status ===
      "completed"
    ) {
      router.replace(
        "/weeklybosswin",
      );
      return;
    }

    if (
      attempt.status ===
      "failed"
    ) {
      router.replace(
        "/weeklybossloose",
      );
      return;
    }

    setSelectedAnswer(
      null,
    );

    setTextAnswer("");

    setFeedback(
      null,
    );

    setBossState(
      "normal",
    );
  }

  function renderQuestionInput() {
    if (!question) {
      return null;
    }

    if (
      questionType ===
      QUESTION_TYPES.MULTIPLE_CHOICE
    ) {
      return (
        <View>
          {(
            question.options ||
            []
          ).map(
            (
              option,
              index,
            ) => (
              <Pressable
                key={`${question.id}-${index}`}
                disabled={
                  Boolean(
                    feedback,
                  )
                }
                onPress={() =>
                  setSelectedAnswer(
                    index,
                  )
                }
                style={[
                  styles.option,

                  selectedAnswer ===
                    index &&
                    styles.optionSelected,

                  feedback &&
                    index ===
                      Number(
                        question.correctAnswer,
                      ) &&
                    styles.optionCorrect,

                  feedback &&
                    selectedAnswer ===
                      index &&
                    Number(
                      selectedAnswer,
                    ) !==
                      Number(
                        question.correctAnswer,
                      ) &&
                    styles.optionWrong,
                ]}
              >
                <Text
                  style={
                    styles.radio
                  }
                >
                  {selectedAnswer ===
                  index
                    ? "●"
                    : "○"}
                </Text>

                <Text
                  style={
                    styles.optionText
                  }
                >
                  {option}
                </Text>
              </Pressable>
            ),
          )}
        </View>
      );
    }

    if (
      questionType ===
      QUESTION_TYPES.TRUE_FALSE
    ) {
      return (
        <View
          style={
            styles.trueFalseRow
          }
        >
          {[
            "True",
            "False",
          ].map(
            (
              option,
              index,
            ) => (
              <Pressable
                key={option}
                disabled={
                  Boolean(
                    feedback,
                  )
                }
                onPress={() =>
                  setSelectedAnswer(
                    index,
                  )
                }
                style={[
                  styles.trueFalseButton,

                  selectedAnswer ===
                    index &&
                    styles.trueFalseSelected,

                  feedback &&
                    index ===
                      Number(
                        question.correctAnswer,
                      ) &&
                    styles.optionCorrect,

                  feedback &&
                    selectedAnswer ===
                      index &&
                    Number(
                      selectedAnswer,
                    ) !==
                      Number(
                        question.correctAnswer,
                      ) &&
                    styles.optionWrong,
                ]}
              >
                <Text
                  style={[
                    styles.trueFalseText,

                    selectedAnswer ===
                      index &&
                      styles.trueFalseTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            ),
          )}
        </View>
      );
    }

    let placeholder =
      "Type your answer...";

    if (
      questionType ===
      QUESTION_TYPES.IDENTIFICATION
    ) {
      placeholder =
        "Type your answer...";
    } else if (
      questionType ===
      QUESTION_TYPES.ENUMERATION
    ) {
      placeholder =
        "Enter answers separated by commas...";
    } else if (
      questionType ===
      QUESTION_TYPES.FILL_BLANK
    ) {
      placeholder =
        "Fill in the blank...";
    } else if (
      questionType ===
      QUESTION_TYPES.FINISH_CODE
    ) {
      placeholder =
        "Enter the missing code...";
    } else if (
      questionType ===
      QUESTION_TYPES.CODE_OUTPUT
    ) {
      placeholder =
        "Enter the expected output...";
    }

    const isCodeQuestion =
      questionType ===
        QUESTION_TYPES.FINISH_CODE ||
      questionType ===
        QUESTION_TYPES.CODE_OUTPUT;

    return (
      <TextInput
        style={[
          styles.answerInput,
          isCodeQuestion &&
            styles.codeAnswerInput,
        ]}
        value={
          textAnswer
        }
        onChangeText={
          setTextAnswer
        }
        placeholder={
          placeholder
        }
        placeholderTextColor="#999999"
        multiline={
          questionType ===
            QUESTION_TYPES.ENUMERATION ||
          questionType ===
            QUESTION_TYPES.FINISH_CODE ||
          questionType ===
            QUESTION_TYPES.CODE_OUTPUT
        }
        autoCapitalize="none"
        autoCorrect={false}
        editable={!feedback}
      />
    );
  }

  function getQuestionTypeLabel() {
    const labels = {
      [QUESTION_TYPES.MULTIPLE_CHOICE]:
        "MULTIPLE CHOICE",

      [QUESTION_TYPES.IDENTIFICATION]:
        "IDENTIFICATION",

      [QUESTION_TYPES.ENUMERATION]:
        "ENUMERATION",

      [QUESTION_TYPES.FILL_BLANK]:
        "FILL IN THE BLANK",

      [QUESTION_TYPES.FINISH_CODE]:
        "FINISH THE CODE",

      [QUESTION_TYPES.CODE_OUTPUT]:
        "PREDICT THE OUTPUT",

      [QUESTION_TYPES.TRUE_FALSE]:
        "TRUE OR FALSE",
    };

    return (
      labels[
        questionType
      ] ||
      "QUESTION"
    );
  }

  if (
    loading ||
    !data ||
    !attempt
  ) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color={PURPLE}
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading boss battle...
        </Text>
      </View>
    );
  }

  if (!question) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <Text
          style={
            styles.errorTitle
          }
        >
          Question unavailable
        </Text>

        <Text
          style={
            styles.errorText
          }
        >
          This battle's question set
          could not be loaded.
        </Text>

        <TouchableOpacity
          style={
            styles.errorButton
          }
          onPress={() =>
            router.replace(
              "/weeklybossHome",
            )
          }
        >
          <Text
            style={
              styles.errorButtonText
            }
          >
            BACK TO WEEKLY BOSS
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const maxHP =
    Number(
      data.boss.maxHP,
    ) || 100;

  const currentHP =
    Math.max(
      Number(
        attempt.currentHP ??
          attempt.bossHP,
      ) || 0,
      0,
    );

  const hpPercent =
    Math.min(
      Math.max(
        (
          currentHP /
          maxHP
        ) * 100,
        0,
      ),
      100,
    );

  const totalQuestions =
    questionIds.length ||
    10;

  const displayQuestionNumber =
    Math.min(
      questionIndex + 1,
      totalQuestions,
    );

  const buttonDisabled =
    checking ||
    (!feedback &&
      !hasAnswer());

  return (
    <SafeAreaView
      style={
        styles.container
      }
    >
      <KeyboardAvoidingView
        style={
          styles.keyboardContainer
        }
        behavior={
          Platform.OS ===
          "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={
              styles.header
            }
          >
            <TouchableOpacity
              style={
                styles.backButton
              }
              onPress={() =>
                router.back()
              }
              accessibilityLabel="Exit battle"
            >
              <ArrowBlack
                width={22}
                height={22}
              />
            </TouchableOpacity>

            <Text
              style={
                styles.headerTitle
              }
            >
              BOSS BATTLE
            </Text>

            <View
              style={
                styles.timerContainer
              }
            >
              <TimerIcon
                width={20}
                height={20}
              />

              <Text
                style={
                  styles.timer
                }
              >
                {formatTime(
                  secondsLeft,
                )}
              </Text>
            </View>
          </View>

          <View
            style={
              styles.bossContainer
            }
          >
            <Image
              source={
                bossArtByState[
                  bossState
                ]
              }
              style={
                styles.bossImage
              }
            />
          </View>

          <View
            style={
              styles.bossCard
            }
          >
            <View
              style={
                styles.bossNameRow
              }
            >
              <Text
                style={
                  styles.bossName
                }
              >
                {data.boss.name.toUpperCase()}
              </Text>

              <Text
                style={
                  styles.hpValueText
                }
              >
                {currentHP} /{" "}
                {maxHP} HP
              </Text>
            </View>

            <View
              style={
                styles.hpRow
              }
            >
              <View
                style={
                  styles.hpBarBg
                }
              >
                <View
                  style={[
                    styles.hpBarFill,
                    {
                      width: `${hpPercent}%`,
                    },
                  ]}
                />
              </View>

              <HeartIcon
                width={30}
                height={30}
                style={
                  styles.heart
                }
              />
            </View>
          </View>

          <View
            style={
              styles.card
            }
          >
            <View
              style={
                styles.questionHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.questionNumber
                  }
                >
                  Question{" "}
                  {
                    displayQuestionNumber
                  }
                  /{totalQuestions}
                </Text>

                <Text
                  style={
                    styles.questionType
                  }
                >
                  {
                    getQuestionTypeLabel()
                  }
                </Text>
              </View>

              <View
                style={
                  styles.questionHearts
                }
              >
                {[0, 1, 2].map(
                  (
                    heart,
                  ) =>
                    heart <
                    attempt.lives ? (
                      <HeartIcon
                        key={
                          heart
                        }
                        width={
                          30
                        }
                        height={
                          30
                        }
                        style={
                          styles.heartOn
                        }
                      />
                    ) : (
                      <HeartBrokenIcon
                        key={
                          heart
                        }
                        width={
                          30
                        }
                        height={
                          30
                        }
                        style={
                          styles.heartOn
                        }
                      />
                    ),
                )}
              </View>
            </View>

            <Text
              style={
                styles.questionPrompt
              }
            >
              {
                question.question
              }
            </Text>

            {question.code ? (
              <Text
                style={
                  styles.codeBox
                }
              >
                {
                  question.code
                }
              </Text>
            ) : null}

            {renderQuestionInput()}

            {feedback && (
              <View
                style={
                  styles.feedbackBox
                }
              >
                <Text
                  style={
                    feedback.correct
                      ? styles.correctText
                      : styles.wrongText
                  }
                >
                  {feedback.correct
                    ? `✓ CORRECT! -${feedback.damage} HP`
                    : "✕ WRONG"}
                </Text>

                {!feedback.correct &&
                  feedback.answer && (
                    <Text
                      style={
                        styles.correctAnswerText
                      }
                    >
                      Correct answer:{" "}
                      {
                        feedback.answer
                      }
                    </Text>
                  )}

                {feedback.explanation ? (
                  <Text
                    style={
                      styles.explanationText
                    }
                  >
                    {
                      feedback.explanation
                    }
                  </Text>
                ) : null}
              </View>
            )}
          </View>

          <View
            style={
              styles.primaryButtonBase
            }
          >
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed &&
                  styles.primaryButtonPressed,
                buttonDisabled &&
                  styles.primaryButtonDisabled,
              ]}
              onPress={
                feedback
                  ? continueBattle
                  : checkAnswer
              }
              disabled={
                buttonDisabled
              }
            >
              <Text
                style={
                  styles.primaryButtonText
                }
              >
                {checking
                  ? "CHECKING..."
                  : feedback
                  ? isActiveStatus(
                      attempt.status,
                    )
                    ? "CONTINUE"
                    : "SEE RESULTS"
                  : "CHECK"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#FFFFFF",
    },

    keyboardContainer: {
      flex: 1,
    },

    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 10,
      paddingBottom: 30,
      alignItems:
        "center",
    },

    loadingContainer: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
      backgroundColor:
        "#FFFFFF",
      padding: 24,
    },

    loadingText: {
      marginTop: 12,
      fontFamily:
        "Nunito_600SemiBold",
      fontSize: 15,
      color: "#6C7278",
      textAlign:
        "center",
    },

    errorTitle: {
      fontFamily:
        "Nunito_900Black",
      fontSize: 22,
      color: "#202020",
      textAlign:
        "center",
    },

    errorText: {
      marginTop: 8,
      fontFamily:
        "Nunito_600SemiBold",
      fontSize: 14,
      color: "#6C7278",
      textAlign:
        "center",
      lineHeight: 20,
    },

    errorButton: {
      marginTop: 20,
      minHeight: 50,
      paddingHorizontal: 20,
      borderRadius: 10,
      backgroundColor:
        "#A72BFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    errorButtonText: {
      color: "#FFFFFF",
      fontFamily:
        "Nunito_900Black",
      fontSize: 13,
    },

    header: {
      width: "100%",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      paddingVertical: 14,
    },

    backButton: {
      padding: 4,
    },

    headerTitle: {
      fontFamily:
        "Nunito_900Black",
      fontSize: 16,
      color: "#000000",
      letterSpacing: 0.5,
    },

    timerContainer: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 6,
    },

    timer: {
      fontFamily:
        "Nunito_700Bold",
      fontSize: 18,
      color: "#000000",
    },

    bossContainer: {
      alignItems:
        "center",
      marginBottom: 8,
    },

    bossImage: {
      width: 200,
      height: 200,
      resizeMode:
        "contain",
    },

    bossCard: {
      width: "100%",
      borderRadius: 16,
      padding: 16,
      backgroundColor:
        "#FFFFFF",
      marginBottom: 14,
    },

    card: {
      width: "100%",
      borderWidth: 3,
      borderColor:
        "#E5E5E5",
      borderRadius: 16,
      padding: 16,
      backgroundColor:
        "#FFFFFF",
      marginBottom: 14,
    },

    bossNameRow: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      marginBottom: 8,
    },

    bossName: {
      fontFamily:
        "Nunito_900Black",
      fontSize: 15,
      color: "#AF32FF",
    },

    hpValueText: {
      fontFamily:
        "Nunito_700Bold",
      fontSize: 15,
      color: "#6C7278",
    },

    hpRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    hpBarBg: {
      flex: 1,
      height: 14,
      backgroundColor:
        "#E8E8E8",
      borderRadius: 8,
      overflow:
        "hidden",
      marginRight: 10,
    },

    hpBarFill: {
      height: "100%",
      backgroundColor:
        "#24B874",
      borderRadius: 8,
    },

    heart: {
      width: 30,
      height: 30,
    },

    questionHeader: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
    },

    questionNumber: {
      fontFamily:
        "Nunito_500Medium",
      fontSize: 15,
      color: "#8E8E93",
    },

    questionType: {
      fontFamily:
        "Nunito_900Black",
      fontSize: 10,
      color: "#A72BFF",
      marginTop: 3,
      letterSpacing: 0.4,
    },

    questionHearts: {
      flexDirection:
        "row",
      gap: 3,
    },

    heartOn: {
      opacity: 1,
    },

    questionPrompt: {
      fontFamily:
        "Nunito_900Black",
      fontSize: 16,
      color: "#000000",
      marginTop: 10,
      lineHeight: 22,
    },

    codeBox: {
      width: "100%",
      borderWidth: 1,
      borderColor:
        "#DDDDDD",
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 14,
      color: "#000000",
      fontFamily:
        "monospace",
      fontSize: 15,
      marginTop: 10,
      marginBottom: 8,
      backgroundColor:
        "#F7F7F7",
    },

    option: {
      minHeight: 48,
      borderWidth: 3,
      borderColor:
        "#E0E0E0",
      borderRadius: 10,
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingHorizontal: 12,
      marginTop: 8,
    },

    optionSelected: {
      borderColor:
        "#AF32FF",
      backgroundColor:
        "#EFD5FF",
    },

    optionCorrect: {
      borderColor:
        "#338B33",
      backgroundColor:
        "#EBF9EC",
    },

    optionWrong: {
      borderColor:
        "#CD101A",
      backgroundColor:
        "#FDEFF1",
    },

    radio: {
      width: 26,
      color: PURPLE,
      fontSize: 20,
    },

    optionText: {
      flex: 1,
      fontFamily:
        "Nunito_700Bold",
      fontSize: 12,
      color: "#111111",
    },

    trueFalseRow: {
      flexDirection:
        "row",
      gap: 10,
      marginTop: 10,
    },

    trueFalseButton: {
      flex: 1,
      minHeight: 50,
      borderWidth: 3,
      borderColor:
        "#E0E0E0",
      borderRadius: 10,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    trueFalseSelected: {
      borderColor:
        "#AF32FF",
      backgroundColor:
        "#EFD5FF",
    },

    trueFalseText: {
      fontFamily:
        "Nunito_800ExtraBold",
      fontSize: 14,
      color: "#444444",
    },

    trueFalseTextSelected: {
      color: "#AF32FF",
    },

    answerInput: {
      width: "100%",
      minHeight: 52,
      borderWidth: 2,
      borderColor:
        "#DDDDDD",
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginTop: 10,
      color: "#111111",
      fontFamily:
        "Nunito_600SemiBold",
      fontSize: 14,
      textAlignVertical:
        "top",
      backgroundColor:
        "#FFFFFF",
    },

    codeAnswerInput: {
      minHeight: 110,
      fontFamily:
        "monospace",
      backgroundColor:
        "#F7F7F7",
    },

    feedbackBox: {
      marginTop: 12,
      paddingTop: 2,
    },

    correctText: {
      fontFamily:
        "Nunito_900Black",
      fontSize: 12,
      color: "#299C50",
    },

    wrongText: {
      fontFamily:
        "Nunito_900Black",
      fontSize: 12,
      color: "#D23845",
    },

    correctAnswerText: {
      fontFamily:
        "Nunito_700Bold",
      fontSize: 12,
      color: "#444444",
      marginTop: 6,
    },

    explanationText: {
      fontFamily:
        "Nunito_600SemiBold",
      fontSize: 12,
      color: "#666666",
      marginTop: 7,
      lineHeight: 18,
    },

    primaryButtonBase: {
      width: "100%",
      height: 60,
      backgroundColor:
        "#7200B8",
      borderRadius: 16,
      justifyContent:
        "flex-end",
      overflow:
        "hidden",
      marginTop: 6,
    },

    primaryButton: {
      width: "100%",
      height: 54,
      backgroundColor:
        "#B42CFF",
      borderRadius: 16,
      justifyContent:
        "center",
      alignItems:
        "center",
      transform: [
        {
          translateY: -6,
        },
      ],
    },

    primaryButtonPressed: {
      backgroundColor:
        "#9D20E8",
      transform: [
        {
          translateY: 0,
        },
      ],
    },

    primaryButtonDisabled: {
      opacity: 0.6,
    },

    primaryButtonText: {
      fontFamily:
        "Nunito_900Black",
      color: "#FFFFFF",
      fontSize: 20,
    },
  });


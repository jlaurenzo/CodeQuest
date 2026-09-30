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
import HeartIcon from "../../assets/icons/heart.svg";
import startYellow from "../../assets/icons/start-yellow.png";
import bossSlayerAward from "../../assets/images/awards/boss-slayer.png";
import bossImage from "../../assets/images/bosses/boss-image.png";

import BottomNav from "../components/BottomNav";

import {
  loadQuestions,
  loadUserAttempt,
  loadWeeklyBoss,
  resetWeeklyBossAttempt,
  startUserAttempt,
} from "../services/weeklyBossService";

function getNextMonday() {
  const nextMonday = new Date();

  nextMonday.setHours(
    0,
    0,
    0,
    0,
  );

  const daysUntilMonday =
    (8 - nextMonday.getDay()) % 7 || 7;

  nextMonday.setDate(
    nextMonday.getDate() +
      daysUntilMonday,
  );

  return nextMonday;
}

function formatCountdown(
  totalSeconds,
) {
  const days = Math.floor(
    totalSeconds / 86400,
  );

  const hours = Math.floor(
    (totalSeconds % 86400) / 3600,
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60,
  );

  const seconds =
    totalSeconds % 60;

  return `${days}d ${String(
    hours,
  ).padStart(
    2,
    "0",
  )}h ${String(
    minutes,
  ).padStart(
    2,
    "0",
  )}m ${String(
    seconds,
  ).padStart(
    2,
    "0",
  )}s`;
}

export default function WeeklyBossHome() {
  const router = useRouter();

  const [data, setData] =
    useState(null);

  const [attempt, setAttempt] =
    useState(null);

  const [questions, setQuestions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [starting, setStarting] =
    useState(false);

  const [
    nextBossSeconds,
    setNextBossSeconds,
  ] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const weeklyData =
          await loadWeeklyBoss();

        const existingAttempt =
          await loadUserAttempt(
            weeklyData.weekId,
          );

        if (!weeklyData?.boss) {
          setData(
            weeklyData,
          );

          setAttempt(
            existingAttempt,
          );

          setQuestions([]);

          return;
        }

        /*
         * IMPORTANT:
         * Questions are now loaded using
         * BOTH boss ID and week ID.
         *
         * This prevents old questions from
         * returning when the same boss is
         * reused in another week.
         */
        const questionList =
          await loadQuestions(
            weeklyData.boss.id,
            weeklyData.weekId,
          );

        setData(
          weeklyData,
        );

        setAttempt(
          existingAttempt,
        );

        setQuestions(
          questionList,
        );

        console.log(
          "Weekly Boss:",
          weeklyData.boss.name,
        );

        console.log(
          "Week:",
          weeklyData.weekId,
        );

        console.log(
          "Language:",
          weeklyData.language,
        );

        console.log(
          "Questions:",
          questionList.length,
        );
      } catch (error) {
        console.log(
          "Error loading weekly boss home:",
          error,
        );

        Alert.alert(
          "Error",
          error.message ||
            "Could not load the weekly boss challenge.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (
      attempt?.status !==
        "completed" &&
      attempt?.status !==
        "failed"
    ) {
      return undefined;
    }

    const nextMonday =
      getNextMonday();

    const updateCountdown =
      () => {
        const remaining =
          Math.max(
            0,
            Math.ceil(
              (
                nextMonday.getTime() -
                Date.now()
              ) /
                1000,
            ),
          );

        setNextBossSeconds(
          remaining,
        );
      };

    updateCountdown();

    const countdown =
      setInterval(
        updateCountdown,
        1000,
      );

    return () =>
      clearInterval(
        countdown,
      );
  }, [attempt?.status]);

  const handleStartBattle =
    async () => {
      if (!data) {
        return;
      }

      if (
        attempt?.status ===
        "completed"
      ) {
        Alert.alert(
          "Challenge Completed",
          "You have already defeated this week's boss! Come back next week.",
        );

        return;
      }

      if (
        attempt?.status ===
        "failed"
      ) {
        Alert.alert(
          "Challenge Failed",
          "You have already attempted this week's challenge. Come back next week!",
        );

        return;
      }

      if (!questions.length) {
        Alert.alert(
          "No Questions Available",
          `The ${data.boss.name} challenge has not been prepared for this week yet.`,
        );

        return;
      }

      try {
        setStarting(true);

        if (!attempt) {
          await startUserAttempt(
            data.weekId,
            data.boss,
            questions,
          );
        }

        router.push(
          "/weeklyboss",
        );
      } catch (error) {
        console.log(
          "Error starting battle:",
          error,
        );

        Alert.alert(
          "Error",
          error.message ||
            "Failed to start the battle.",
        );
      } finally {
        setStarting(false);
      }
    };

  const handleResetWeeklyBoss =
    () => {
      if (!data?.weekId) {
        Alert.alert(
          "Reset Failed",
          "The current week could not be determined.",
        );

        return;
      }

      Alert.alert(
        "Reset Weekly Boss",
        `This will delete only your ${data.weekId} Weekly Boss attempt. Your boss, questions, rewards, and weekly configuration will stay unchanged.`,
        [
          {
            text: "CANCEL",
            style: "cancel",
          },
          {
            text: "RESET",
            style: "destructive",
            onPress: async () => {
              try {
                await resetWeeklyBossAttempt(
                  data.weekId,
                );

                setAttempt(null);

                setNextBossSeconds(
                  0,
                );

                Alert.alert(
                  "Reset Complete",
                  "Your Weekly Boss attempt has been reset. You can start the battle again.",
                );
              } catch (error) {
                console.log(
                  "Reset Weekly Boss error:",
                  error,
                );

                Alert.alert(
                  "Reset Failed",
                  error.message ||
                    "Unable to reset your Weekly Boss attempt.",
                );
              }
            },
          },
        ],
      );
    };

  if (loading) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color="#A72BFF"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading Weekly Boss...
        </Text>
      </View>
    );
  }

  const boss =
    data?.boss || {
      name: "Bug King",
      maxHP: 100,
      rewardXP: 100,
      badge: "Bug Slayer",
      description:
        "Find the mistake before the bugs take over.",
    };

  const currentHP =
    attempt?.bossHP !==
      undefined
      ? attempt.bossHP
      : boss.maxHP ||
        100;

  const maxHP =
    boss.maxHP || 100;

  const hpPercent =
    Math.min(
      Math.max(
        (currentHP /
          maxHP) *
          100,
        0,
      ),
      100,
    );

  const getButtonText =
    () => {
      if (starting) {
        return "PREPARING...";
      }

      if (
        attempt?.status ===
        "in_progress"
      ) {
        return "CONTINUE BATTLE";
      }

      if (
        attempt?.status ===
        "completed"
      ) {
        return "COMPLETED!";
      }

      if (
        attempt?.status ===
        "failed"
      ) {
        return "YOU FAILED!";
      }

      return "START BATTLE";
    };

  const isDisabled =
    starting ||
    attempt?.status ===
      "completed" ||
    attempt?.status ===
      "failed";

  return (
    <SafeAreaView
      style={
        styles.container
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
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
            accessibilityLabel="Go back"
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
            WEEKLY BOSS CHALLENGE
          </Text>

          <View
            style={{
              width: 22,
            }}
          />
        </View>

        <View
          style={
            styles.titleContainer
          }
        >
          <Text
            style={
              styles.defeatText
            }
          >
            DEFEAT THE
          </Text>

          <Text
            style={
              styles.bossNameTitle
            }
          >
            {(
              boss.name ||
              "BUG KING"
            ).toUpperCase()}
          </Text>
        </View>

        <View
          style={
            styles.bossContainer
          }
        >
          <Image
            source={bossImage}
            style={
              styles.bossImage
            }
          />

          <View
            style={
              styles.speechBubble
            }
          >
            <Text
              style={
                styles.speechText
              }
            >
              {boss.description ||
                "I will fill your code with errors!"}
            </Text>
          </View>
        </View>

        <View
          style={
            styles.card
          }
        >
          <Text
            style={
              styles.cardHeader
            }
          >
            BOSS HP
          </Text>

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

              <Text
                style={
                  styles.hpText
                }
              >
                {currentHP} HP
              </Text>
            </View>

            <HeartIcon
              width={24}
              height={22}
              style={
                styles.heartIcon
              }
            />
          </View>
        </View>

        <View
          style={
            styles.card
          }
        >
          <Text
            style={
              styles.cardHeader
            }
          >
            REWARDS
          </Text>

          <View
            style={
              styles.rewardsRow
            }
          >
            <View
              style={
                styles.rewardItem
              }
            >
              <Image
                source={
                  startYellow
                }
                style={
                  styles.rewardXpIcon
                }
              />

              <Text
                style={
                  styles.rewardText
                }
              >
                {boss.rewardXP ||
                  100}{" "}
                XP
              </Text>
            </View>

            <View
              style={
                styles.rewardItem
              }
            >
              <Image
                source={
                  bossSlayerAward
                }
                style={
                  styles.badgeImage
                }
              />

              <Text
                style={
                  styles.rewardText
                }
              >
                {boss.badge ||
                  "Boss Badge"}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={
            styles.challengeInfo
          }
        >
          <Text
            style={
              styles.challengeInfoText
            }
          >
            {data?.language
              ? `${data.language} challenge`
              : "Programming challenge"}
          </Text>

          <Text
            style={
              styles.challengeInfoText
            }
          >
            {data?.weekId ||
              ""}
          </Text>
        </View>

        <View
          style={
            styles.questionInfo
          }
        >
          <Text
            style={
              styles.questionInfoText
            }
          >
            {questions.length}{" "}
            questions available
          </Text>
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
              isDisabled &&
                styles.primaryButtonDisabled,
            ]}
            onPress={
              handleStartBattle
            }
            disabled={
              isDisabled
            }
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              {getButtonText()}
            </Text>
          </Pressable>
        </View>

        {/* TESTING RESET */}

        <View
          style={
            styles.testingCard
          }
        >
          <Text
            style={
              styles.testingTitle
            }
          >
            TESTING ONLY
          </Text>

          <Text
            style={
              styles.testingDescription
            }
          >
            Reset your current Weekly Boss
            attempt after losing or completing
            the challenge. This does not delete
            the boss or questions.
          </Text>

          <TouchableOpacity
            style={
              styles.resetButton
            }
            onPress={
              handleResetWeeklyBoss
            }
          >
            <Text
              style={
                styles.resetButtonText
              }
            >
              RESET WEEKLY BOSS FOR TESTING
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNav />

      {(
        attempt?.status ===
          "completed" ||
        attempt?.status ===
          "failed"
      ) && (
        <View
          style={
            styles.nextBossOverlay
          }
        >
          <View
            style={
              styles.nextBossPanel
            }
          >
            <Text
              style={
                styles.nextBossTitle
              }
            >
              NEXT BOSS!
            </Text>

            <Text
              style={
                styles.nextBossSubtitle
              }
            >
              The next challenge opens
              on Monday
            </Text>

            <Text
              style={
                styles.nextBossCountdown
              }
            >
              {formatCountdown(
                nextBossSeconds,
              )}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      "#FFFFFF",
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 150,
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
  },

  loadingText: {
    marginTop: 12,
    fontFamily:
      "Nunito_600SemiBold",
    fontSize: 15,
    color: "#6C7278",
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

  titleContainer: {
    alignItems:
      "center",
    marginTop: "7%",
    marginBottom: 10,
  },

  defeatText: {
    fontFamily:
      "Nunito_900Black",
    fontSize: 25,
    color: "#000000",
    fontWeight: "900",
    textAlign:
      "center",
  },

  bossNameTitle: {
    fontFamily:
      "Nunito_900Black",
    fontSize: 60,
    color: "#A72BFF",
    fontWeight: "900",
    textAlign:
      "center",
    marginTop: -4,
  },

  bossContainer: {
    alignItems:
      "center",
    marginBottom: 16,
  },

  bossImage: {
    marginTop:
      "-12%",
    width: 235,
    height: 235,
    resizeMode:
      "contain",
  },

  speechBubble: {
    backgroundColor:
      "#EBEBEB",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
    maxWidth: 260,
  },

  speechText: {
    fontFamily:
      "Nunito_700Bold",
    fontWeight: "700",
    fontSize: 13,
    color: "#000000",
    textAlign:
      "center",
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

  cardHeader: {
    fontFamily:
      "Nunito_900Black",
    fontSize: 15,
    color: "#4A4A4A",
    fontWeight: "900",
    marginBottom: 10,
  },

  hpRow: {
    flexDirection:
      "row",
    alignItems:
      "center",
  },

  hpBarBg: {
    flex: 1,
    height: 18,
    backgroundColor:
      "#E8E8E8",
    borderRadius: 9,
    overflow:
      "hidden",
    marginRight: 10,
    justifyContent:
      "center",
  },

  hpBarFill: {
    height: "100%",
    backgroundColor:
      "#22C55E",
    borderRadius: 9,
  },

  hpText: {
    position:
      "absolute",
    alignSelf:
      "center",
    fontFamily:
      "Nunito_800ExtraBold",
    fontSize: 11,
    color: "#FFFFFF",
  },

  heartIcon: {
    marginLeft: 2,
  },

  rewardsRow: {
    flexDirection:
      "row",
    justifyContent:
      "space-around",
    alignItems:
      "center",
    paddingVertical: 4,
  },

  rewardItem: {
    alignItems:
      "center",
  },

  rewardXpIcon: {
    width: 22,
    height: 24,
    resizeMode:
      "contain",
  },

  rewardText: {
    fontFamily:
      "Nunito_700Bold",
    fontSize: 14,
    color: "#211426",
    marginTop: 6,
  },

  badgeImage: {
    width: 28,
    height: 28,
    resizeMode:
      "contain",
  },

  challengeInfo: {
    width: "100%",
    flexDirection:
      "row",
    justifyContent:
      "space-between",
    marginBottom: 8,
  },

  challengeInfoText: {
    fontFamily:
      "Nunito_600SemiBold",
    fontSize: 12,
    color: "#8E8E93",
  },

  questionInfo: {
    width: "100%",
    alignItems:
      "center",
    marginBottom: 10,
  },

  questionInfoText: {
    fontFamily:
      "Nunito_700Bold",
    fontSize: 12,
    color: "#6C7278",
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
    marginTop: 10,
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
    backgroundColor:
      "#9D20E8",
  },

  primaryButtonText: {
    fontFamily:
      "Nunito_900Black",
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },

  testingCard: {
    width: "100%",
    marginTop: 24,
    borderWidth: 1,
    borderColor:
      "#E1E1E1",
    borderRadius: 14,
    padding: 15,
    backgroundColor:
      "#FAFAFA",
  },

  testingTitle: {
    fontFamily:
      "Nunito_900Black",
    fontSize: 11,
    color: "#666666",
  },

  testingDescription: {
    fontFamily:
      "Nunito_600SemiBold",
    fontSize: 11,
    color: "#888888",
    lineHeight: 17,
    marginTop: 5,
    marginBottom: 12,
  },

  resetButton: {
    width: "100%",
    minHeight: 48,
    borderWidth: 2,
    borderColor:
      "#D71920",
    borderRadius: 10,
    backgroundColor:
      "#FFF7F7",
    alignItems:
      "center",
    justifyContent:
      "center",
    paddingHorizontal: 10,
  },

  resetButtonText: {
    fontFamily:
      "Nunito_900Black",
    fontSize: 11,
    color: "#D71920",
    textAlign:
      "center",
  },

  nextBossOverlay: {
    ...StyleSheet.absoluteFillObject,
    bottom: 82,
    backgroundColor:
      "#FFFFFF",
    alignItems:
      "center",
    justifyContent:
      "center",
    paddingHorizontal: 24,
    zIndex: 20,
    elevation: 20,
  },

  nextBossPanel: {
    width: "100%",
    maxWidth: 340,
    alignItems:
      "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor:
      "#FFFFFF",
  },

  nextBossTitle: {
    fontFamily:
      "Nunito_900Black",
    fontSize: 32,
    color: "#A72BFF",
    textAlign:
      "center",
  },

  nextBossSubtitle: {
    marginTop: 10,
    fontFamily:
      "Nunito_600SemiBold",
    fontSize: 15,
    color: "#6C7278",
    textAlign:
      "center",
  },

  nextBossCountdown: {
    marginTop: 18,
    fontFamily:
      "Nunito_900Black",
    fontSize: 26,
    color: "#211426",
    textAlign:
      "center",
  },
});


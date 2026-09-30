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
import RibbonImage from "../../assets/icons/ribbon.svg";
import startYellow from "../../assets/icons/start-yellow.png";
import bossSlayerAward from "../../assets/images/awards/boss-slayer.png";
import bossDefeated from "../../assets/images/bosses/boss-defeated.png";

import {
  awardWeeklyBossXp,
  loadUserAttempt,
  loadWeeklyBoss,
} from "../services/weeklyBossService";

export default function WeeklyBossWin() {
  const router = useRouter();

  const [data, setData] =
    useState(null);

  const [attempt, setAttempt] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadVictoryData() {
      try {
        const weeklyData =
          await loadWeeklyBoss();

        const userAttempt =
          await loadUserAttempt(
            weeklyData.weekId,
          );

        setData(
          weeklyData,
        );

        setAttempt(
          userAttempt,
        );

        /*
         * awardWeeklyBossXp is safe to call
         * more than once because the service
         * checks xpAwarded inside a transaction.
         */
        if (
          userAttempt?.status ===
          "completed"
        ) {
          const xpResult =
            await awardWeeklyBossXp(
              weeklyData.weekId,
              weeklyData.boss.rewardXP,
            );

          /*
           * Keep the existing streak flow.
           */
          if (
            xpResult?.firstXpToday
          ) {
            router.replace(
              "/streaksytem",
            );
          }
        }
      } catch (error) {
        console.log(
          "Victory load error:",
          error,
        );

        Alert.alert(
          "Error",
          error.message ||
            "Could not load the victory information.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadVictoryData();
  }, [router]);

  if (loading) {
    return (
      <View
        style={
          styles.loading
        }
      >
        <ActivityIndicator
          color="#A72BFF"
          size="large"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading victory...
        </Text>
      </View>
    );
  }

  const boss =
    data?.boss || {
      name: "Bug King",
      rewardXP: 100,
      badge: "Bug Slayer",
    };

  return (
    <SafeAreaView
      style={
        styles.container
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.content
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
            onPress={() =>
              router.back()
            }
            style={
              styles.backButton
            }
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
            style={
              styles.spacer
            }
          />
        </View>

        <Text
          style={
            styles.victory
          }
        >
          VICTORY!
        </Text>

        <Text
          style={
            styles.bossName
          }
        >
          {(
            boss.name ||
            "BUG KING"
          ).toUpperCase()}
        </Text>

        <View
          style={
            styles.ribbon
          }
        >
          <RibbonImage
            style={
              styles.ribbonImage
            }
          />

          <Text
            style={
              styles.ribbonText
            }
          >
            DEFEATED
          </Text>
        </View>

        <Image
          source={
            bossDefeated
          }
          style={
            styles.bossImage
          }
        />

        <Text
          style={
            styles.seeYou
          }
        >
          See you next time!
        </Text>

        <View
          style={
            styles.card
          }
        >
          <Text
            style={
              styles.cardTitle
            }
          >
            REWARDS
          </Text>

          <View
            style={
              styles.rewards
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
                +{boss.rewardXP ||
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
            styles.summaryCard
          }
        >
          <Text
            style={
              styles.summaryText
            }
          >
            {data?.language
              ? `${data.language} Weekly Boss`
              : "Weekly Boss"}
          </Text>

          <Text
            style={
              styles.summaryText
            }
          >
            {data?.weekId || ""}
          </Text>

          {attempt && (
            <Text
              style={
                styles.summaryText
              }
            >
              Highest Combo:{" "}
              {attempt.highestCombo ||
                0}
              x
            </Text>
          )}
        </View>

        <View
          style={
            styles.buttonBase
          }
        >
          <Pressable
            style={
              styles.button
            }
            onPress={() =>
              router.replace(
                "/home",
              )
            }
          >
            <Text
              style={
                styles.buttonText
              }
            >
              CLAIM REWARDS!
            </Text>
          </Pressable>
        </View>
      </ScrollView>
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

    content: {
      paddingHorizontal: 24,
      paddingBottom: 30,
      alignItems:
        "center",
    },

    loading: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
      backgroundColor:
        "#FFFFFF",
    },

    loadingText: {
      marginTop: 10,
      color: "#6C7278",
      fontFamily:
        "Nunito_600SemiBold",
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
      fontWeight: "900",
      color: "#000000",
    },

    spacer: {
      width: 22,
    },

    victory: {
      fontFamily:
        "Nunito_900Black",
      fontWeight: "900",
      color: "#000000",
      fontSize: 25,
      marginTop: 24,
    },

    bossName: {
      fontFamily:
        "Nunito_900Black",
      fontSize: 60,
      color: "#AF32FF",
      marginTop: -10,
      textAlign:
        "center",
    },

    ribbon: {
      width: "100%",
      height: 100,
      position:
        "relative",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginTop: -10,
    },

    ribbonText: {
      position:
        "absolute",
      fontFamily:
        "Nunito_900Black",
      fontSize: 36,
      color: "#000000",
      zIndex: 2,
    },

    ribbonImage: {
      width: 150,
      height: 100,
    },

    bossImage: {
      width: 330,
      height: 330,
      resizeMode:
        "contain",
      marginTop: 10,
      marginBottom: -20,
    },

    seeYou: {
      fontFamily:
        "Nunito_900Black",
      fontSize: 16,
      marginVertical: 14,
    },

    card: {
      width: "100%",
      borderWidth: 2,
      borderColor:
        "#E5E5E5",
      borderRadius: 16,
      padding: 14,
    },

    cardTitle: {
      fontFamily:
        "Nunito_900Black",
      fontSize: 14,
      color: "#4A4A4A",
    },

    rewards: {
      flexDirection:
        "row",
      justifyContent:
        "space-around",
      marginTop: 12,
    },

    rewardItem: {
      alignItems:
        "center",
    },

    rewardXpIcon: {
      width: 24,
      height: 26,
      resizeMode:
        "contain",
    },

    badgeImage: {
      width: 28,
      height: 28,
      resizeMode:
        "contain",
    },

    rewardText: {
      fontFamily:
        "Nunito_700Bold",
      marginTop: 6,
      color: "#211426",
    },

    summaryCard: {
      width: "100%",
      marginTop: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 12,
      backgroundColor:
        "#F7F7F7",
      alignItems:
        "center",
      gap: 4,
    },

    summaryText: {
      fontFamily:
        "Nunito_600SemiBold",
      fontSize: 12,
      color: "#6C7278",
    },

    buttonBase: {
      width: "100%",
      height: 60,
      backgroundColor:
        "#7200B8",
      borderRadius: 16,
      justifyContent:
        "flex-end",
      overflow:
        "hidden",
      marginTop: 16,
    },

    button: {
      height: 54,
      backgroundColor:
        "#B42CFF",
      borderRadius: 16,
      alignItems:
        "center",
      justifyContent:
        "center",
      transform: [
        {
          translateY: -6,
        },
      ],
    },

    buttonText: {
      fontFamily:
        "Nunito_900Black",
      color: "#FFFFFF",
      fontSize: 18,
    },
  });


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
import bossAngry from "../../assets/images/bosses/boss-angry.png";

import {
  loadUserAttempt,
  loadWeeklyBoss,
} from "../services/weeklyBossService";

export default function WeeklyBossLoose() {
  const router = useRouter();

  const [data, setData] =
    useState(null);

  const [attempt, setAttempt] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadDefeatData() {
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
      } catch (error) {
        console.log(
          "Defeat load error:",
          error,
        );

        Alert.alert(
          "Error",
          error.message ||
            "Could not load the challenge information.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDefeatData();
  }, []);

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
          Loading...
        </Text>
      </View>
    );
  }

  const boss =
    data?.boss || {
      name: "Bug King",
      maxHP: 100,
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
            styles.defeat
          }
        >
          YOU LOST!
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

        <Image
          source={
            bossAngry
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
          You couldn't squash me this time!
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
            CHALLENGE SUMMARY
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
              <Text
                style={
                  styles.statValue
                }
              >
                {attempt?.bossHP ??
                  boss.maxHP}{" "}
                /{" "}
                {boss.maxHP ||
                  100}
              </Text>

              <Text
                style={
                  styles.rewardText
                }
              >
                Boss HP Left
              </Text>
            </View>

            <View
              style={
                styles.rewardItem
              }
            >
              <Text
                style={
                  styles.statValue
                }
              >
                {attempt?.highestCombo ||
                  0}
                x
              </Text>

              <Text
                style={
                  styles.rewardText
                }
              >
                Highest Combo
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
            {data?.language ||
              "Programming"}{" "}
            Weekly Boss
          </Text>

          <Text
            style={
              styles.summaryText
            }
          >
            {data?.weekId || ""}
          </Text>
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
              BACK TO HOME
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
      fontWeight: "900",
      fontSize: 16,
      color: "#000000",
    },

    spacer: {
      width: 22,
    },

    defeat: {
      fontFamily:
        "Nunito_900Black",
      fontWeight: "900",
      color: "#000000",
      fontSize: 25,
      marginTop: "15%",
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

    bossImage: {
      width: 290,
      height: 290,
      resizeMode:
        "contain",
      marginTop: 10,
      marginBottom: -20,
    },

    seeYou: {
      fontFamily:
        "Nunito_900Black",
      fontSize: 16,
      maxWidth: "80%",
      textAlign:
        "center",
      marginVertical: 14,
      paddingTop: 20,
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
      fontSize: 15,
      color: "#4B4B4B",
    },

    rewards: {
      flexDirection:
        "row",
      justifyContent:
        "space-around",
      marginTop: 10,
    },

    rewardItem: {
      alignItems:
        "center",
    },

    statValue: {
      fontFamily:
        "Nunito_900Black",
      fontSize: 20,
      color: "#AF32FF",
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
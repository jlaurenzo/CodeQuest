import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { useRouter } from "expo-router";
import Cloud from "../../assets/icons/cloud.svg";
import Star from "../../assets/icons/Star.svg";
import onboardingIcon from "../../assets/images/onboarding-icon.png";

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.decorations}>
        <Star width={20} height={20} style={styles.starOne} />
        <Star width={17} height={17} style={styles.starTwo} />
        <Star width={21} height={21} style={styles.starThree} />
        <Star width={20} height={20} style={styles.starFour} />
        <Star width={17} height={17} style={styles.starFive} />
        <Star width={21} height={21} style={styles.starSix} />

        <Cloud style={styles.cloudOne} />
        <Cloud style={styles.cloudTwo} />
        <Cloud style={styles.cloudThree} />
        <Cloud style={styles.cloudFour} />
        <Cloud style={styles.cloudFive} />
      </View>

      <View style={styles.content}>
        
        <Image source={onboardingIcon} style={styles.onboardingIcon} />

        <Text style={styles.subtitle}>
          Learn. Play. Conquer Code
        </Text>

        <View style={styles.logoContainer}>
          <Text style={styles.title}>Code</Text>
          <Text style={styles.title}> </Text>
          <Text style={styles.titlePurple}>Quest</Text>
        </View>



        <View style={styles.primaryButtonBase}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
            onPress={() => router.push("/register")}
          >
            <Text style={styles.primaryButtonText}>GET STARTED</Text>
          </Pressable>
        </View>

        <View style={styles.secondaryButtonBase}>
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.secondaryButtonPressed,
            ]}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.secondaryButtonText}>
              I ALREADY HAVE AN ACCOUNT
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#400069",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  content: {
    width: "100%",
    alignItems: "center",
    zIndex: 1,
  },

  decorations: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },

  starOne: {
    position: "absolute",
    top: "16%",
    left: "14%",
    transform: [{ scale: 1.5 }, { rotate: "-15deg" }],
    
  },

  starTwo: {
    position: "absolute",
    top: "18%",
    left: "24%",
    transform: [{ scale: 1 }, { rotate: "21.93deg" }],

  },

  starThree: {
    position: "absolute",
    top: "22%",
    left: "20%",
  },

  starFour: {
    position: "absolute",
    top: "32%",
    right: "14%",
  },

  starFive: {
    position: "absolute",
    top: "36%",
    right: "8%",
    transform: [{ scale: 2 }, { rotate: "-15deg" }],
  },

  starSix: {
    position: "absolute",
    top: "41%",
    right: "12%",
    transform: [{ scale: 1 }, { rotate: "15deg" }],
  },

  cloudOne: {
    position: "absolute",
    width: 184,
    height: 141,
    left: -60,
    top: "34%",
    opacity: 0.12,
    transform: [{ scale: 1.5 }],
  },

  cloudTwo: {
    position: "absolute",
    width: 184,
    height: 141,
    left: -20,
    top: "40%",
    opacity: 0.1,
    transform: [{ scale: 1.0 }],
  },

  cloudThree: {
    position: "absolute",
    width: 184,
    height: 141,
    right: -108,
    top: "25%",
    opacity: 0.13,
    transform: [{ scale: 0.8 }],
  },

  cloudFour: {
    position: "absolute",
    width: 184,
    height: 141,
    right: -85,
    top: "47%",
    opacity: 0.1,
    transform: [{ scale: 1.5 }],
  },

  cloudFive: {
    position: "absolute",
    width: 184,
    height: 141,
    right: -85,
    top: "55%",
    opacity: 0.2,
    transform: [{ scale: 0.90 }],
  },

  logoContainer: {
    flexDirection: "row",
    marginBottom: 40,
  },

  logo: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 2,
  },

  logoPurple: {
    fontSize: 20,
    fontWeight: "800",
    color: "#B82CFF",
    letterSpacing: 2,
  },

  onboardingIcon: {
    width: 330,
    height: 330,
    marginBottom: 35,
    resizeMode: "contain",
  },

  title: {
    fontFamily: "Nunito_900Black",
    color: "#FFFFFF",
    fontSize: 55,
    fontWeight: "900",
    textAlign: "center",
  },

  titlePurple: {
    color: "#B82CFF",
    fontFamily: "Nunito_900Black",
    fontSize: 55,
    fontWeight: "900",
    textAlign: "center",
  },

  subtitle: {
    color: "#ffffff",
    fontSize: 18,
    textAlign: "center",
    fontFamily: "Nunito_600SemiBold",
    fontWeight: "600",
    lineHeight: 22,
    marginTop: 0,
    marginBottom: 5,
  },

  primaryButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#B42CFF",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateY: -7 }],
  },

  primaryButtonBase: {
    width: "100%",
    height: 61,
    backgroundColor: "#7200B8",
    borderRadius: 22,
    justifyContent: "flex-end",
    overflow: "hidden",
  },

  primaryButtonPressed: {
    backgroundColor: "#9D20E8",
    transform: [{ translateY: 0 }],
  },

  primaryButtonText: {
    fontFamily: "Nunito_900Black",
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },

  secondaryButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateY: -7 }],
  },

  secondaryButtonBase: {
    marginTop: 15,
    width: "100%",
    height: 61,
    backgroundColor: "#7200B8",
    borderRadius: 22,
    justifyContent: "flex-end",
    overflow: "hidden",
  },

  secondaryButtonPressed: {
    backgroundColor: "#F0EEF0",
    transform: [{ translateY: 0 }],
  },

  secondaryButtonText: {
    fontFamily: "Nunito_900Black",
    color: "#AF32FF",
    fontSize: 17,
    fontWeight: "bold",
  },
});

import { Alert, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useRouter } from "expo-router";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

import { auth, db } from "../services/firebase";
import javaScriptIcon from "../../assets/icons/javascript.png";
import javaIcon from "../../assets/icons/java.png";
import cppIcon from "../../assets/icons/cpp.png";

const languages = [
  {
    id: "javascript",
    name: "JavaScript",
    description: "Web development",
  },
  {
    id: "java",
    name: "Java",
    description: "Object-oriented programming",
  },
  {
    id: "cpp",
    name: "C++",
    description: "Performance and systems",
  },
];

const languageIcons = {
  javascript: javaScriptIcon,
  java: javaIcon,
  cpp: cppIcon,
};

export default function LanguageScreen() {
  const router = useRouter();

  const [selectedLanguage, setSelectedLanguage] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function redirectCompletedUser() {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      if (userData.profileCompleted && userData.programmingLanguage) {
        router.replace("/home");
      }
    }

    redirectCompletedUser().catch((error) => {
      console.log("Error checking onboarding status:", error);
    });
  }, [router]);

  const handleContinue = async () => {
    if (!selectedLanguage) {
      Alert.alert("Choose a Language", "Please select a programming language.");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Session Error", "Please register or login again.");

      router.replace("/");
      return;
    }

    try {
      setLoading(true);

      await setDoc(
        doc(db, "users", user.uid),
        {
          programmingLanguage: selectedLanguage,
          email: user.email,
          updatedAt: new Date(),
        },
        {
          merge: true,
        },
      );

      router.replace("/profilesetup");
    } catch (error) {
      console.log("Error saving language:", error);

      Alert.alert(
        "Something Went Wrong",
        "We couldn't save your language selection.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Choose Your Programming Language</Text>

        <Text style={styles.subtitle}>You can change this later in your profile</Text>

        <View>
          <View style={styles.divider} />
          
          <Text style={styles.programmingHeader}>Programming Languages</Text>

          {languages.map((language) => {
            const selected = selectedLanguage === language.id;

            return (
              <TouchableOpacity
                key={language.id}
                style={[styles.languageCard, selected && styles.selectedCard]}
                onPress={() => setSelectedLanguage(language.id)}
              >
                <View style={styles.languageInfo}>
                  {(() => {
                    const LanguageIcon = languageIcons[language.id];
                    return <Image source={LanguageIcon} style={styles.languageIcon} />;
                  })()}

                  <View>
                    <Text
                      style={[
                        styles.languageName,
                        selected && styles.selectedLanguageName,
                      ]}
                    >
                      {language.name}
                    </Text>

                    <Text
                      style={[
                        styles.description,
                        selected && styles.selectedDescription,
                      ]}
                    >
                      {language.description}
                    </Text>
                  </View>
                </View>

                <View style={[styles.radio, selected && styles.selectedRadio]}>
                  {selected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.primaryButtonBase}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? "SAVING..." : "CONTINUE"}
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
    backgroundColor: "#ffffff",
    justifyContent: "flex-start",
    paddingHorizontal: 25,
  },

  content: {
    paddingTop: "15%",
    width: "100%",
  },


  title: {
    fontFamily: "Nunito_900Black",
    fontSize: 40,
    fontWeight: "900",
    color: "#000000",
    textAlign: "left",
    marginLeft: "5%",
  },

  subtitle: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 20,
    color: "#000000",
    textAlign: "left",
    width: "85%",
    marginTop: 20,
    marginBottom: 30,
    marginLeft: "5%",
  },
  programmingHeader: {
    fontFamily: "Nunito_700Bold",
    fontWeight: 700,
    color: "#4B4B4B",
    fontSize: 20,
    marginTop: 5,
    marginBottom: 20,
  },
  languageCard: {
    minHeight: 100,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: "#E7E5E5",
    borderRadius: 12,
    paddingHorizontal: 18,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  languageInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  languageIcon: {
    width: 42,
    height: 42,
    resizeMode: "contain",
  },

  selectedCard: {
    backgroundColor: "#D2EFFD",
    borderColor: "#1CB0F6",
  },

  languageName: {
    fontFamily: "Nunito_900Black",
    fontSize: 22,
    fontWeight: "600",
    color: "#4B4B4B",
  },

  selectedLanguageName: {
    color: "#1CB0F6",
  },

  description: {
    fontSize: 15,
    color: "#9E8BAA",
    marginTop: 4,
  },

  selectedDescription: {
    color: "#1CB0F6",
  },

  radio: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#1CB0F6",
    justifyContent: "center",
    alignItems: "center",
  },

  selectedRadio: {
    borderColor: "#1CB0F6",
  },

  radioInner: {
    width: 15,
    height: 15,
    borderRadius: 7,
    backgroundColor: "#1CB0F6",
  },

  divider: {
    height: 1,
    backgroundColor: "#E7E5E5",
    marginBottom: 20,
  },

  primaryButtonBase: {
    width: "100%",
    height: 61,
    backgroundColor: "#7200B8",
    borderRadius: 22,
    justifyContent: "flex-end",
    overflow: "hidden",
    marginTop: 20,
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

  buttonDisabled: {
    opacity: 0.5,
  },
});

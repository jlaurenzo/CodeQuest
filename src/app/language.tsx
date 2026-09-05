import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useRouter } from "expo-router";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";

import { auth, db } from "../firebase";

const languages = [
  {
    id: "python",
    name: "Python",
    description: "Beginner friendly",
  },
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

export default function LanguageScreen() {
  const router = useRouter();

  const [selectedLanguage, setSelectedLanguage] =
    useState("");

  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedLanguage) {
      Alert.alert(
        "Choose a Language",
        "Please select a programming language."
      );
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      Alert.alert(
        "Session Error",
        "Please register or login again."
      );

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
        }
      );

      router.replace("/home");

    } catch (error) {
      console.log("Error saving language:", error);

      Alert.alert(
        "Something Went Wrong",
        "We couldn't save your language selection."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>

        <Text style={styles.logo}>
          CODE<Text style={styles.logoPurple}>QUEST</Text>
        </Text>

        <Text style={styles.title}>
          Choose Your Language
        </Text>

        <Text style={styles.subtitle}>
          What do you want to learn first?
        </Text>

        <View>
          {languages.map((language) => {
            const selected =
              selectedLanguage === language.id;

            return (
              <TouchableOpacity
                key={language.id}
                style={[
                  styles.languageCard,
                  selected && styles.selectedCard,
                ]}
                onPress={() =>
                  setSelectedLanguage(language.id)
                }
              >
                <View>
                  <Text
                    style={[
                      styles.languageName,
                      selected &&
                        styles.selectedLanguageName,
                    ]}
                  >
                    {language.name}
                  </Text>

                  <Text
                    style={[
                      styles.description,
                      selected &&
                        styles.selectedDescription,
                    ]}
                  >
                    {language.description}
                  </Text>
                </View>

                <View
                  style={[
                    styles.radio,
                    selected && styles.selectedRadio,
                  ]}
                >
                  {selected && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            loading && styles.buttonDisabled,
          ]}
          onPress={handleContinue}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Saving..." : "Continue"}
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#12051F",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  content: {
    width: "100%",
  },

  logo: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 2,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 40,
  },

  logoPurple: {
    color: "#B82CFF",
  },

  title: {
    fontSize: 29,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    color: "#9E8BAA",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 30,
  },

  languageCard: {
    minHeight: 70,
    backgroundColor: "#241331",
    borderWidth: 1,
    borderColor: "#51256C",
    borderRadius: 10,
    paddingHorizontal: 18,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectedCard: {
    backgroundColor: "#B82CFF",
    borderColor: "#B82CFF",
  },

  languageName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  selectedLanguageName: {
    color: "#FFFFFF",
  },

  description: {
    fontSize: 12,
    color: "#9E8BAA",
    marginTop: 4,
  },

  selectedDescription: {
    color: "#EFD9FF",
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#8D789A",
    justifyContent: "center",
    alignItems: "center",
  },

  selectedRadio: {
    borderColor: "#FFFFFF",
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
  },

  button: {
    height: 54,
    backgroundColor: "#B82CFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import BookIcon from "../../assets/icons/book.svg";
import LockIcon from "../../assets/icons/locked-level.svg";
import BottomNav from "../components/BottomNav";
import PhaseMapHeader from "../components/PhaseMapHeader";
import learningContent from "../data/learningContent.json";
import { auth, db } from "../services/firebase";
import { getUserLearningProgress } from "../services/learningProgress";

const LANGUAGE_STORAGE_KEY = "selectedLanguage";
const programmingLanguages = ["C++", "Java", "JavaScript"];

function normalizeLanguage(lang) {
  if (!lang) return "JavaScript";
  const lower = String(lang).trim().toLowerCase();
  if (lower === "javascript" || lower === "js") return "JavaScript";
  if (lower === "java") return "Java";
  if (lower === "c++" || lower === "cpp") return "C++";
  const found = Object.keys(learningContent).find(
    (k) => k.toLowerCase() === lower,
  );
  return found || "JavaScript";
}

export default function PhaseMap() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState("JavaScript");
  const [pendingLanguage, setPendingLanguage] = useState("JavaScript");
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [userProgress, setUserProgress] = useState({});

  const languageFromParams = Array.isArray(params.language)
    ? params.language[0]
    : params.language;

  useEffect(() => {
    async function loadLanguageAndProgress() {
      let language = languageFromParams;

      const user = auth.currentUser;
      if (!language && user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().programmingLanguage) {
            language = userDoc.data().programmingLanguage;
          }
        } catch (err) {
          console.log("Error loading language from Firestore:", err);
        }
      }

      if (!language) {
        language = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      }

      const activeLanguage = normalizeLanguage(language);
      setSelectedLanguage(activeLanguage);
      setPendingLanguage(activeLanguage);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, activeLanguage);

      const progress = await getUserLearningProgress(activeLanguage);
      setUserProgress(progress || {});
    }

    loadLanguageAndProgress().catch((error) =>
      console.log("Error loading phase map data:", error),
    );
  }, [languageFromParams]);

  async function saveLanguageChange() {
    if (pendingLanguage === selectedLanguage) {
      setShowLanguageModal(false);
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Session Error", "Please login again.");
      return;
    }

    try {
      const normalized = normalizeLanguage(pendingLanguage);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
      await setDoc(
        doc(db, "users", user.uid),
        { programmingLanguage: normalized, updatedAt: new Date() },
        { merge: true },
      );
      setSelectedLanguage(normalized);
      const progress = await getUserLearningProgress(normalized);
      setUserProgress(progress || {});
      setShowLanguageModal(false);
    } catch (error) {
      Alert.alert("Save failed", "Your programming language could not be saved.");
    }
  }

  function openModule(module, unitId) {
    router.push({
      pathname: "/LevelMap2",
      params: { language: selectedLanguage, unit: unitId, module: module.id },
    });
  }

  const languageData = learningContent[selectedLanguage] || learningContent.JavaScript;

  function isModuleCompleted(unitId, module) {
    const levels = module.levels || [];
    if (levels.length === 0) return false;
    return levels.every(
      (level) => Boolean(userProgress?.[unitId]?.[module.id]?.[level.id]),
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <PhaseMapHeader language={selectedLanguage} />
      <View style={styles.headerDivider} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.smallTitle}>CURRENT PROGRAMMING LANGUAGE</Text>
            <Text style={styles.languageTitle}>{selectedLanguage}</Text>
          </View>
          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => {
              setPendingLanguage(selectedLanguage);
              setShowLanguageModal(true);
            }}
            accessibilityLabel="Change programming language"
          >
            <BookIcon width={24} height={24} />
          </TouchableOpacity>
        </View>

        {languageData.units.map((unit) => (
          <View key={unit.id} style={styles.unitSection}>
            <View style={styles.progressCard}>
              <Text style={styles.unitText}>{unit.id.toUpperCase()}</Text>
              <Text style={styles.unitTitle}>{unit.title}</Text>
              <Text style={styles.unitDescription}>Choose a module to continue learning.</Text>
            </View>

            <View style={styles.moduleList}>
              {unit.modules.map((module, index) => {
                const isCompleted = isModuleCompleted(unit.id, module);
                const prevModule = index > 0 ? unit.modules[index - 1] : null;
                const isUnlocked =
                  index === 0 || (prevModule && isModuleCompleted(unit.id, prevModule));

                return (
                  <TouchableOpacity
                    key={module.id}
                    style={[
                      styles.moduleButton,
                      isUnlocked && styles.moduleButtonActive,
                      !isUnlocked && styles.moduleButtonLocked,
                    ]}
                    onPress={() => {
                      if (isUnlocked) {
                        openModule(module, unit.id);
                      } else {
                        Alert.alert(
                          "Module locked",
                          "Complete the previous module to unlock this one.",
                        );
                      }
                    }}
                    accessibilityState={{ disabled: !isUnlocked }}
                  >
                    <View style={styles.moduleHeader}>
                      <Text
                        style={[
                          styles.moduleNumber,
                          !isUnlocked && styles.lockedText,
                        ]}
                      >
                        MODULE {index + 1} {isCompleted ? "• COMPLETED" : ""}
                      </Text>
                      {!isUnlocked && <LockIcon width={16} height={16} />}
                    </View>
                    <Text
                      style={[
                        styles.moduleTitle,
                        !isUnlocked && styles.lockedText,
                      ]}
                    >
                      {module.title}
                    </Text>
                    <Text
                      style={[
                        styles.moduleMeta,
                        !isUnlocked && styles.lockedText,
                      ]}
                    >
                      {module.levels.length} levels
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Change Programming Language</Text>
            <Text style={styles.modalDescription}>Select the language you want to learn.</Text>

            {programmingLanguages.map((language) => (
              <TouchableOpacity
                key={language}
                style={[styles.languageOption, pendingLanguage === language && styles.languageOptionSelected]}
                onPress={() => setPendingLanguage(language)}
              >
                <Text style={[styles.languageOptionText, pendingLanguage === language && styles.languageOptionTextSelected]}>
                  {language}
                </Text>
                {pendingLanguage === language && <Text style={styles.selectedCheck}>✓</Text>}
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.cancelButton} onPress={saveLanguageChange}>
              <Text style={styles.cancelButtonText}>
                {pendingLanguage === selectedLanguage ? "CANCEL" : "CHANGE"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#FFFFFF" 
  },
  scrollContent: { 
    padding: 20, 
    paddingBottom: 60 
  },
  headerDivider: { 
    height: 2, 
    width: "100%", 
    backgroundColor: "#AFAFAF" 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  smallTitle: { 
    fontFamily: "Nunito_800ExtraBold", 
    fontSize: 12, 
    color: "#777" 
  },
  languageTitle: { 
    fontFamily: "Nunito_900Black", 
    fontSize: 30, 
    color: "#222", 
    marginTop: 3 
  },
  changeButton: {
    width: 44,
    height: 44,
    backgroundColor: "#AF32FF",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  unitSection: { 
    marginBottom: 18 
  },
  progressCard: { 
    backgroundColor: "#B52CFF", 
    borderRadius: 18, 
    padding: 20, 
    marginBottom: 12 
  },
  unitText: {
    fontFamily: "Nunito_800ExtraBold", 
    color: "#F1D7FF", 
    fontSize: 12 
  },
  unitTitle: { 
    fontFamily: "Nunito_700Bold", 
    color: "#FFFFFF", 
    fontSize: 22, 
    marginTop: 5 
  },
  unitDescription: { 
    color: "#FFFFFF", 
    fontFamily: "Nunito_400Regular", 
    fontSize: 15, 
    marginTop: 7 
  },
  moduleList: { 
    gap: 10 
  },
  moduleButton: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderRadius: 14,
    padding: 16,
  },
  moduleButtonActive: {
    borderColor: "#AF32FF", 
    backgroundColor: "#F8EEFF" 
  },
  moduleButtonLocked: { 
    backgroundColor: "#F2F2F2", 
    borderColor: "#D8D8D8" 
  },
  moduleHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center" 
  },
  moduleNumber: { 
    fontFamily: "Nunito_800ExtraBold", 
    fontSize: 11, 
    color: "#AF32FF" 
  },
  lockedText: { 
    color: "#999" 
  },
  lockIcon: { 
    fontSize: 16 
  },
  moduleTitle: { 
    fontFamily: "Nunito_900Black", 
    fontSize: 18, 
    color: "#222", 
    marginTop: 4 
  },
  moduleMeta: { 
    fontFamily: "Nunito_600SemiBold", 
    color: "#777", 
    marginTop: 4 
  },
  modalBackground: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.45)", 
    justifyContent: "center", 
    padding: 25 
  },
  modalContainer: { 
    backgroundColor: "#FFFFFF", 
    borderRadius: 20, 
    padding: 22 
  },
  modalTitle: { 
    fontFamily: "Nunito_800ExtraBold", 
    fontSize: 21, 
    color: "#222" 
  },
  modalDescription: { 
    color: "#777", 
    marginTop: 5, 
    marginBottom: 20 
  },
  languageOption: {
    minHeight: 58,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    marginBottom: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  languageOptionSelected: { 
    borderColor: "#B52CFF", 
    backgroundColor: "#F4E1FF" 
  },
  languageOptionText: { 
    fontFamily: "Nunito_800ExtraBold", 
    fontSize: 16, 
    color: "#333" 
  },
  languageOptionTextSelected: { 
    color: "#8C1AC7" 
  },
  selectedCheck: { 
    fontFamily: "Nunito_800ExtraBold", 
    color: "#B52CFF", 
    fontSize: 21 
  },
  cancelButton: { 
    borderRadius: 12, 
    backgroundColor: "#B52CFF", 
    marginTop: 8, 
    alignItems: "center", 
    paddingVertical: 12 
  },
  cancelButtonText: { 
    fontFamily: "Nunito_900Black", 
    color: "#FFFFFF", 
    fontSize: 16 
  },
});

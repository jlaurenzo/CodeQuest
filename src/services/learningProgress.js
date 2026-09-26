import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { auth, db } from "./firebase";

const PROGRESS_KEY = "learningProgress";

function getUserRef() {
  const user = auth.currentUser;
  if (!user) return null;
  return doc(db, "users", user.uid);
}

export async function readProgress() {
  const userRef = getUserRef();
  if (userRef) {
    try {
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        const remoteProgress = data.learningProgress || {};

        await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(remoteProgress));
        return remoteProgress;
      }
    } catch (error) {
      console.log("Error loading progress from Firestore:", error);
    }
  }

  // local storage if offline ung yser
  try {
    const stored = await AsyncStorage.getItem(PROGRESS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (err) {
    console.log("Error reading local progress:", err);
    return {};
  }
}

export async function isLevelComplete(language, unit, moduleId, level) {
  const progress = await readProgress();
  return Boolean(progress?.[language]?.[unit]?.[moduleId]?.[level]);
}

export async function markLevelComplete(language, unit, moduleId, level) {
  const progress = await readProgress();
  progress[language] ??= {};
  progress[language][unit] ??= {};
  progress[language][unit][moduleId] ??= {};
  progress[language][unit][moduleId][level] = true;

  try {
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (err) {
    console.log("Error caching progress to AsyncStorage:", err);
  }

  const userRef = getUserRef();
  if (userRef) {
    try {
      await setDoc(
        userRef,
        {
          learningProgress: progress,
          updatedAt: new Date(),
        },
        { merge: true },
      );
    } catch (error) {
      console.log("Error saving level progress to Firestore:", error);
    }
  }

  return progress;
}

export async function getModuleProgress(language, unit, moduleId, levels = []) {
  const progress = await readProgress();
  const completed = levels.filter(
    (level) => Boolean(progress?.[language]?.[unit]?.[moduleId]?.[level.id]),
  ).length;
  return {
    completed,
    total: levels.length,
    isComplete: levels.length > 0 && completed === levels.length,
  };
}

export async function isModuleComplete(language, unit, moduleId, levels = []) {
  const { isComplete } = await getModuleProgress(language, unit, moduleId, levels);
  return isComplete;
}

export async function getOverallUnitProgress(language, units = []) {
  const progress = await readProgress();
  const languageProgress = progress?.[language] || {};
  const completedUnits = units.filter((unit) => {
    const modules = unit.modules || [];
    return modules.length > 0 && modules.every((module) => {
      const levels = module.levels || [];
      return levels.length > 0 && levels.every(
        (level) => Boolean(languageProgress?.[unit.id]?.[module.id]?.[level.id]),
      );
    });
  }).length;

  return { completedUnits, totalUnits: units.length };
}

export async function getUserLearningProgress(language = null) {
  const progress = await readProgress();
  if (language) {
    return progress?.[language] || {};
  }
  return progress;
}

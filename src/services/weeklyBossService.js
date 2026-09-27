import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  setDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "./firebase";
import { recordXpDate } from "./userProgressService";

export const FALLBACK_BOSSES = {
  bugKing: {
    id: "bugKing",
    name: "Bug King",
    maxHP: 100,
    timeLimit: 300,
    concept: "Debugging / finding errors",
    difficulty: "Easy",
    rewardXP: 100,
    badge: "Bug Slayer",
    description: "Find the mistake before the bugs take over.",
  },
  syntaxSerpent: {
    id: "syntaxSerpent",
    name: "Syntax Serpent",
    maxHP: 120,
    timeLimit: 300,
    concept: "Syntax and programming terms",
    difficulty: "Medium",
    rewardXP: 125,
    badge: "Syntax Breaker",
    description: "Use clean syntax to defeat the serpent.",
  },
  loopLord: {
    id: "loopLord",
    name: "Loop Lord",
    maxHP: 150,
    timeLimit: 360,
    concept: "Loops and iteration",
    difficulty: "Medium",
    rewardXP: 150,
    badge: "Loop Master",
    description: "Break the loop and keep your combo alive.",
  },
  logicWitch: {
    id: "logicWitch",
    name: "Logic Witch",
    maxHP: 180,
    timeLimit: 420,
    concept: "Conditionals and logical expressions",
    difficulty: "Hard",
    rewardXP: 200,
    badge: "Logic Breaker",
    description: "Outsmart every conditional spell.",
  },
};

const FALLBACK_QUESTIONS = [
  {
    id: "bug_001",
    bossId: "bugKing",
    question: "Fix the code:",
    code: "int age = 20;",
    options: [
      "int age.equals(20);",
      "age.equals(int 20);",
      "int age = 20;",
      "int age == 20;",
    ],
    correctAnswer: 2,
    explanation: "A variable is assigned with a single equals sign.",
  },
  {
    id: "bug_002",
    bossId: "bugKing",
    question: "Which symbol compares two values?",
    code: "if (score __ 100) { win(); }",
    options: ["=", "==", ":=", "=>"],
    correctAnswer: 1,
    explanation: "Double equals compares two values in this example.",
  },
  {
    id: "loop_001",
    bossId: "loopLord",
    question: "What will this loop print?",
    code: "for (int i = 0; i < 3; i++) print(i);",
    options: ["0 1 2", "1 2 3", "0 1 2 3", "Nothing"],
    correctAnswer: 0,
    explanation: "The loop starts at zero and stops before three.",
  },
];

export function getWeekId(date = new Date()) {
  const current = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const day = current.getUTCDay() || 7;
  current.setUTCDate(current.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(current.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((current - yearStart) / 86400000 + 1) / 7);
  return `${current.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

export async function loadWeeklyBoss() {
  const weekId = getWeekId();
  const weeklySnapshot = await getDoc(doc(db, "weeklyChallenges", weekId));
  if (weeklySnapshot.exists()) {
    const weekly = weeklySnapshot.data();
    const bossSnapshot = await getDoc(doc(db, "bosses", weekly.bossId));
    return {
      weekId,
      weekly,
      boss: bossSnapshot.exists()
        ? { id: bossSnapshot.id, ...bossSnapshot.data() }
        : FALLBACK_BOSSES[weekly.bossId] || FALLBACK_BOSSES.bugKing,
    };
  }
  return {
    weekId,
    weekly: { weekId, bossId: "bugKing", active: true },
    boss: FALLBACK_BOSSES.bugKing,
  };
}

export async function loadQuestions(bossId) {
  const questionsSnapshot = await getDocs(
    query(
      collection(db, "questions"),
      where("bossId", "==", bossId),
      where("active", "==", true),
    ),
  );
  const questions = questionsSnapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
  return questions.length
    ? questions
    : FALLBACK_QUESTIONS.filter((item) => item.bossId === bossId);
}

export async function loadUserAttempt(weekId) {
  const user = auth.currentUser;
  if (!user) return null;
  const snapshot = await getDoc(
    doc(db, "users", user.uid, "weeklyBoss", weekId),
  );
  return snapshot.exists() ? snapshot.data() : null;
}

export async function startUserAttempt(weekId, boss, questions) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to start a challenge.");
  const attemptRef = doc(db, "users", user.uid, "weeklyBoss", weekId);
  const existing = await getDoc(attemptRef);
  if (existing.exists()) return existing.data();
  const attempt = {
    weekId,
    bossId: boss.id,
    questionIds: shuffle(questions).map((question) => question.id),
    currentQuestionIndex: 0,
    bossHP: boss.maxHP,
    lives: 3,
    combo: 0,
    highestCombo: 0,
    status: "in_progress",
    startedAt: new Date().toISOString(),
    completedAt: null,
  };
  await setDoc(attemptRef, attempt);
  return attempt;
}

export async function saveUserAttempt(weekId, changes) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to save progress.");
  await setDoc(doc(db, "users", user.uid, "weeklyBoss", weekId), changes, {
    merge: true,
  });
}

export async function awardWeeklyBossXp(weekId, rewardXP) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to receive rewards!");

  const attemptRef = doc(db, "users", user.uid, "weeklyBoss", weekId);
  const userRef = doc(db, "users", user.uid);
  let awarded = false;

  await runTransaction(db, async (transaction) => {
    const attemptSnapshot = await transaction.get(attemptRef);
    if (!attemptSnapshot.exists() || attemptSnapshot.data().xpAwarded) return;

    const userSnapshot = await transaction.get(userRef);
    const currentXP = userSnapshot.exists() && typeof userSnapshot.data().xp === "number"
      ? userSnapshot.data().xp
      : 0;

    transaction.set(
      userRef,
      { xp: currentXP + (Number(rewardXP) || 0) },
      { merge: true },
    );
    transaction.set(attemptRef, { xpAwarded: true }, { merge: true });
    awarded = true;
  });

  if (!awarded) return { firstXpToday: false };
  return recordXpDate();
}

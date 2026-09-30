import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import {
  auth,
  db,
} from "./firebase";

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
    description:
      "Find the mistake before the bugs take over.",
  },

  syntaxSerpent: {
    id: "syntaxSerpent",
    name: "Syntax Serpent",
    maxHP: 120,
    timeLimit: 300,
    concept:
      "Syntax and programming terms",
    difficulty: "Medium",
    rewardXP: 125,
    badge: "Syntax Breaker",
    description:
      "Use clean syntax to defeat the serpent.",
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
    description:
      "Break the loop and keep your combo alive.",
  },

  logicWitch: {
    id: "logicWitch",
    name: "Logic Witch",
    maxHP: 180,
    timeLimit: 420,
    concept:
      "Conditionals and logical expressions",
    difficulty: "Hard",
    rewardXP: 200,
    badge: "Logic Breaker",
    description:
      "Outsmart every conditional spell.",
  },
};

export const LANGUAGES = {
  javascript: "JavaScript",
  python: "Python",
  java: "Java",
};

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE:
    "multiple_choice",

  IDENTIFICATION:
    "identification",

  ENUMERATION:
    "enumeration",

  FILL_BLANK:
    "fill_blank",

  FINISH_CODE:
    "finish_code",

  CODE_OUTPUT:
    "code_output",

  TRUE_FALSE:
    "true_false",
};

export function normalizeLanguage(
  language,
) {
  if (!language) {
    return "javascript";
  }

  const value =
    String(language)
      .trim()
      .toLowerCase();

  if (
    value === "javascript" ||
    value === "js"
  ) {
    return "javascript";
  }

  if (
    value === "python" ||
    value === "py"
  ) {
    return "python";
  }

  if (
    value === "java"
  ) {
    return "java";
  }

  return "javascript";
}

export function getWeekId(
  date = new Date(),
) {
  const currentDate =
    new Date(date);

  const utcDate =
    new Date(
      Date.UTC(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
      ),
    );

  const day =
    utcDate.getUTCDay() || 7;

  utcDate.setUTCDate(
    utcDate.getUTCDate() +
      4 -
      day,
  );

  const year =
    utcDate.getUTCFullYear();

  const yearStart =
    new Date(
      Date.UTC(
        year,
        0,
        1,
      ),
    );

  const weekNumber =
    Math.ceil(
      (
        (
          utcDate -
          yearStart
        ) /
        86400000 +
        1
      ) /
        7,
    );

  return `${year}-W${String(
    weekNumber,
  ).padStart(2, "0")}`;
}

async function checkAdmin() {
  if (!auth.currentUser) {
    throw new Error(
      "You must be logged in.",
    );
  }

  const userRef =
    doc(
      db,
      "users",
      auth.currentUser.uid,
    );

  const userSnap =
    await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error(
      "User profile was not found.",
    );
  }

  const userData =
    userSnap.data();

  const isAdmin =
    userData.role ===
      "admin" ||
    userData.isAdmin === true;

  if (!isAdmin) {
    throw new Error(
      "You do not have administrator access.",
    );
  }

  return userData;
}

export async function loadWeeklyBoss() {
  if (!auth.currentUser) {
    throw new Error(
      "You must be logged in.",
    );
  }

  const uid =
    auth.currentUser.uid;

  const userRef =
    doc(
      db,
      "users",
      uid,
    );

  const userSnap =
    await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error(
      "User profile was not found.",
    );
  }

  const userData =
    userSnap.data();

  const language =
    normalizeLanguage(
      userData.programmingLanguage,
    );

  const weekId =
    getWeekId();

  const weeklyRef =
    doc(
      db,
      "weeklyChallenges",
      weekId,
    );

  const weeklySnap =
    await getDoc(weeklyRef);

  if (!weeklySnap.exists()) {
    return {
      weekId,
      language,
      boss: null,
      weekly: null,
    };
  }

  const weekly =
    weeklySnap.data();

  const selectedBossId =
    weekly.bosses?.[
      language
    ];

  if (!selectedBossId) {
    return {
      weekId,
      language,
      boss: null,
      weekly,
    };
  }

  const bossRef =
    doc(
      db,
      "bosses",
      selectedBossId,
    );

  const bossSnap =
    await getDoc(bossRef);

  let boss =
    null;

  if (bossSnap.exists()) {
    boss = {
      id: bossSnap.id,
      ...bossSnap.data(),
    };
  } else if (
    FALLBACK_BOSSES[
      selectedBossId
    ]
  ) {
    boss =
      FALLBACK_BOSSES[
        selectedBossId
      ];
  }

  return {
    weekId,
    language,
    boss,
    weekly,
  };
}

export async function loadQuestions(
  bossId,
  weekId,
) {
  if (!bossId) {
    return [];
  }

  const currentWeek =
    weekId || getWeekId();

  const questionsRef =
    collection(
      db,
      "questions",
    );

  const questionsQuery =
    query(
      questionsRef,

      where(
        "bossId",
        "==",
        bossId,
      ),

      where(
        "weekId",
        "==",
        currentWeek,
      ),

      where(
        "active",
        "==",
        true,
      ),
    );

  const snapshot =
    await getDocs(
      questionsQuery,
    );

  const questions =
    snapshot.docs.map(
      (questionDoc) => ({
        id: questionDoc.id,
        ...questionDoc.data(),
      }),
    );

  questions.sort(
    (a, b) =>
      Number(
        a.questionNumber || 0,
      ) -
      Number(
        b.questionNumber || 0,
      ),
  );

  return questions;
}

export async function loadUserAttempt(
  weekId,
) {
  if (!auth.currentUser) {
    return null;
  }

  const currentWeek =
    weekId || getWeekId();

  const attemptRef =
    doc(
      db,
      "users",
      auth.currentUser.uid,
      "weeklyBoss",
      currentWeek,
    );

  const snapshot =
    await getDoc(
      attemptRef,
    );

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function startUserAttempt(
  weekId,
  boss,
  questions,
) {
  if (!auth.currentUser) {
    throw new Error(
      "You must be logged in.",
    );
  }

  if (!boss) {
    throw new Error(
      "No Weekly Boss is assigned.",
    );
  }

  if (
    !questions ||
    questions.length === 0
  ) {
    throw new Error(
      "No questions are available for this Weekly Boss.",
    );
  }

  const currentWeek =
    weekId || getWeekId();

  const attemptRef =
    doc(
      db,
      "users",
      auth.currentUser.uid,
      "weeklyBoss",
      currentWeek,
    );

  const questionIds =
    questions.map(
      (question) =>
        question.id,
    );

  for (
    let i =
      questionIds.length - 1;
    i > 0;
    i--
  ) {
    const randomIndex =
      Math.floor(
        Math.random() *
          (i + 1),
      );

    const temp =
      questionIds[i];

    questionIds[i] =
      questionIds[
        randomIndex
      ];

    questionIds[
      randomIndex
    ] = temp;
  }

  const attempt = {
    weekId: currentWeek,

    bossId: boss.id,

    bossName: boss.name,

    questionIds,

    currentQuestionIndex: 0,

    currentHP: boss.maxHP,

    maxHP: boss.maxHP,

    lives: 3,

    combo: 0,

    highestCombo: 0,

    correctAnswers: 0,

    wrongAnswers: 0,

    status: "active",

    xpAwarded: false,

    startedAt:
      serverTimestamp(),

    updatedAt:
      serverTimestamp(),
  };

  await setDoc(
    attemptRef,
    attempt,
  );

  return {
    id: attemptRef.id,
    ...attempt,
  };
}

export async function saveUserAttempt(
  weekId,
  data,
) {
  if (!auth.currentUser) {
    throw new Error(
      "You must be logged in.",
    );
  }

  const currentWeek =
    weekId || getWeekId();

  const attemptRef =
    doc(
      db,
      "users",
      auth.currentUser.uid,
      "weeklyBoss",
      currentWeek,
    );

  await setDoc(
    attemptRef,
    {
      ...data,
      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    },
  );

  return true;
}

export async function awardWeeklyBossXp(
  weekId,
  rewardXP,
) {
  if (!auth.currentUser) {
    throw new Error(
      "You must be logged in.",
    );
  }

  const currentWeek =
    weekId || getWeekId();

  const uid =
    auth.currentUser.uid;

  const userRef =
    doc(
      db,
      "users",
      uid,
    );

  const attemptRef =
    doc(
      db,
      "users",
      uid,
      "weeklyBoss",
      currentWeek,
    );

  let result = {
    xpAwarded: false,
    firstXpToday: false,
  };

  await runTransaction(
    db,
    async (transaction) => {
      const userSnap =
        await transaction.get(
          userRef,
        );

      const attemptSnap =
        await transaction.get(
          attemptRef,
        );

      if (!attemptSnap.exists()) {
        return;
      }

      const attemptData =
        attemptSnap.data();

      if (
        attemptData.xpAwarded ===
        true
      ) {
        return;
      }

      const userData =
        userSnap.exists()
          ? userSnap.data()
          : {};

      const currentXP =
        Number(
          userData.xp || 0,
        );

      const currentWeeklyXP =
        Number(
          userData.weeklyBossXP ||
            0,
        );

      transaction.set(
        userRef,
        {
          xp:
            currentXP +
            Number(
              rewardXP || 0,
            ),

          weeklyBossXP:
            currentWeeklyXP +
            Number(
              rewardXP || 0,
            ),
        },
        {
          merge: true,
        },
      );

      transaction.set(
        attemptRef,
        {
          xpAwarded: true,
          xpAmount:
            Number(
              rewardXP || 0,
            ),
          updatedAt:
            serverTimestamp(),
        },
        {
          merge: true,
        },
      );

      result = {
        xpAwarded: true,
        firstXpToday: true,
      };
    },
  );

  return result;
}

export async function loadAdminBossContent(
  weekId,
  language,
) {
  await checkAdmin();

  const currentWeek =
    weekId || getWeekId();

  const normalizedLanguage =
    normalizeLanguage(
      language,
    );

  const weeklyRef =
    doc(
      db,
      "weeklyChallenges",
      currentWeek,
    );

  const weeklySnap =
    await getDoc(
      weeklyRef,
    );

  if (!weeklySnap.exists()) {
    return {
      weekId: currentWeek,
      language:
        normalizedLanguage,
      boss: null,
      questions: [],
    };
  }

  const weekly =
    weeklySnap.data();

  const selectedBossId =
    weekly.bosses?.[
      normalizedLanguage
    ];

  if (!selectedBossId) {
    return {
      weekId: currentWeek,
      language:
        normalizedLanguage,
      boss: null,
      questions: [],
    };
  }

  let boss = null;

  const bossRef =
    doc(
      db,
      "bosses",
      selectedBossId,
    );

  const bossSnap =
    await getDoc(bossRef);

  if (bossSnap.exists()) {
    boss = {
      id: bossSnap.id,
      ...bossSnap.data(),
    };
  } else if (
    FALLBACK_BOSSES[
      selectedBossId
    ]
  ) {
    boss =
      FALLBACK_BOSSES[
        selectedBossId
      ];
  }

  const questionsRef =
    collection(
      db,
      "questions",
    );

  const questionsQuery =
    query(
      questionsRef,

      where(
        "bossId",
        "==",
        selectedBossId,
      ),

      where(
        "weekId",
        "==",
        currentWeek,
      ),

      where(
        "language",
        "==",
        normalizedLanguage,
      ),

      where(
        "active",
        "==",
        true,
      ),
    );

  const snapshot =
    await getDocs(
      questionsQuery,
    );

  const questions =
    snapshot.docs.map(
      (questionDoc) => ({
        id: questionDoc.id,
        ...questionDoc.data(),
      }),
    );

  questions.sort(
    (a, b) =>
      Number(
        a.questionNumber || 0,
      ) -
      Number(
        b.questionNumber || 0,
      ),
  );

  return {
    weekId: currentWeek,
    language:
      normalizedLanguage,
    boss,
    questions,
  };
}

function buildQuestionData(
  question,
  index,
  weekId,
  language,
  bossId,
) {
  const data = {
    bossId,

    weekId,

    language,

    questionNumber:
      index + 1,

    type:
      question.type ||
      QUESTION_TYPES.MULTIPLE_CHOICE,

    question:
      question.question ||
      "",

    code:
      question.code ||
      "",

    explanation:
      question.explanation ||
      "",

    active: true,
  };

  if (
    question.type ===
    QUESTION_TYPES.MULTIPLE_CHOICE
  ) {
    data.options =
      Array.isArray(
        question.options,
      )
        ? question.options
        : [
            "",
            "",
            "",
            "",
          ];

    data.correctAnswer =
      Number(
        question.correctAnswer || 0,
      );

    return data;
  }

  if (
    question.type ===
    QUESTION_TYPES.TRUE_FALSE
  ) {
    data.options = [
      "True",
      "False",
    ];

    data.correctAnswer =
      Number(
        question.correctAnswer || 0,
      );

    return data;
  }

  let answers = [];

  if (
    typeof question.answersText ===
    "string"
  ) {
    answers =
      question.answersText
        .split("\n")
        .map(
          (answer) =>
            answer.trim(),
        )
        .filter(Boolean);
  }

  if (
    answers.length === 0 &&
    Array.isArray(
      question.answers,
    )
  ) {
    answers =
      question.answers
        .map(
          (answer) =>
            String(
              answer ?? "",
            ).trim(),
        )
        .filter(Boolean);
  }

  if (
    answers.length === 0 &&
    question.expectedOutput
  ) {
    answers = [
      String(
        question.expectedOutput,
      ).trim(),
    ];
  }

  data.answers = [
    ...new Set(answers),
  ];

  if (
    question.type ===
    QUESTION_TYPES.CODE_OUTPUT
  ) {
    data.expectedOutput =
      data.answers[0] ||
      "";
  }

  return data;
}

export async function saveWeeklyBossContent({
  weekId,
  language,
  bossId,
  questions,
}) {
  await checkAdmin();

  if (!bossId) {
    throw new Error(
      "A boss must be selected.",
    );
  }

  if (
    !questions ||
    questions.length < 10
  ) {
    throw new Error(
      "At least 10 questions are required.",
    );
  }

  const currentWeek =
    weekId || getWeekId();

  const normalizedLanguage =
    normalizeLanguage(
      language,
    );

  const boss =
    FALLBACK_BOSSES[
      bossId
    ];

  if (!boss) {
    throw new Error(
      "The selected boss does not exist.",
    );
  }

  const weeklyRef =
    doc(
      db,
      "weeklyChallenges",
      currentWeek,
    );

  const weeklySnap =
    await getDoc(
      weeklyRef,
    );

  const existingWeekly =
    weeklySnap.exists()
      ? weeklySnap.data()
      : {};

  const existingBosses =
    existingWeekly.bosses ||
    {};

  const updatedBosses = {
    ...existingBosses,

    [normalizedLanguage]:
      bossId,
  };

  await setDoc(
    weeklyRef,
    {
      weekId: currentWeek,

      active: true,

      bosses:
        updatedBosses,

      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    },
  );

  const oldQuestionsQuery =
    query(
      collection(
        db,
        "questions",
      ),

      where(
        "bossId",
        "==",
        bossId,
      ),

      where(
        "weekId",
        "==",
        currentWeek,
      ),

      where(
        "language",
        "==",
        normalizedLanguage,
      ),

      where(
        "active",
        "==",
        true,
      ),
    );

  const oldSnapshot =
    await getDocs(
      oldQuestionsQuery,
    );

  const batch =
    writeBatch(db);

  oldSnapshot.docs.forEach(
    (questionDoc) => {
      batch.update(
        questionDoc.ref,
        {
          active: false,
          updatedAt:
            serverTimestamp(),
        },
      );
    },
  );

  questions.forEach(
    (question, index) => {
      const questionId =
        `${currentWeek}_${normalizedLanguage}_${bossId}_q${index + 1}`;

      const questionRef =
        doc(
          db,
          "questions",
          questionId,
        );

      const questionData =
        buildQuestionData(
          question,
          index,
          currentWeek,
          normalizedLanguage,
          bossId,
        );

      batch.set(
        questionRef,
        {
          ...questionData,

          updatedAt:
            serverTimestamp(),

          createdAt:
            question.createdAt ||
            serverTimestamp(),
        },
      );
    },
  );

  await batch.commit();

  return {
    weekId: currentWeek,

    language:
      normalizedLanguage,

    bossId,

    questionCount:
      questions.length,
  };
}

export async function resetWeeklyBossAttempt(
  weekId,
) {
  if (!auth.currentUser) {
    throw new Error(
      "You must be logged in.",
    );
  }

  const currentWeek =
    weekId || getWeekId();

  const attemptRef =
    doc(
      db,
      "users",
      auth.currentUser.uid,
      "weeklyBoss",
      currentWeek,
    );

  await deleteDoc(
    attemptRef,
  );

  return true;
}


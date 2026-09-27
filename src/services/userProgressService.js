import { doc, getDoc, runTransaction, setDoc } from "firebase/firestore";

import { auth, db } from "./firebase";

export const MAX_HEARTS = 5;
export const HEART_REFILL_SECONDS = 5 * 60;

function getUserRef() {
  const user = auth.currentUser;
  if (!user) return null;
  return doc(db, "users", user.uid);
}

function getRefillTime(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate().getTime();

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getYesterdayKey() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getDateKey(yesterday);
}

function getStreakFields(data, today, yesterday) {
  const previousStreak = typeof data.streak === "number" ? data.streak : 0;
  const previousDate = data.lastXpDate || null;
  const previousDates = Array.isArray(data.streakDates) ? data.streakDates : [];
  const alreadyCountedToday = previousDate === today;
  const streak = alreadyCountedToday
    ? previousStreak
    : previousDate === yesterday
      ? previousStreak + 1
      : 1;
  const streakDates = alreadyCountedToday
    ? previousDates
    : [...new Set([...previousDates, today])].slice(-7);

  return { streak, lastXpDate: today, streakDates };
}

export async function loadUserProgress() {
  const userRef = getUserRef();
  if (!userRef) {
    return {
      xp: 0,
      hearts: MAX_HEARTS,
      heartRefillAt: null,
      streak: 0,
      lastXpDate: null,
      streakDates: [],
    };
  }

  const snapshot = await getDoc(userRef);
  const data = snapshot.exists() ? snapshot.data() : {};
  let hearts = typeof data.hearts === "number" ? data.hearts : MAX_HEARTS;
  let heartRefillAt = getRefillTime(data.heartRefillAt);
  const now = Date.now();

  if (
    typeof data.xp !== "number" ||
    typeof data.hearts !== "number" ||
    typeof data.streak !== "number" ||
    !Array.isArray(data.streakDates)
  ) {
    await setDoc(
      userRef,
      {
        xp: typeof data.xp === "number" ? data.xp : 0,
        hearts,
        heartRefillAt,
        streak: typeof data.streak === "number" ? data.streak : 0,
        lastXpDate: data.lastXpDate || null,
        streakDates: Array.isArray(data.streakDates) ? data.streakDates : [],
      },
      { merge: true },
    );
  }

  if (hearts < MAX_HEARTS && heartRefillAt && heartRefillAt <= now) {
    const refilledHearts = Math.min(
      MAX_HEARTS,
      hearts + Math.floor((now - heartRefillAt) / 1000 / HEART_REFILL_SECONDS) + 1,
    );
    const refillCount = refilledHearts - hearts;
    hearts = refilledHearts;
    heartRefillAt = hearts >= MAX_HEARTS
      ? null
      : heartRefillAt + refillCount * HEART_REFILL_SECONDS * 1000;

    await setDoc(userRef, { hearts, heartRefillAt }, { merge: true });
  }

  return {
    xp: typeof data.xp === "number" ? data.xp : 0,
    hearts,
    heartRefillAt,
    streak: typeof data.streak === "number" ? data.streak : 0,
    lastXpDate: data.lastXpDate || null,
    streakDates: Array.isArray(data.streakDates) ? data.streakDates : [],
  };
}

export async function saveHearts(hearts, heartRefillAt = null) {
  const userRef = getUserRef();
  if (!userRef) return;

  await setDoc(userRef, { hearts, heartRefillAt }, { merge: true });
}

export async function addUserXp(amount) {
  const userRef = getUserRef();
  if (!userRef) return { firstXpToday: false };

  const today = getDateKey();
  const yesterday = getYesterdayKey();
  let firstXpToday = false;

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(userRef);
    const data = snapshot.exists() ? snapshot.data() : {};
    const currentXp = typeof data.xp === "number" ? data.xp : 0;
    firstXpToday = data.lastXpDate !== today;
    const streakFields = getStreakFields(data, today, yesterday);

    transaction.set(
      userRef,
      {
        xp: currentXp + amount,
        ...streakFields,
      },
      { merge: true },
    );
  });

  return { firstXpToday };
}

export async function recordXpDate() {
  const userRef = getUserRef();
  if (!userRef) return { firstXpToday: false };

  const today = getDateKey();
  const yesterday = getYesterdayKey();
  let firstXpToday = false;

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(userRef);
    const data = snapshot.exists() ? snapshot.data() : {};
    firstXpToday = data.lastXpDate !== today;
    transaction.set(userRef, getStreakFields(data, today, yesterday), { merge: true });
  });

  return { firstXpToday };
}

export { getDateKey };

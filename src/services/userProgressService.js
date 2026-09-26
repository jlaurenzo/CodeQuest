import { doc, getDoc, setDoc } from "firebase/firestore";

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

export async function loadUserProgress() {
  const userRef = getUserRef();
  if (!userRef) return { xp: 0, hearts: MAX_HEARTS, heartRefillAt: null };

  const snapshot = await getDoc(userRef);
  const data = snapshot.exists() ? snapshot.data() : {};
  let hearts = typeof data.hearts === "number" ? data.hearts : MAX_HEARTS;
  let heartRefillAt = getRefillTime(data.heartRefillAt);
  const now = Date.now();

  if (typeof data.xp !== "number" || typeof data.hearts !== "number") {
    await setDoc(
      userRef,
      {
        xp: typeof data.xp === "number" ? data.xp : 0,
        hearts,
        heartRefillAt,
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
  };
}

export async function saveHearts(hearts, heartRefillAt = null) {
  const userRef = getUserRef();
  if (!userRef) return;

  await setDoc(userRef, { hearts, heartRefillAt }, { merge: true });
}

export async function addUserXp(amount) {
  const userRef = getUserRef();
  if (!userRef) return;

  const snapshot = await getDoc(userRef);
  const currentXp = snapshot.exists() && typeof snapshot.data().xp === "number"
    ? snapshot.data().xp
    : 0;

  await setDoc(userRef, { xp: currentXp + amount }, { merge: true });
}

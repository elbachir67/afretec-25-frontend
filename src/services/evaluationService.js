import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";

const POINTS = {
  MICRO_EVAL: 10,
  OPTIONAL_COMMENT: 5,
  EARLY_BIRD: 15,
};

export const checkExistingEvaluation = async (participantCode, activityId) => {
  try {
    const q = query(
      collection(db, "micro_evaluations"),
      where("participantCode", "==", participantCode),
      where("activityId", "==", activityId)
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking evaluation:", error);
    return false;
  }
};

export const submitMicroEvaluation = async (
  participantCode,
  participantId,
  activityId,
  responses
) => {
  try {
    // 1. Vérifier si déjà répondu
    const alreadyAnswered = await checkExistingEvaluation(
      participantCode,
      activityId
    );

    if (alreadyAnswered) {
      throw new Error("Already answered");
    }

    // 2. Récupérer activité pour Early Bird
    const activitySnap = await getDoc(doc(db, "activities", activityId));

    if (!activitySnap.exists()) {
      throw new Error("Activity not found");
    }

    const activity = activitySnap.data();

    const now = new Date();
    const activityEnd = activity.actualEnd
      ? activity.actualEnd.toDate()
      : activity.scheduledEnd.toDate();
    const minutesSinceEnd = (now - activityEnd) / (1000 * 60);
    const isEarlyBird = minutesSinceEnd <= 10;

    // 3. Calculer points
    let pointsEarned = POINTS.MICRO_EVAL; // Base 10
    let bonusDetails = [];

    if (responses.key_takeaway && responses.key_takeaway.trim().length > 0) {
      pointsEarned += POINTS.OPTIONAL_COMMENT; // +5
      bonusDetails.push({ type: "comment", points: POINTS.OPTIONAL_COMMENT });
    }

    if (isEarlyBird) {
      pointsEarned += POINTS.EARLY_BIRD; // +15
      bonusDetails.push({ type: "early_bird", points: POINTS.EARLY_BIRD });
    }

    // 4. Sauvegarder évaluation
    await addDoc(collection(db, "micro_evaluations"), {
      participantCode,
      activityId,
      responses,
      pointsEarned,
      isEarlyBird,
      createdAt: serverTimestamp(),
    });

    // 5. Mettre à jour points participant
    const participantRef = doc(db, "participants", participantId);
    await updateDoc(participantRef, {
      totalPoints: increment(pointsEarned),
      updatedAt: serverTimestamp(),
    });

    // 6. Historique points
    await addDoc(collection(db, "points_history"), {
      participantCode,
      pointsEarned,
      reason: "micro_eval",
      activityId,
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      pointsEarned,
      isEarlyBird,
      bonusDetails,
    };
  } catch (error) {
    console.error("Error submitting evaluation:", error);
    throw error;
  }
};

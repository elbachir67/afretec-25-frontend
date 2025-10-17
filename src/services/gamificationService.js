import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  arrayUnion,
  increment,
  serverTimestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";

const BADGES = [
  {
    id: "network_builder",
    name: { en: "Network Builder", fr: "Bâtisseur de Réseau" },
    icon: "🥇",
    description: {
      en: "Complete 5 micro-evaluations",
      fr: "Complétez 5 micro-évaluations",
    },
    requirement: { type: "micro_eval_count", value: 5 },
    bonus: 10,
  },
  {
    id: "speed_thinker",
    name: { en: "Speed Thinker", fr: "Penseur Rapide" },
    icon: "🔥",
    description: {
      en: "Reply 3 times as Early Bird (<10 min)",
      fr: "Répondez 3 fois en Early Bird (<10 min)",
    },
    requirement: { type: "early_bird_count", value: 3 },
    bonus: 15,
  },
  {
    id: "insight_master",
    name: { en: "Insight Master", fr: "Maître des Insights" },
    icon: "💎",
    description: {
      en: "Write 5 optional comments",
      fr: "Rédigez 5 commentaires optionnels",
    },
    requirement: { type: "comments_count", value: 5 },
    bonus: 10,
  },
  {
    id: "conference_champion",
    name: { en: "Conference Champion", fr: "Champion de Conférence" },
    icon: "👑",
    description: {
      en: "Complete all evaluations + final survey",
      fr: "Complétez toutes les évaluations + enquête finale",
    },
    requirement: { type: "all_done", value: 1 },
    bonus: 30,
  },
  {
    id: "afretec_ambassador",
    name: { en: "Afretec Ambassador", fr: "Ambassadeur Afretec" },
    icon: "🌍",
    description: {
      en: "Reach Top 10% participants",
      fr: "Atteignez le Top 10% des participants",
    },
    requirement: { type: "leaderboard_top_10_percent", value: 1 },
    bonus: 50,
  },
];

export { BADGES };

export const checkAndUnlockBadges = async participant => {
  try {
    const currentBadges = participant.badges || [];
    const newlyUnlockedBadges = [];

    // Charger statistiques du participant
    const microEvalsSnap = await getDocs(
      query(
        collection(db, "micro_evaluations"),
        where("participantCode", "==", participant.code)
      )
    );

    const earlyBirdCount = microEvalsSnap.docs.filter(
      d => d.data().isEarlyBird
    ).length;
    const commentsCount = microEvalsSnap.docs.filter(
      d => d.data().responses.key_takeaway?.trim().length > 0
    ).length;

    const finalEvalSnap = await getDocs(
      query(
        collection(db, "final_evaluations"),
        where("participantCode", "==", participant.code)
      )
    );

    const totalActivitiesSnap = await getDocs(collection(db, "activities"));
    const allDone =
      microEvalsSnap.size >= totalActivitiesSnap.size && !finalEvalSnap.empty;

    // Vérifier chaque badge
    for (const badge of BADGES) {
      if (currentBadges.includes(badge.id)) continue;

      let shouldUnlock = false;

      if (badge.requirement.type === "micro_eval_count") {
        shouldUnlock = microEvalsSnap.size >= badge.requirement.value;
      }

      if (badge.requirement.type === "early_bird_count") {
        shouldUnlock = earlyBirdCount >= badge.requirement.value;
      }

      if (badge.requirement.type === "comments_count") {
        shouldUnlock = commentsCount >= badge.requirement.value;
      }

      if (badge.requirement.type === "all_done") {
        shouldUnlock = allDone;
      }

      if (badge.requirement.type === "leaderboard_top_10_percent") {
        const allParticipantsSnap = await getDocs(
          collection(db, "participants")
        );
        const top10Threshold = Math.ceil(allParticipantsSnap.size * 0.1);

        const rankedParticipants = allParticipantsSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));

        const participantRank =
          rankedParticipants.findIndex(p => p.code === participant.code) + 1;
        shouldUnlock = participantRank > 0 && participantRank <= top10Threshold;
      }

      if (shouldUnlock) {
        await updateDoc(doc(db, "participants", participant.id), {
          badges: arrayUnion(badge.id),
          totalPoints: increment(badge.bonus),
          updatedAt: serverTimestamp(),
        });

        await addDoc(collection(db, "participant_badges"), {
          participantCode: participant.code,
          badgeId: badge.id,
          unlockedAt: serverTimestamp(),
        });

        newlyUnlockedBadges.push(badge);
      }
    }

    return newlyUnlockedBadges;
  } catch (error) {
    console.error("Error checking badges:", error);
    return [];
  }
};

export const getBadgeProgress = async participant => {
  try {
    const microEvalsSnap = await getDocs(
      query(
        collection(db, "micro_evaluations"),
        where("participantCode", "==", participant.code)
      )
    );

    const earlyBirdCount = microEvalsSnap.docs.filter(
      d => d.data().isEarlyBird
    ).length;
    const commentsCount = microEvalsSnap.docs.filter(
      d => d.data().responses.key_takeaway?.trim().length > 0
    ).length;

    const totalActivitiesSnap = await getDocs(collection(db, "activities"));

    return {
      network_builder: { current: microEvalsSnap.size, target: 5 },
      speed_thinker: { current: earlyBirdCount, target: 3 },
      insight_master: { current: commentsCount, target: 5 },
      conference_champion: {
        current: microEvalsSnap.size,
        target: totalActivitiesSnap.size,
      },
    };
  } catch (error) {
    console.error("Error getting badge progress:", error);
    return {};
  }
};

export const getLeaderboard = async (limitCount = 10) => {
  try {
    const participantsSnap = await getDocs(collection(db, "participants"));

    const leaderboard = participantsSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
      .slice(0, limitCount)
      .map((p, index) => ({
        rank: index + 1,
        code: p.code,
        points: p.totalPoints || 0,
        badges: p.badges || [],
      }));

    return leaderboard;
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    return [];
  }
};

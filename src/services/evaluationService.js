// src/services/evaluationService.js
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Récupérer le statut des évaluations (ouvert/fermé)
 * @returns {Object} Statut des 3 évaluations
 */
export const getEvaluationStatus = async () => {
  try {
    const configRef = doc(db, "config", "evaluation_status");
    const configSnap = await getDoc(configRef);

    if (!configSnap.exists()) {
      // Créer la config par défaut si elle n'existe pas
      const defaultConfig = {
        day1: { isOpen: false, openedAt: null, closedAt: null },
        day2: { isOpen: false, openedAt: null, closedAt: null },
        final: { isOpen: false, openedAt: null, closedAt: null },
        createdAt: serverTimestamp(),
      };

      await updateDoc(configRef, defaultConfig);
      return defaultConfig;
    }

    return configSnap.data();
  } catch (error) {
    console.error("Error getting evaluation status:", error);
    throw error;
  }
};

/**
 * Vérifier quelles évaluations un participant a complétées
 * @param {string} participantCode - Code du participant
 * @returns {Array} Liste des types complétés ["day1", "day2", "final"]
 */
export const getCompletedEvaluations = async participantCode => {
  try {
    const q = query(
      collection(db, "evaluations"),
      where("participantCode", "==", participantCode)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => doc.data().evaluationType);
  } catch (error) {
    console.error("Error getting completed evaluations:", error);
    return [];
  }
};

/**
 * Obtenir un résumé des évaluations pour un participant
 * @param {string} participantCode - Code du participant
 * @returns {Object} Résumé avec statuts et icônes
 */
export const getEvaluationSummary = async participantCode => {
  try {
    const status = await getEvaluationStatus();
    const completed = await getCompletedEvaluations(participantCode);

    return {
      day1: {
        isCompleted: completed.includes("day1"),
        isOpen: status.day1.isOpen,
        canStart: true,
        icon: completed.includes("day1")
          ? "✅"
          : status.day1.isOpen
          ? "🔴"
          : "🔒",
      },
      day2: {
        isCompleted: completed.includes("day2"),
        isOpen: status.day2.isOpen,
        canStart: completed.includes("day1"),
        icon: completed.includes("day2")
          ? "✅"
          : status.day2.isOpen && completed.includes("day1")
          ? "🔴"
          : "🔒",
      },
      final: {
        isCompleted: completed.includes("final"),
        isOpen: status.final.isOpen,
        canStart: completed.includes("day1") && completed.includes("day2"),
        icon: completed.includes("final")
          ? "✅"
          : status.final.isOpen &&
            completed.includes("day1") &&
            completed.includes("day2")
          ? "🔴"
          : "🔒",
      },
      totalCompleted: completed.length,
      totalRequired: 3,
      progress: Math.round((completed.length / 3) * 100),
    };
  } catch (error) {
    console.error("Error getting evaluation summary:", error);
    return null;
  }
};

/**
 * Vérifier si un participant peut soumettre une évaluation
 * @param {string} participantCode - Code du participant
 * @param {string} evaluationType - "day1", "day2", ou "final"
 * @returns {Object} { canSubmit: boolean, reason: string }
 */
export const canSubmitEvaluation = async (participantCode, evaluationType) => {
  try {
    // 1. Vérifier si l'évaluation est ouverte
    const status = await getEvaluationStatus();

    if (!status[evaluationType]?.isOpen) {
      return {
        canSubmit: false,
        reason: "evaluation_closed",
      };
    }

    // 2. Vérifier si déjà complétée
    const completed = await getCompletedEvaluations(participantCode);

    if (completed.includes(evaluationType)) {
      return {
        canSubmit: false,
        reason: "already_completed",
      };
    }

    // 3. Vérifier la séquence
    if (evaluationType === "day2" && !completed.includes("day1")) {
      return {
        canSubmit: false,
        reason: "requires_day1",
      };
    }

    if (
      evaluationType === "final" &&
      (!completed.includes("day1") || !completed.includes("day2"))
    ) {
      return {
        canSubmit: false,
        reason: "requires_day1_and_day2",
      };
    }

    return {
      canSubmit: true,
      reason: "ok",
    };
  } catch (error) {
    console.error("Error checking submission eligibility:", error);
    return {
      canSubmit: false,
      reason: "error",
    };
  }
};

/**
 * Valider les réponses selon le type d'évaluation
 * @param {string} evaluationType - Type d'évaluation
 * @param {Object} responses - Réponses du formulaire
 * @throws {Error} Si validation échoue
 */
const validateResponses = (evaluationType, responses) => {
  if (!responses || typeof responses !== "object") {
    throw new Error("Invalid responses format");
  }

  // Validation basique - peut être étendue selon besoins
  const requiredFields = {
    day1: ["logistics_rating", "schedule_balanced"],
    day2: ["logistics_rating", "schedule_balanced"],
    final: ["overall_rating", "most_impactful_thing", "network_feeling"],
  };

  const required = requiredFields[evaluationType] || [];

  for (const field of required) {
    if (!responses[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
};

/**
 * Soumettre une évaluation (Day 1, Day 2, ou Final)
 * @param {string} participantCode - Code du participant
 * @param {string} evaluationType - "day1", "day2", ou "final"
 * @param {Object} responses - Réponses du formulaire
 * @returns {Object} { success: boolean, evaluationId: string }
 */
export const submitEvaluation = async (
  participantCode,
  evaluationType,
  responses
) => {
  try {
    // 1. Vérifier l'éligibilité
    const eligibility = await canSubmitEvaluation(
      participantCode,
      evaluationType
    );

    if (!eligibility.canSubmit) {
      throw new Error(`Cannot submit: ${eligibility.reason}`);
    }

    // 2. Valider les réponses selon le type
    validateResponses(evaluationType, responses);

    // 3. Créer le document d'évaluation
    const evaluationData = {
      participantCode,
      evaluationType,
      responses,
      completedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "evaluations"), evaluationData);

    console.log(`✅ ${evaluationType} evaluation submitted:`, docRef.id);

    return {
      success: true,
      evaluationId: docRef.id,
    };
  } catch (error) {
    console.error("Error submitting evaluation:", error);
    throw error;
  }
};

/**
 * ADMIN UNIQUEMENT : Ouvrir une évaluation
 * @param {string} evaluationType - "day1", "day2", ou "final"
 */
export const openEvaluation = async evaluationType => {
  try {
    const configRef = doc(db, "config", "evaluation_status");

    await updateDoc(configRef, {
      [`${evaluationType}.isOpen`]: true,
      [`${evaluationType}.openedAt`]: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ ${evaluationType} evaluation opened`);
  } catch (error) {
    console.error("Error opening evaluation:", error);
    throw error;
  }
};

/**
 * ADMIN UNIQUEMENT : Fermer une évaluation
 * @param {string} evaluationType - "day1", "day2", ou "final"
 */
export const closeEvaluation = async evaluationType => {
  try {
    const configRef = doc(db, "config", "evaluation_status");

    await updateDoc(configRef, {
      [`${evaluationType}.isOpen`]: false,
      [`${evaluationType}.closedAt`]: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ ${evaluationType} evaluation closed`);
  } catch (error) {
    console.error("Error closing evaluation:", error);
    throw error;
  }
};

/**
 * ADMIN : Obtenir les statistiques d'une évaluation
 * @param {string} evaluationType - "day1", "day2", ou "final"
 * @returns {Object} Statistiques
 */
export const getEvaluationStats = async evaluationType => {
  try {
    const q = query(
      collection(db, "evaluations"),
      where("evaluationType", "==", evaluationType)
    );

    const snapshot = await getDocs(q);

    return {
      totalResponses: snapshot.size,
      responses: snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })),
    };
  } catch (error) {
    console.error("Error getting evaluation stats:", error);
    throw error;
  }
};

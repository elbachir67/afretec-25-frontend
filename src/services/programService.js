// src/services/programService.js
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Récupérer tout le programme de la conférence
 * @returns {Array} Liste de toutes les activités (24)
 */
export const getFullProgram = async () => {
  try {
    const q = query(
      collection(db, "program"),
      orderBy("day", "asc"),
      orderBy("startTime", "asc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting full program:", error);
    throw error;
  }
};

/**
 * Récupérer le programme d'un jour spécifique
 * @param {number} day - Numéro du jour (1, 2, ou 3)
 * @returns {Array} Liste des activités du jour
 */
export const getProgramByDay = async day => {
  try {
    const q = query(
      collection(db, "program"),
      where("day", "==", day),
      orderBy("startTime", "asc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(`Error getting program for day ${day}:`, error);
    throw error;
  }
};

/**
 * Récupérer les activités par type
 * @param {string} type - Type d'activité ("plenary", "panel", "workshop", "break")
 * @returns {Array} Liste des activités du type spécifié
 */
export const getProgramByType = async type => {
  try {
    const q = query(
      collection(db, "program"),
      where("type", "==", type),
      orderBy("day", "asc"),
      orderBy("startTime", "asc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(`Error getting program for type ${type}:`, error);
    throw error;
  }
};

/**
 * Helper pour obtenir les infos de type d'activité
 * @param {string} type - Type d'activité
 * @param {string} language - Langue ("en" ou "fr")
 * @returns {Object} Info formatée du type
 */
export const getActivityTypeInfo = (type, language = "fr") => {
  const types = {
    plenary: {
      icon: "🎤",
      color: "#1E40AF",
      label: { en: "Plenary", fr: "Plénière" },
    },
    panel: {
      icon: "💬",
      color: "#10B981",
      label: { en: "Panel", fr: "Panel" },
    },
    workshop: {
      icon: "🛠️",
      color: "#F59E0B",
      label: { en: "Workshop", fr: "Atelier" },
    },
    break: {
      icon: "☕",
      color: "#6B7280",
      label: { en: "Break", fr: "Pause" },
    },
  };

  const typeInfo = types[type] || types.plenary;

  return {
    ...typeInfo,
    label: typeInfo.label[language] || typeInfo.label.en,
  };
};

/**
 * Formater une activité pour l'affichage
 * @param {Object} activity - Activité brute de Firestore
 * @param {string} language - Langue préférée
 * @returns {Object} Activité formatée
 */
export const formatActivityForDisplay = (activity, language = "fr") => {
  const typeInfo = getActivityTypeInfo(activity.type, language);

  return {
    ...activity,
    displayTitle: activity.title?.[language] || activity.title?.en || "", // ← Changé !
    displayDescription:
      activity.description?.[language] || activity.description?.en || "", // ← Changé !
    typeLabel: typeInfo.label,
    typeIcon: typeInfo.icon,
    typeColor: typeInfo.color,
    timeRange: `${activity.startTime} - ${activity.endTime}`,
    dayLabel:
      language === "fr" ? `Jour ${activity.day}` : `Day ${activity.day}`,
  };
};

/**
 * Filtrer les activités principales (sans les breaks)
 * @returns {Array} Activités principales uniquement
 */
export const getMainActivities = async () => {
  try {
    const allProgram = await getFullProgram();

    return allProgram.filter(activity => activity.type !== "break");
  } catch (error) {
    console.error("Error getting main activities:", error);
    throw error;
  }
};

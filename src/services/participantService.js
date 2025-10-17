// src/services/participantService.js
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Générer un code unique AF-XXXX
 */
const generateUniqueCode = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `AF-${num}`;
};

/**
 * Vérifier si un code existe déjà
 */
const codeExists = async code => {
  try {
    const q = query(collection(db, "participants"), where("code", "==", code));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking code:", error);
    return false;
  }
};

/**
 * Créer un nouveau participant
 * @param {string} email - Email du participant
 * @param {string} code - Code généré (AF-XXXX)
 * @param {string} language - Langue ("en" ou "fr")
 * @returns {Object} { id: string, code: string }
 */
// src/services/participantService.js
export const createParticipant = async (
  email,
  code,
  language = "fr",
  name = "",
  institution = ""
) => {
  try {
    // Validation email
    if (!email || !email.includes("@")) {
      throw new Error("Invalid email format");
    }

    // Validation code
    if (!code || !code.startsWith("AF-")) {
      throw new Error("Invalid code format");
    }

    // Vérifier unicité du code
    const exists = await codeExists(code);
    if (exists) {
      throw new Error("Code already exists");
    }

    // Créer le participant avec TOUTES les infos
    const participantData = {
      code: code,
      email: email,
      language: language || "fr",
      name: name || "", // ← NOUVEAU
      institution: institution || "", // ← NOUVEAU
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, "participants"),
      participantData
    );

    console.log("✅ Participant created:", docRef.id);

    return {
      id: docRef.id,
      code: code,
    };
  } catch (error) {
    console.error("Error creating participant:", error);
    throw error;
  }
};

/**
 * Récupérer un participant par son code
 * @param {string} code - Code du participant
 * @returns {Object|null} Participant ou null
 */
export const getParticipantByCode = async code => {
  try {
    const q = query(collection(db, "participants"), where("code", "==", code));

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    console.error("Error getting participant:", error);
    return null;
  }
};

/**
 * Récupérer un participant par son ID
 * @param {string} participantId - ID du document Firestore
 * @returns {Object|null} Participant ou null
 */
export const getParticipantById = async participantId => {
  try {
    const docRef = doc(db, "participants", participantId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  } catch (error) {
    console.error("Error getting participant by ID:", error);
    return null;
  }
};

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

const resources = {
  en: {
    translation: {
      // Welcome Screen
      welcome: "Welcome to Afretec 2025!",
      subtitle: "Innovation & Collaboration Conference",
      chooseLanguage: "Choose your language",
      register: "Register",
      login: "Login",

      // Auth
      enterEmail: "Enter your email",
      yourCode: "Your unique code",
      saveCode: "Save this code carefully!",
      enterCode: "Enter your code AF-XXXX",
      continue: "Continue",
      back: "Back",

      // Dashboard
      yourPoints: "Your Points",
      yourRank: "Your Rank",
      currentActivity: "Current Activity",
      availableActivity: "Available Activity",
      noActivityAvailable: "No Activity Available",
      noActivityText:
        "Activities will appear here once completed by organizers.",
      refresh: "Refresh",
      pulseNow: "⚡ Pulse Now!",
      myBadges: "My Badges",
      leaderboard: "Leaderboard",
      profile: "Profile",

      // Evaluation
      quickFeedback: "Quick Feedback",
      submit: "Submit & Earn Points",
      thankYou: "Thank you!",
      pointsEarned: "points earned!",
      alreadyAnswered: "You already pulsed this session!",
      bonusComment: "bonus (comment)",
      bonusEarlyBird: "bonus (Early Bird)",

      // Loading
      loadingActivities: "Loading activities...",
      loading: "Loading...",

      // Common
      close: "Close",
      error: "An error occurred",
    },
  },
  fr: {
    translation: {
      // Welcome Screen
      welcome: "Bienvenue à Afretec 2025 !",
      subtitle: "Conférence Innovation & Collaboration",
      chooseLanguage: "Choisissez votre langue",
      register: "S'inscrire",
      login: "Se connecter",

      // Auth
      enterEmail: "Entrez votre email",
      yourCode: "Votre code unique",
      saveCode: "Conservez ce code précieusement !",
      enterCode: "Entrez votre code AF-XXXX",
      continue: "Continuer",
      back: "Retour",

      // Dashboard
      yourPoints: "Vos Points",
      yourRank: "Votre Rang",
      currentActivity: "Activité en cours",
      availableActivity: "Activité disponible",
      noActivityAvailable: "Aucune activité disponible",
      noActivityText:
        "Les activités apparaîtront ici une fois terminées par l'organisateur.",
      refresh: "Actualiser",
      pulseNow: "⚡ Pulsez maintenant !",
      myBadges: "Mes Badges",
      leaderboard: "Classement",
      profile: "Profil",

      // Evaluation
      quickFeedback: "Feedback Rapide",
      submit: "Soumettre & Gagner Points",
      thankYou: "Merci !",
      pointsEarned: "points gagnés !",
      alreadyAnswered: "Vous avez déjà pulsé cette session !",
      bonusComment: "bonus (commentaire)",
      bonusEarlyBird: "bonus (Early Bird)",

      // Loading
      loadingActivities: "Chargement des activités...",
      loading: "Chargement...",

      // Common
      close: "Fermer",
      error: "Une erreur s'est produite",
    },
  },
};

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  resources,
  lng: "en", // ANGLAIS par défaut
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// Charger la langue sauvegardée
AsyncStorage.getItem("language").then(lang => {
  if (lang) i18n.changeLanguage(lang);
});

export default i18n;

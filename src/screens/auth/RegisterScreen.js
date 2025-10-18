import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateCode } from "../../constants/utils";
import { createParticipant } from "../../services/participantService";

const COLORS = {
  primary: "#1E40AF",
  secondary: "#10B981",
  gray: "#6B7280",
  lightGray: "#F3F4F6",
  white: "#FFFFFF",
  black: "#111827",
  gold: "#FCD34D",
  success: "#D1FAE5",
  successText: "#059669",
};

// Liste des institutions partenaires
const INSTITUTIONS = [
  "Cheikh Anta Diop University",
  "American University in Cairo",
  "University of Lagos",
  "University of Nairobi",
  "University of Rwanda",
  "University of the Witwatersrand",
  "Al Akhawayn University",
  "Carnegie Mellon Africa",
  "Mastercard Foundation",
  "Autre / Other",
];

export default function RegisterScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [customInstitution, setCustomInstitution] = useState("");
  const [code, setCode] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert(t("error") || "Error", "Please enter your name");
      return;
    }

    if (!email || !email.includes("@")) {
      Alert.alert(t("error") || "Error", "Invalid email");
      return;
    }

    if (!institution) {
      Alert.alert(t("error") || "Error", "Please select your institution");
      return;
    }

    if (institution === "Autre / Other" && !customInstitution.trim()) {
      Alert.alert(t("error") || "Error", "Please specify your institution");
      return;
    }

    setLoading(true);

    try {
      // Générer code unique
      const newCode = generateCode();

      // Déterminer l'institution finale
      const finalInstitution =
        institution === "Autre / Other" ? customInstitution : institution;

      // Créer participant avec toutes les infos
      const result = await createParticipant(
        email,
        newCode,
        i18n.language,
        name,
        finalInstitution
      );

      // Sauvegarder localement
      await AsyncStorage.setItem("participantCode", result.code);
      await AsyncStorage.setItem("participantEmail", email);
      await AsyncStorage.setItem("participantId", result.id);
      await AsyncStorage.setItem("participantName", name);
      await AsyncStorage.setItem("participantInstitution", finalInstitution);

      // TODO: Appeler Firebase Function pour envoyer l'email
      // await sendCodeByEmail(email, name, result.code);

      // Afficher le code
      setCode(result.code);
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert(
        t("error") || "Error",
        error.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigation.navigate("Dashboard");
  };

  // Vue après génération du code
  if (code) {
    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <Image
            source={require("../../../assets/images/logo_ucad.png")}
            style={styles.logoSmall}
            resizeMode="contain"
          />

          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>
            {i18n.language === "fr"
              ? "Inscription réussie !"
              : "Registration Successful!"}
          </Text>

          {/* Email notification */}
          <View style={styles.emailNotification}>
            <Text style={styles.emailIcon}>📧</Text>
            <Text style={styles.emailText}>
              {i18n.language === "fr"
                ? `Un email a été envoyé à ${email}`
                : `An email has been sent to ${email}`}
            </Text>
          </View>

          {/* Code display with emphasis */}
          <View style={styles.codeSection}>
            <Text style={styles.codeLabel}>
              {i18n.language === "fr"
                ? "Votre code d'accès"
                : "Your access code"}
            </Text>

            <View style={styles.codeContainer}>
              <Text style={styles.code}>{code}</Text>
            </View>

            <View style={styles.warningBox}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={styles.warningText}>
                {i18n.language === "fr"
                  ? "IMPORTANT : Notez ou photographiez ce code. Vous en aurez besoin pour accéder aux évaluations."
                  : "IMPORTANT: Write down or take a screenshot of this code. You will need it to access evaluations."}
              </Text>
            </View>

            {/* Screenshot reminder */}
            <View style={styles.screenshotReminder}>
              <Text style={styles.screenshotIcon}>📸</Text>
              <Text style={styles.screenshotText}>
                {i18n.language === "fr"
                  ? "Prenez une capture d'écran maintenant !"
                  : "Take a screenshot now!"}
              </Text>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsTitle}>
              {i18n.language === "fr"
                ? "Comment utiliser votre code :"
                : "How to use your code:"}
            </Text>
            <Text style={styles.instructionItem}>
              {i18n.language === "fr"
                ? "1️⃣ Conservez ce code précieusement"
                : "1️⃣ Keep this code safely"}
            </Text>
            <Text style={styles.instructionItem}>
              {i18n.language === "fr"
                ? "2️⃣ Utilisez-le pour vous connecter à l'application"
                : "2️⃣ Use it to log in to the application"}
            </Text>
            <Text style={styles.instructionItem}>
              {i18n.language === "fr"
                ? "3️⃣ Accédez aux évaluations quotidiennes"
                : "3️⃣ Access daily evaluations"}
            </Text>
          </View>

          {/* Continue button */}
          <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue}>
            <Text style={styles.btnText}>
              {i18n.language === "fr" ? "Continuer →" : "Continue →"}
            </Text>
          </TouchableOpacity>

          {/* Email reminder at bottom */}
          <Text style={styles.emailReminder}>
            {i18n.language === "fr"
              ? "💌 N'oubliez pas de vérifier votre boîte email"
              : "💌 Don't forget to check your email inbox"}
          </Text>
        </View>
      </ScrollView>
    );
  }

  // Vue inscription
  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Image
          source={require("../../../assets/images/logo_afretec.png")}
          style={styles.logoSmall}
          resizeMode="contain"
        />

        <Text style={styles.title}>{t("register")}</Text>
        <Text style={styles.subtitle}>Afretec 2025 Conference</Text>

        {/* Nom */}
        <TextInput
          style={styles.input}
          placeholder={i18n.language === "fr" ? "Nom complet" : "Full name"}
          value={name}
          onChangeText={setName}
          editable={!loading}
        />

        {/* Email */}
        <TextInput
          style={styles.input}
          placeholder={t("enterEmail")}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        {/* Institution - Sélecteur */}
        <Text style={styles.label}>
          {i18n.language === "fr" ? "Institution" : "Institution"}
        </Text>
        <View style={styles.institutionList}>
          {INSTITUTIONS.map(inst => (
            <TouchableOpacity
              key={inst}
              style={[
                styles.institutionBtn,
                institution === inst && styles.institutionBtnActive,
              ]}
              onPress={() => setInstitution(inst)}
              disabled={loading}
            >
              <Text
                style={[
                  styles.institutionText,
                  institution === inst && styles.institutionTextActive,
                ]}
              >
                {institution === inst ? "✓ " : ""}
                {inst}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Champ "Autre" */}
        {institution === "Autre / Other" && (
          <TextInput
            style={styles.input}
            placeholder={
              i18n.language === "fr"
                ? "Précisez votre institution"
                : "Specify your institution"
            }
            value={customInstitution}
            onChangeText={setCustomInstitution}
            editable={!loading}
          />
        )}

        {/* Bouton Register */}
        <TouchableOpacity
          style={[styles.primaryBtn, loading && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.btnText}>{t("register")}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Welcome")}>
          <Text style={styles.linkText}>← {t("back")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  logoSmall: {
    width: 130,
    height: 130,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    alignSelf: "flex-start",
    marginBottom: 10,
    marginTop: 10,
  },
  input: {
    width: "100%",
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: COLORS.white,
  },
  institutionList: {
    width: "100%",
    marginBottom: 15,
  },
  institutionBtn: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginBottom: 8,
    backgroundColor: COLORS.white,
  },
  institutionBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "10",
  },
  institutionText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  institutionTextActive: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 16,
  },

  // Success screen styles
  successIcon: {
    fontSize: 80,
    marginBottom: 15,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 25,
    textAlign: "center",
  },
  emailNotification: {
    backgroundColor: COLORS.success,
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  emailIcon: {
    fontSize: 24,
  },
  emailText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.successText,
    fontWeight: "600",
  },
  codeSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: 25,
  },
  codeLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 15,
  },
  codeContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 25,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 4,
    borderColor: COLORS.gold,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  code: {
    fontSize: 42,
    fontWeight: "bold",
    color: COLORS.primary,
    letterSpacing: 8,
  },
  warningBox: {
    backgroundColor: "#FEF3C7",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },
  warningIcon: {
    fontSize: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#92400E",
    fontWeight: "600",
    lineHeight: 20,
  },
  screenshotReminder: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary + "15",
    padding: 12,
    borderRadius: 10,
    width: "100%",
  },
  screenshotIcon: {
    fontSize: 24,
  },
  screenshotText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  instructionsBox: {
    backgroundColor: COLORS.lightGray,
    padding: 20,
    borderRadius: 12,
    width: "100%",
    marginBottom: 25,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 12,
  },
  instructionItem: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
    lineHeight: 20,
  },
  emailReminder: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
    fontStyle: "italic",
  },
});

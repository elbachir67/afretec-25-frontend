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

  // Vue après génération du code - VERSION SIMPLIFIÉE
  if (code) {
    return (
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

        {/* Code display */}
        <View style={styles.codeSection}>
          <Text style={styles.codeLabel}>
            {i18n.language === "fr" ? "Votre code d'accès" : "Your access code"}
          </Text>

          <View style={styles.codeContainer}>
            <Text style={styles.code}>{code}</Text>
          </View>

          <Text style={styles.emailInfo}>
            📧{" "}
            {i18n.language === "fr"
              ? `Code envoyé à ${email}`
              : `Code sent to ${email}`}
          </Text>
        </View>

        {/* Continue button */}
        <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue}>
          <Text style={styles.btnText}>
            {i18n.language === "fr" ? "Continuer →" : "Continue →"}
          </Text>
        </TouchableOpacity>
      </View>
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

  // Success screen styles - SIMPLIFIÉS
  successIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 40,
    textAlign: "center",
  },
  codeSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: 40,
  },
  codeLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.gray,
    marginBottom: 20,
  },
  codeContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 30,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: COLORS.gold,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  code: {
    fontSize: 48,
    fontWeight: "bold",
    color: COLORS.primary,
    letterSpacing: 8,
  },
  emailInfo: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
  },
});

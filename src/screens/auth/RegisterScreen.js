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
};

export default function RegisterScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validation email
    if (!email || !email.includes("@")) {
      Alert.alert(t("error") || "Error", "Invalid email");
      return;
    }

    setLoading(true);

    try {
      // Générer code unique
      const newCode = generateCode();

      // Créer participant dans Firestore
      await createParticipant(email, newCode, i18n.language);

      // Sauvegarder localement
      await AsyncStorage.setItem("participantCode", newCode);
      await AsyncStorage.setItem("participantEmail", email);

      // Afficher le code
      setCode(newCode);
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert(
        t("error") || "Error",
        "Registration failed. Please try again."
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
      <View style={styles.container}>
        {/* Logo UCAD */}
        <Image
          source={require("../../../assets/images/logo_ucad.png")}
          style={styles.logoSmall}
          resizeMode="contain"
        />

        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.title}>{t("yourCode")}</Text>

        <View style={styles.codeContainer}>
          <Text style={styles.code}>{code}</Text>
        </View>

        <Text style={styles.saveText}>{t("saveCode")}</Text>
        <Text style={styles.warningText}>📸 Take a screenshot!</Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue}>
          <Text style={styles.btnText}>{t("continue")} →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Vue inscription initiale
  return (
    <View style={styles.container}>
      {/* Logo UCAD */}
      <Image
        source={require("../../../assets/images/logo_ucad.png")}
        style={styles.logoSmall}
        resizeMode="contain"
      />

      <Text style={styles.title}>{t("register")}</Text>
      <Text style={styles.subtitle}>Afretec 2025 Conference</Text>

      <TextInput
        style={styles.input}
        placeholder={t("enterEmail")}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logoSmall: {
    width: 80,
    height: 80,
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
  input: {
    width: "100%",
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: COLORS.white,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
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
  successIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  codeContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: COLORS.gold,
  },
  code: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.primary,
    letterSpacing: 3,
  },
  saveText: {
    fontSize: 18,
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "600",
  },
  warningText: {
    fontSize: 16,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 30,
  },
});

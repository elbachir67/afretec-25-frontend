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
import { isValidCode } from "../../constants/utils";
import { getParticipantByCode } from "../../services/participantService";

const COLORS = {
  primary: "#1E40AF",
  secondary: "#10B981",
  gray: "#6B7280",
  lightGray: "#F3F4F6",
  white: "#FFFFFF",
  black: "#111827",
};

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validation format code
    if (!isValidCode(code.toUpperCase())) {
      Alert.alert(
        t("error") || "Error",
        "Invalid format. Code must be AF-XXXX (e.g., AF-1234)"
      );
      return;
    }

    setLoading(true);

    try {
      const upperCode = code.toUpperCase();

      // Vérifier si participant existe
      const participant = await getParticipantByCode(upperCode);

      if (!participant) {
        Alert.alert(
          t("error") || "Error",
          "Code not found. Please check your code or register."
        );
        setLoading(false);
        return;
      }

      // Sauvegarder localement
      await AsyncStorage.setItem("participantCode", upperCode);
      await AsyncStorage.setItem("participantId", participant.id);

      // Navigation vers Dashboard
      navigation.navigate("Dashboard");
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(t("error") || "Error", "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo UCAD */}
      <Image
        source={require("../../../assets/images/logo_afretec.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>{t("login")}</Text>
      <Text style={styles.subtitle}>Enter your unique code</Text>

      <TextInput
        style={styles.input}
        placeholder="AF-XXXX"
        value={code}
        onChangeText={setCode}
        autoCapitalize="characters"
        maxLength={7}
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.primaryBtn, loading && styles.btnDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.btnText}>{t("login")}</Text>
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
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
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
    fontSize: 20,
    marginBottom: 20,
    backgroundColor: COLORS.white,
    textAlign: "center",
    fontWeight: "bold",
    letterSpacing: 2,
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
});

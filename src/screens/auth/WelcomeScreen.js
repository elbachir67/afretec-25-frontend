import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../../constants/theme";

export default function WelcomeScreen({ navigation }) {
  const { t, i18n } = useTranslation();

  const changeLanguage = async lang => {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem("language", lang);
  };

  return (
    <View style={styles.container}>
      {/* Logo UCAD */}
      <Image
        source={require("../../../assets/images/logo_ucad.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Titre */}
      <Text style={styles.title}>{t("welcome")}</Text>
      <Text style={styles.subtitle}>🌍 Afretec 2025</Text>

      {/* Sélecteur de langue */}
      <View style={styles.langContainer}>
        <Text style={styles.langLabel}>{t("chooseLanguage")}</Text>
        <View style={styles.langButtons}>
          <TouchableOpacity
            style={[
              styles.langBtn,
              i18n.language === "fr" && styles.langBtnActive,
            ]}
            onPress={() => changeLanguage("fr")}
          >
            <Text
              style={[
                styles.langText,
                i18n.language === "fr" && styles.langTextActive,
              ]}
            >
              🇫🇷 FR
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.langBtn,
              i18n.language === "en" && styles.langBtnActive,
            ]}
            onPress={() => changeLanguage("en")}
          >
            <Text
              style={[
                styles.langText,
                i18n.language === "en" && styles.langTextActive,
              ]}
            >
              🇬🇧 EN
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Boutons */}
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.btnText}>{t("register")}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.secondaryBtnText}>{t("login")}</Text>
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
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.gray,
    marginBottom: 40,
  },
  langContainer: {
    marginBottom: 40,
  },
  langLabel: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 15,
    textAlign: "center",
  },
  langButtons: {
    flexDirection: "row",
    gap: 15,
  },
  langBtn: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  langBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  langText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.gray,
  },
  langTextActive: {
    color: COLORS.white,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 25,
    marginBottom: 15,
    width: "100%",
    alignItems: "center",
  },
  btnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryBtn: {
    backgroundColor: COLORS.white,
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.primary,
    width: "100%",
    alignItems: "center",
  },
  secondaryBtnText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
});

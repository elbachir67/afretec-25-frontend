import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  RefreshControl,
} from "react-native";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getParticipantByCode } from "../../services/participantService";
import { getEvaluationSummary } from "../../services/evaluationService";

const COLORS = {
  primary: "#1E40AF",
  secondary: "#10B981",
  accent: "#F59E0B",
  gray: "#6B7280",
  lightGray: "#F3F4F6",
  white: "#FFFFFF",
  black: "#111827",
  gold: "#FCD34D",
  danger: "#EF4444",
};

export default function DashboardScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [participant, setParticipant] = useState(null);
  const [evaluationSummary, setEvaluationSummary] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const code = await AsyncStorage.getItem("participantCode");

      if (!code) {
        navigation.navigate("Welcome");
        return;
      }

      // Charger participant
      const participantData = await getParticipantByCode(code);
      setParticipant(participantData);

      // Charger résumé des évaluations
      const summary = await getEvaluationSummary(code);
      setEvaluationSummary(summary);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("participantCode");
    await AsyncStorage.removeItem("participantEmail");
    navigation.navigate("Welcome");
  };

  const handleStartEvaluation = type => {
    navigation.navigate("Evaluation", {
      evaluationType: type,
      participant: participant,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLogos}>
          <Image
            source={require("../../../assets/images/logo_ucad.png")}
            style={styles.logoTiny}
            resizeMode="contain"
          />
          <Image
            source={require("../../../assets/images/logo_afretec.png")}
            style={styles.logoTiny}
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Afretec Pulse 2025</Text>
          <Text style={styles.headerCode}>{participant?.code}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
            <Text style={styles.refreshIcon}>🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      {evaluationSummary && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              {i18n.language === "fr" ? "Votre Progression" : "Your Progress"}
            </Text>
            <Text style={styles.progressValue}>
              {evaluationSummary.totalCompleted} /{" "}
              {evaluationSummary.totalRequired}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${evaluationSummary.progress}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {evaluationSummary.progress}%{" "}
            {i18n.language === "fr" ? "complété" : "completed"}
          </Text>
        </View>
      )}

      {/* Évaluations */}
      <View style={styles.evaluationsSection}>
        <Text style={styles.sectionTitle}>
          📋 {i18n.language === "fr" ? "Vos Évaluations" : "Your Evaluations"}
        </Text>

        {/* Day 1 */}
        {evaluationSummary && (
          <View
            style={[
              styles.evalCard,
              evaluationSummary.day1.isCompleted && styles.evalCardCompleted,
            ]}
          >
            <View style={styles.evalHeader}>
              <Text style={styles.evalIcon}>{evaluationSummary.day1.icon}</Text>
              <View style={styles.evalInfo}>
                <Text style={styles.evalTitle}>
                  {i18n.language === "fr"
                    ? "Jour 1 (20 octobre)"
                    : "Day 1 (October 20)"}
                </Text>
                {evaluationSummary.day1.isCompleted ? (
                  <Text style={styles.evalStatusCompleted}>
                    ✓ {i18n.language === "fr" ? "Complétée" : "Completed"}
                  </Text>
                ) : evaluationSummary.day1.isOpen ? (
                  <Text style={styles.evalStatusAvailable}>
                    🔴 {i18n.language === "fr" ? "À faire" : "To do"}
                  </Text>
                ) : (
                  <Text style={styles.evalStatusLocked}>
                    🔒{" "}
                    {i18n.language === "fr"
                      ? "Pas encore disponible"
                      : "Not yet available"}
                  </Text>
                )}
              </View>
            </View>

            {evaluationSummary.day1.isOpen &&
              !evaluationSummary.day1.isCompleted && (
                <TouchableOpacity
                  style={styles.evalButton}
                  onPress={() => handleStartEvaluation("day1")}
                >
                  <Text style={styles.evalButtonText}>
                    📝{" "}
                    {i18n.language === "fr"
                      ? "Faire l'évaluation"
                      : "Take evaluation"}
                  </Text>
                </TouchableOpacity>
              )}
          </View>
        )}

        {/* Day 2 */}
        {evaluationSummary && (
          <View
            style={[
              styles.evalCard,
              evaluationSummary.day2.isCompleted && styles.evalCardCompleted,
            ]}
          >
            <View style={styles.evalHeader}>
              <Text style={styles.evalIcon}>{evaluationSummary.day2.icon}</Text>
              <View style={styles.evalInfo}>
                <Text style={styles.evalTitle}>
                  {i18n.language === "fr"
                    ? "Jour 2 (21 octobre)"
                    : "Day 2 (October 21)"}
                </Text>
                {evaluationSummary.day2.isCompleted ? (
                  <Text style={styles.evalStatusCompleted}>
                    ✓ {i18n.language === "fr" ? "Complétée" : "Completed"}
                  </Text>
                ) : evaluationSummary.day2.canStart &&
                  evaluationSummary.day2.isOpen ? (
                  <Text style={styles.evalStatusAvailable}>
                    🔴 {i18n.language === "fr" ? "À faire" : "To do"}
                  </Text>
                ) : !evaluationSummary.day2.canStart ? (
                  <Text style={styles.evalStatusBlocked}>
                    🔒{" "}
                    {i18n.language === "fr"
                      ? "Complétez Jour 1 d'abord"
                      : "Complete Day 1 first"}
                  </Text>
                ) : (
                  <Text style={styles.evalStatusLocked}>
                    🔒{" "}
                    {i18n.language === "fr"
                      ? "Pas encore disponible"
                      : "Not yet available"}
                  </Text>
                )}
              </View>
            </View>

            {evaluationSummary.day2.canStart &&
              evaluationSummary.day2.isOpen &&
              !evaluationSummary.day2.isCompleted && (
                <TouchableOpacity
                  style={styles.evalButton}
                  onPress={() => handleStartEvaluation("day2")}
                >
                  <Text style={styles.evalButtonText}>
                    📝{" "}
                    {i18n.language === "fr"
                      ? "Faire l'évaluation"
                      : "Take evaluation"}
                  </Text>
                </TouchableOpacity>
              )}
          </View>
        )}

        {/* Final */}
        {evaluationSummary && (
          <View
            style={[
              styles.evalCard,
              evaluationSummary.final.isCompleted && styles.evalCardCompleted,
            ]}
          >
            <View style={styles.evalHeader}>
              <Text style={styles.evalIcon}>
                {evaluationSummary.final.icon}
              </Text>
              <View style={styles.evalInfo}>
                <Text style={styles.evalTitle}>
                  {i18n.language === "fr"
                    ? "Évaluation Finale (22 octobre)"
                    : "Final Evaluation (October 22)"}
                </Text>
                {evaluationSummary.final.isCompleted ? (
                  <Text style={styles.evalStatusCompleted}>
                    ✓ {i18n.language === "fr" ? "Complétée" : "Completed"}
                  </Text>
                ) : evaluationSummary.final.canStart &&
                  evaluationSummary.final.isOpen ? (
                  <Text style={styles.evalStatusAvailable}>
                    🔴 {i18n.language === "fr" ? "À faire" : "To do"}
                  </Text>
                ) : !evaluationSummary.final.canStart ? (
                  <Text style={styles.evalStatusBlocked}>
                    🔒{" "}
                    {i18n.language === "fr"
                      ? "Complétez Jour 1 & 2 d'abord"
                      : "Complete Day 1 & 2 first"}
                  </Text>
                ) : (
                  <Text style={styles.evalStatusLocked}>
                    🔒{" "}
                    {i18n.language === "fr"
                      ? "Pas encore disponible"
                      : "Not yet available"}
                  </Text>
                )}
              </View>
            </View>

            {evaluationSummary.final.canStart &&
              evaluationSummary.final.isOpen &&
              !evaluationSummary.final.isCompleted && (
                <TouchableOpacity
                  style={styles.evalButton}
                  onPress={() => handleStartEvaluation("final")}
                >
                  <Text style={styles.evalButtonText}>
                    📝{" "}
                    {i18n.language === "fr"
                      ? "Faire l'évaluation finale"
                      : "Take final evaluation"}
                  </Text>
                </TouchableOpacity>
              )}
          </View>
        )}
      </View>

      {/* Bouton Programme */}
      <TouchableOpacity
        style={styles.programButton}
        onPress={() => navigation.navigate("Program")}
      >
        <Text style={styles.programButtonIcon}>📅</Text>
        <Text style={styles.programButtonText}>
          {i18n.language === "fr"
            ? "Voir le Programme Complet"
            : "View Full Program"}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLogos: {
    flexDirection: "row",
    gap: 10,
  },
  logoTiny: {
    width: 35,
    height: 35,
  },
  headerText: {
    flex: 1,
    marginLeft: 15,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  headerCode: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    gap: 15,
  },
  refreshBtn: {
    padding: 5,
  },
  refreshIcon: {
    fontSize: 24,
  },
  logoutIcon: {
    fontSize: 28,
  },
  progressSection: {
    backgroundColor: COLORS.white,
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  progressBar: {
    height: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.secondary,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
  },
  evaluationsSection: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 15,
  },
  evalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  evalCardCompleted: {
    borderWidth: 2,
    borderColor: COLORS.secondary,
    backgroundColor: "#F0FDF4",
  },
  evalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  evalIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  evalInfo: {
    flex: 1,
  },
  evalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 5,
  },
  evalStatusCompleted: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: "600",
  },
  evalStatusAvailable: {
    fontSize: 14,
    color: COLORS.danger,
    fontWeight: "600",
  },
  evalStatusLocked: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: "600",
  },
  evalStatusBlocked: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: "600",
  },
  evalButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  evalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  programButton: {
    backgroundColor: COLORS.white,
    margin: 15,
    padding: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  programButtonIcon: {
    fontSize: 28,
    marginRight: 10,
  },
  programButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
});

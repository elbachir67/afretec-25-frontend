import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getParticipantByCode } from "../../services/participantService";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../services/firebase";

const COLORS = {
  primary: "#1E40AF",
  secondary: "#10B981",
  accent: "#F59E0B",
  gray: "#6B7280",
  lightGray: "#F3F4F6",
  white: "#FFFFFF",
  black: "#111827",
  gold: "#FCD34D",
};

export default function DashboardScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [participant, setParticipant] = useState(null);
  const [rank, setRank] = useState(0);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [currentActivity, setCurrentActivity] = useState(null);

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

      // Calculer rang
      const participantsSnapshot = await getDocs(
        collection(db, "participants")
      );
      const allParticipants = participantsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));

      let currentRank = 0;
      allParticipants.forEach((p, index) => {
        if (p.code === code) {
          currentRank = index + 1;
        }
      });

      setRank(currentRank);
      setTotalParticipants(participantsSnapshot.size);

      // Charger activité en cours (la dernière completed)
      console.log("🔍 Recherche activités terminées...");
      const activitiesSnapshot = await getDocs(
        query(collection(db, "activities"), where("isCompleted", "==", true))
      );

      console.log("📊 Activités terminées trouvées:", activitiesSnapshot.size);

      if (!activitiesSnapshot.empty) {
        // Convertir en array et trier par actualEnd (plus récent en premier)
        const completedActivities = activitiesSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => {
            const timeA = a.actualEnd?.toDate?.() || new Date(0);
            const timeB = b.actualEnd?.toDate?.() || new Date(0);
            return timeB - timeA; // Plus récent en premier
          });

        const lastActivity = completedActivities[0];

        console.log("✅ Activité sélectionnée:", lastActivity.title);
        setCurrentActivity(lastActivity);
      } else {
        console.log("❌ Aucune activité terminée trouvée");
        setCurrentActivity(null);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("participantCode");
    await AsyncStorage.removeItem("participantId");
    navigation.navigate("Welcome");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("../../../assets/images/logo_ucad.png")}
          style={styles.logoSmall}
          resizeMode="contain"
        />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Afretec Pulse</Text>
          <Text style={styles.headerCode}>{participant?.code}</Text>
        </View>
        <TouchableOpacity onPress={loadData} style={{ marginRight: 15 }}>
          <Text style={styles.refreshBtn}>🔄</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutBtn}>🚪</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{t("yourPoints")}</Text>
          <Text style={styles.statValue}>{participant?.totalPoints || 0}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{t("yourRank")}</Text>
          <Text style={styles.statValue}>
            #{rank}/{totalParticipants}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(
                  ((participant?.totalPoints || 0) / 100) * 100,
                  100
                )}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>Progress towards next badge</Text>
      </View>

      {/* Current Activity */}
      {loading ? (
        <View style={styles.activityCard}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t("loadingActivities")}</Text>
        </View>
      ) : currentActivity ? (
        <View style={styles.activityCard}>
          <Text style={styles.activityLabel}>🔔 {t("availableActivity")}</Text>
          <Text style={styles.activityTitle}>
            {currentActivity.title?.[i18n.language] ||
              currentActivity.title?.en ||
              "Activity"}
          </Text>
          <TouchableOpacity
            style={styles.pulseBtn}
            onPress={() =>
              navigation.navigate("MicroEval", {
                activity: currentActivity,
                participant: participant,
              })
            }
          >
            <Text style={styles.pulseBtnText}>{t("pulseNow")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.activityCard}>
          <Text style={styles.activityLabel}>
            ℹ️ {t("noActivityAvailable")}
          </Text>
          <Text style={styles.noActivityText}>{t("noActivityText")}</Text>
          <TouchableOpacity
            style={styles.refreshBtnContainer}
            onPress={loadData}
          >
            <Text style={styles.refreshBtnText}>🔄 {t("refresh")}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Navigation Buttons */}
      <View style={styles.navButtons}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation.navigate("Badges")}
        >
          <Text style={styles.navBtnIcon}>🏅</Text>
          <Text style={styles.navBtnText}>{t("myBadges")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation.navigate("Leaderboard")}
        >
          <Text style={styles.navBtnIcon}>📊</Text>
          <Text style={styles.navBtnText}>{t("leaderboard")}</Text>
        </TouchableOpacity>
      </View>
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
  logoSmall: {
    width: 50,
    height: 50,
  },
  headerText: {
    flex: 1,
    marginLeft: 15,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  headerCode: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: "600",
  },
  refreshBtn: {
    fontSize: 24,
  },
  logoutBtn: {
    fontSize: 28,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 15,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    color: COLORS.gray,
    fontSize: 14,
    marginBottom: 8,
  },
  statValue: {
    color: COLORS.primary,
    fontSize: 32,
    fontWeight: "bold",
  },
  progressContainer: {
    padding: 15,
  },
  progressBar: {
    height: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 5,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.gold,
  },
  progressText: {
    color: COLORS.gray,
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },
  activityCard: {
    margin: 15,
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 15,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.secondary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityLabel: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  activityTitle: {
    color: COLORS.black,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  pulseBtn: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  pulseBtnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingText: {
    color: COLORS.gray,
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
  noActivityText: {
    color: COLORS.gray,
    fontSize: 14,
    textAlign: "center",
    marginVertical: 15,
  },
  refreshBtnContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  refreshBtnText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  navButtons: {
    flexDirection: "row",
    padding: 15,
    gap: 15,
    marginBottom: 30,
  },
  navBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navBtnIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  navBtnText: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: "600",
  },
});

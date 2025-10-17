import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getParticipantByCode } from "../../services/participantService";
import { BADGES, getBadgeProgress } from "../../services/gamificationService";

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

export default function BadgesScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [participant, setParticipant] = useState(null);
  const [progress, setProgress] = useState({});

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

      const participantData = await getParticipantByCode(code);
      setParticipant(participantData);

      const progressData = await getBadgeProgress(participantData);
      setProgress(progressData);
    } catch (error) {
      console.error("Error loading badges:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderBadge = badge => {
    const isUnlocked = participant?.badges?.includes(badge.id);
    const badgeProgress = progress[badge.id];
    const progressPercent = badgeProgress
      ? Math.min((badgeProgress.current / badgeProgress.target) * 100, 100)
      : 0;

    return (
      <View
        key={badge.id}
        style={[styles.badgeCard, isUnlocked && styles.badgeCardUnlocked]}
      >
        <View style={styles.badgeHeader}>
          <Text
            style={[styles.badgeIcon, !isUnlocked && styles.badgeIconLocked]}
          >
            {badge.icon}
          </Text>
          {isUnlocked && (
            <View style={styles.unlockedBadge}>
              <Text style={styles.unlockedText}>✓ {t("unlocked")}</Text>
            </View>
          )}
        </View>

        <Text style={styles.badgeName}>
          {badge.name[i18n.language] || badge.name.en}
        </Text>

        <Text style={styles.badgeDescription}>
          {badge.description[i18n.language] || badge.description.en}
        </Text>

        <Text style={styles.badgeBonus}>+{badge.bonus} points bonus</Text>

        {!isUnlocked && badgeProgress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${progressPercent}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {badgeProgress.current} / {badgeProgress.target}
            </Text>
          </View>
        )}

        {!isUnlocked && (
          <View style={styles.lockedOverlay}>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Dashboard")}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏅 {t("myBadges")}</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Stats */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Your Progress</Text>
        <Text style={styles.statsValue}>
          {participant?.badges?.length || 0} / {BADGES.length}
        </Text>
        <Text style={styles.statsLabel}>Badges Unlocked</Text>
      </View>

      {/* Badges Grid */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.badgesGrid}>{BADGES.map(renderBadge)}</View>
      </ScrollView>
    </View>
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
  backBtn: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
  },
  statsCard: {
    backgroundColor: COLORS.white,
    margin: 15,
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    color: COLORS.gray,
    fontSize: 14,
    marginBottom: 10,
  },
  statsValue: {
    color: COLORS.primary,
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 5,
  },
  statsLabel: {
    color: COLORS.gray,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  badgesGrid: {
    padding: 15,
    gap: 15,
  },
  badgeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  badgeCardUnlocked: {
    borderWidth: 3,
    borderColor: COLORS.gold,
  },
  badgeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  badgeIcon: {
    fontSize: 60,
  },
  badgeIconLocked: {
    opacity: 0.3,
  },
  unlockedBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  unlockedText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  badgeName: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
  },
  badgeDescription: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 10,
  },
  badgeBonus: {
    fontSize: 14,
    color: COLORS.gold,
    fontWeight: "bold",
  },
  progressContainer: {
    marginTop: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 5,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: "center",
  },
  lockedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  lockIcon: {
    fontSize: 40,
  },
});

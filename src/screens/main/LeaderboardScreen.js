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
import { collection, getDocs } from "firebase/firestore";
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

const BADGE_ICONS = {
  network_builder: "🥇",
  speed_thinker: "🔥",
  insight_master: "💎",
  conference_champion: "👑",
  afretec_ambassador: "🌍",
};

export default function LeaderboardScreen({ navigation }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myCode, setMyCode] = useState(null);
  const [myRank, setMyRank] = useState(null);

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

      setMyCode(code);

      // Charger tous les participants et trier
      const participantsSnap = await getDocs(collection(db, "participants"));

      const allParticipants = participantsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
        .map((p, index) => ({
          rank: index + 1,
          code: p.code,
          points: p.totalPoints || 0,
          badges: p.badges || [],
        }));

      // Trouver mon rang
      const myPosition = allParticipants.find(p => p.code === code);
      if (myPosition) {
        setMyRank(myPosition.rank);
      }

      setLeaderboard(allParticipants);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankStyle = rank => {
    if (rank === 1) return styles.rank1;
    if (rank === 2) return styles.rank2;
    if (rank === 3) return styles.rank3;
    return styles.rankOther;
  };

  const getRankIcon = rank => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const renderParticipant = participant => {
    const isMe = participant.code === myCode;

    return (
      <View
        key={participant.code}
        style={[styles.participantCard, isMe && styles.participantCardMe]}
      >
        <View style={styles.participantLeft}>
          <View style={[styles.rankBadge, getRankStyle(participant.rank)]}>
            <Text style={styles.rankText}>{getRankIcon(participant.rank)}</Text>
          </View>

          <View style={styles.participantInfo}>
            <Text
              style={[styles.participantCode, isMe && styles.participantCodeMe]}
            >
              {participant.code}
              {isMe && " (You)"}
            </Text>
            <View style={styles.badgesContainer}>
              {participant.badges.map(badgeId => (
                <Text key={badgeId} style={styles.badgeIcon}>
                  {BADGE_ICONS[badgeId] || "🏅"}
                </Text>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.participantRight}>
          <Text style={styles.points}>{participant.points}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
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
        <Text style={styles.headerTitle}>📊 {t("leaderboard")}</Text>
        <TouchableOpacity onPress={loadData}>
          <Text style={styles.refreshBtn}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* My Position */}
      {myRank && (
        <View style={styles.myPositionCard}>
          <Text style={styles.myPositionLabel}>Your Position</Text>
          <View style={styles.myPositionContent}>
            <View style={[styles.myRankBadge, getRankStyle(myRank)]}>
              <Text style={styles.myRankText}>{getRankIcon(myRank)}</Text>
            </View>
            <View style={styles.myPositionInfo}>
              <Text style={styles.myPositionRank}>
                Rank #{myRank} / {leaderboard.length}
              </Text>
              <Text style={styles.myPositionSubtext}>
                {myRank <= 3
                  ? "Amazing! 🎉"
                  : myRank <= 10
                  ? "Great job! 🔥"
                  : "Keep pushing! 💪"}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Podium (Top 3) */}
      {leaderboard.length >= 3 && (
        <View style={styles.podiumContainer}>
          <View style={styles.podium}>
            {/* 2nd Place */}
            <View style={styles.podiumPlace}>
              <Text style={styles.podiumRank}>🥈</Text>
              <View style={[styles.podiumBar, styles.podiumBar2]}>
                <Text style={styles.podiumCode}>{leaderboard[1].code}</Text>
                <Text style={styles.podiumPoints}>{leaderboard[1].points}</Text>
              </View>
            </View>

            {/* 1st Place */}
            <View style={styles.podiumPlace}>
              <Text style={styles.podiumRank}>🥇</Text>
              <View style={[styles.podiumBar, styles.podiumBar1]}>
                <Text style={styles.podiumCode}>{leaderboard[0].code}</Text>
                <Text style={styles.podiumPoints}>{leaderboard[0].points}</Text>
              </View>
            </View>

            {/* 3rd Place */}
            <View style={styles.podiumPlace}>
              <Text style={styles.podiumRank}>🥉</Text>
              <View style={[styles.podiumBar, styles.podiumBar3]}>
                <Text style={styles.podiumCode}>{leaderboard[2].code}</Text>
                <Text style={styles.podiumPoints}>{leaderboard[2].points}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Full List */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>All Participants</Text>
        <Text style={styles.listCount}>{leaderboard.length} participants</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.participantsList}>
          {leaderboard.map(renderParticipant)}
        </View>
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
  refreshBtn: {
    color: COLORS.white,
    fontSize: 24,
  },
  myPositionCard: {
    backgroundColor: COLORS.primary,
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  myPositionLabel: {
    color: COLORS.white,
    fontSize: 14,
    marginBottom: 10,
    opacity: 0.9,
  },
  myPositionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  myRankBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  myRankText: {
    fontSize: 28,
  },
  myPositionInfo: {
    flex: 1,
  },
  myPositionRank: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  myPositionSubtext: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: "600",
  },
  podiumContainer: {
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
  podium: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 10,
  },
  podiumPlace: {
    flex: 1,
    alignItems: "center",
  },
  podiumRank: {
    fontSize: 36,
    marginBottom: 10,
  },
  podiumBar: {
    width: "100%",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  podiumBar1: {
    backgroundColor: COLORS.gold,
    height: 120,
  },
  podiumBar2: {
    backgroundColor: "#C0C0C0",
    height: 100,
  },
  podiumBar3: {
    backgroundColor: "#CD7F32",
    height: 80,
  },
  podiumCode: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 5,
  },
  podiumPoints: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  listCount: {
    fontSize: 14,
    color: COLORS.gray,
  },
  scrollView: {
    flex: 1,
  },
  participantsList: {
    padding: 15,
    gap: 10,
  },
  participantCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  participantCardMe: {
    borderWidth: 3,
    borderColor: COLORS.primary,
    backgroundColor: "#EEF2FF",
  },
  participantLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rank1: {
    backgroundColor: COLORS.gold,
  },
  rank2: {
    backgroundColor: "#C0C0C0",
  },
  rank3: {
    backgroundColor: "#CD7F32",
  },
  rankOther: {
    backgroundColor: COLORS.lightGray,
  },
  rankText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  participantInfo: {
    flex: 1,
  },
  participantCode: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  participantCodeMe: {
    color: COLORS.primary,
  },
  badgesContainer: {
    flexDirection: "row",
    gap: 4,
  },
  badgeIcon: {
    fontSize: 16,
  },
  participantRight: {
    alignItems: "flex-end",
  },
  points: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  pointsLabel: {
    fontSize: 12,
    color: COLORS.gray,
  },
});

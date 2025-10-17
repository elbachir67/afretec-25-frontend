import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import {
  getProgramByDay,
  formatActivityForDisplay,
} from "../../services/programService";

const COLORS = {
  primary: "#1E40AF",
  secondary: "#10B981",
  accent: "#F59E0B",
  gray: "#6B7280",
  lightGray: "#F3F4F6",
  white: "#FFFFFF",
  black: "#111827",
};

export default function ProgramScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const [selectedDay, setSelectedDay] = useState(1);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgram();
  }, [selectedDay]);

  const loadProgram = async () => {
    try {
      setLoading(true);
      const dayActivities = await getProgramByDay(selectedDay);
      setActivities(dayActivities);
    } catch (error) {
      console.error("Error loading program:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderActivity = activity => {
    const formatted = formatActivityForDisplay(activity, i18n.language);

    return (
      <View
        key={activity.id}
        style={[styles.activityCard, { borderLeftColor: formatted.typeColor }]}
      >
        {/* Horaire */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatted.timeRange}</Text>
        </View>

        {/* Titre et Type */}
        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.activityTitle}>{formatted.displayTitle}</Text>
            <Text style={styles.typeIcon}>{formatted.typeIcon}</Text>
          </View>

          <View style={styles.typeBadge}>
            <Text style={[styles.typeText, { color: formatted.typeColor }]}>
              {formatted.typeLabel}
            </Text>
          </View>

          {/* Description */}
          {formatted.displayDescription && (
            <Text style={styles.activityDescription}>
              {formatted.displayDescription}
            </Text>
          )}

          {/* Speakers */}
          {activity.speakers && activity.speakers.length > 0 && (
            <View style={styles.speakersContainer}>
              <Text style={styles.speakersLabel}>
                {i18n.language === "fr" ? "Intervenants :" : "Speakers:"}
              </Text>
              {activity.speakers.slice(0, 3).map((speaker, index) => (
                <Text key={index} style={styles.speakerName}>
                  • {speaker}
                </Text>
              ))}
              {activity.speakers.length > 3 && (
                <Text style={styles.moreText}>
                  +{activity.speakers.length - 3}{" "}
                  {i18n.language === "fr" ? "autre(s)" : "more"}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← {t("back")}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          📅 {i18n.language === "fr" ? "Programme" : "Program"}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Day Tabs */}
      <View style={styles.tabsContainer}>
        {[1, 2, 3].map(day => (
          <TouchableOpacity
            key={day}
            style={[styles.tab, selectedDay === day && styles.tabActive]}
            onPress={() => setSelectedDay(day)}
          >
            <Text
              style={[
                styles.tabText,
                selectedDay === day && styles.tabTextActive,
              ]}
            >
              {i18n.language === "fr" ? `Jour ${day}` : `Day ${day}`}
            </Text>
            <Text style={styles.tabDate}>
              {day === 1 && "Oct 20"}
              {day === 2 && "Oct 21"}
              {day === 3 && "Oct 22"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Activities List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.activitiesList}>
            {activities.map(renderActivity)}
          </View>
          <View style={{ height: 20 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 22,
    fontWeight: "bold",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    padding: 15,
    gap: 10,
  },
  tab: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.gray,
    marginBottom: 5,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  tabDate: {
    fontSize: 12,
    color: COLORS.gray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  activitiesList: {
    padding: 15,
  },
  activityCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 5,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeContainer: {
    width: 80,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  timeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.gray,
    textAlign: "center",
  },
  contentContainer: {
    flex: 1,
    padding: 15,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  activityTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginRight: 10,
  },
  typeIcon: {
    fontSize: 24,
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    marginBottom: 10,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  activityDescription: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 10,
    lineHeight: 20,
  },
  speakersContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  speakersLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 5,
  },
  speakerName: {
    fontSize: 13,
    color: COLORS.gray,
    marginLeft: 5,
    marginBottom: 3,
  },
  moreText: {
    fontSize: 12,
    color: COLORS.primary,
    fontStyle: "italic",
    marginLeft: 5,
    marginTop: 3,
  },
});

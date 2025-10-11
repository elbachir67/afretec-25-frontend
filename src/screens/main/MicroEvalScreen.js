import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import { useTranslation } from "react-i18next";
import ConfettiCannon from "react-native-confetti-cannon";
import StarRating from "../../components/StarRating";
import ThumbsRating from "../../components/ThumbsRating";
import {
  submitMicroEvaluation,
  checkExistingEvaluation,
} from "../../services/evaluationService";
import { QUESTION_TEMPLATES } from "../../constants/questionTemplates";

const COLORS = {
  primary: "#1E40AF",
  secondary: "#10B981",
  gray: "#6B7280",
  lightGray: "#F3F4F6",
  white: "#FFFFFF",
  black: "#111827",
  gold: "#FCD34D",
};

export default function MicroEvalScreen({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const { activity, participant } = route.params;

  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [bonusDetails, setBonusDetails] = useState([]);

  useEffect(() => {
    checkIfAlreadyAnswered();
  }, []);

  const checkIfAlreadyAnswered = async () => {
    const alreadyAnswered = await checkExistingEvaluation(
      participant.code,
      activity.id
    );

    if (alreadyAnswered) {
      Alert.alert("Déjà répondu", "Vous avez déjà pulsé cette session !", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    }
  };

  const getQuestions = () => {
    const type = activity.type || "plenary";
    return QUESTION_TEMPLATES[type] || QUESTION_TEMPLATES.plenary;
  };

  const handleSubmit = async () => {
    // Vérifier que toutes les questions obligatoires sont remplies
    const questions = getQuestions();
    const missingRequired = questions
      .filter(q => !q.optional)
      .some(q => !responses[q.id]);

    if (missingRequired) {
      Alert.alert("Attention", "Veuillez répondre à toutes les questions");
      return;
    }

    setLoading(true);

    try {
      const result = await submitMicroEvaluation(
        participant.code,
        participant.id,
        activity.id,
        responses
      );

      setPointsEarned(result.pointsEarned);
      setBonusDetails(result.bonusDetails);
      setShowSuccess(true);

      // Fermer après 3 secondes
      setTimeout(() => {
        setShowSuccess(false);
        navigation.goBack();
      }, 3000);
    } catch (error) {
      console.error("Submit error:", error);

      if (error.message === "Already answered") {
        Alert.alert("Erreur", "Vous avez déjà répondu à cette activité");
      } else {
        Alert.alert("Erreur", "Échec de la soumission. Réessayez.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = question => {
    const lang = i18n.language;

    return (
      <View key={question.id} style={styles.questionCard}>
        <Text style={styles.questionText}>
          {question.question[lang] || question.question.fr}
          {question.optional && (
            <Text style={styles.optional}> (optionnel)</Text>
          )}
        </Text>

        {question.type === "star" && (
          <StarRating
            value={responses[question.id] || 0}
            onChange={value =>
              setResponses({ ...responses, [question.id]: value })
            }
            max={question.max || 4}
          />
        )}

        {question.type === "thumbs" && (
          <ThumbsRating
            value={responses[question.id]}
            onChange={value =>
              setResponses({ ...responses, [question.id]: value })
            }
          />
        )}

        {question.type === "choice" && (
          <View style={styles.choicesContainer}>
            {question.options.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.choiceBtn,
                  responses[question.id] === option.value &&
                    styles.choiceBtnActive,
                ]}
                onPress={() =>
                  setResponses({ ...responses, [question.id]: option.value })
                }
              >
                <Text
                  style={[
                    styles.choiceText,
                    responses[question.id] === option.value &&
                      styles.choiceTextActive,
                  ]}
                >
                  {option.label[lang] || option.label.fr}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {question.type === "text" && (
          <View>
            <TextInput
              style={styles.textInput}
              placeholder={question.question[lang]}
              value={responses[question.id] || ""}
              onChangeText={text =>
                setResponses({ ...responses, [question.id]: text })
              }
              maxLength={question.maxLength || 100}
              multiline
            />
            {question.bonusPoints && (
              <Text style={styles.bonusHint}>
                +{question.bonusPoints} points bonus !
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>⚡ Feedback Rapide</Text>
        </View>

        {/* Activity Title */}
        <View style={styles.activityHeader}>
          <Text style={styles.activityTitle}>
            {activity.title?.[i18n.language] || activity.title?.fr}
          </Text>
        </View>

        {/* Questions */}
        {getQuestions().map(renderQuestion)}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>
            {loading ? "Envoi..." : "Soumettre & Gagner Points 🎯"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Success Modal with Confetti */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.successModal}>
          <ConfettiCannon count={150} origin={{ x: -10, y: 0 }} fadeOut />
          <View style={styles.successBox}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successTitle}>Merci !</Text>
            <Text style={styles.successPoints}>+{pointsEarned} points !</Text>

            {bonusDetails.length > 0 && (
              <View style={styles.bonusContainer}>
                {bonusDetails.map((bonus, i) => (
                  <Text key={i} style={styles.bonusText}>
                    {bonus.type === "comment" &&
                      `📝 +${bonus.points} (commentaire)`}
                    {bonus.type === "early_bird" &&
                      `⚡ +${bonus.points} (Early Bird)`}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 50,
  },
  backBtn: {
    color: COLORS.white,
    fontSize: 16,
    marginBottom: 10,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
  },
  activityHeader: {
    backgroundColor: COLORS.white,
    padding: 20,
    margin: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  questionCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    margin: 15,
    marginTop: 0,
    borderRadius: 10,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 15,
  },
  optional: {
    color: COLORS.gray,
    fontSize: 14,
    fontStyle: "italic",
  },
  choicesContainer: {
    gap: 10,
  },
  choiceBtn: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.lightGray,
  },
  choiceBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "20",
  },
  choiceText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: "center",
    fontWeight: "600",
  },
  choiceTextActive: {
    color: COLORS.primary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
  },
  bonusHint: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 8,
    textAlign: "right",
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    margin: 15,
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  successModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  successBox: {
    backgroundColor: COLORS.white,
    padding: 40,
    borderRadius: 20,
    alignItems: "center",
    minWidth: 280,
  },
  successEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 10,
  },
  successPoints: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 20,
  },
  bonusContainer: {
    gap: 8,
  },
  bonusText: {
    fontSize: 14,
    color: COLORS.gold,
    fontWeight: "600",
  },
});

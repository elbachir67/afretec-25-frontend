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
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  submitEvaluation,
  canSubmitEvaluation,
} from "../../services/evaluationService";

const COLORS = {
  primary: "#1E40AF",
  secondary: "#10B981",
  gray: "#6B7280",
  lightGray: "#F3F4F6",
  white: "#FFFFFF",
  black: "#111827",
  gold: "#FCD34D",
};

export default function EvaluationScreen({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const { evaluationType, participant } = route.params;

  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadParticipantInfo();
    checkEligibility();
  }, []);

  const loadParticipantInfo = async () => {
    try {
      const savedName = await AsyncStorage.getItem("participantName");
      const savedInstitution = await AsyncStorage.getItem(
        "participantInstitution"
      );
      const savedEmail = await AsyncStorage.getItem("participantEmail");

      setName(savedName || "");
      setInstitution(savedInstitution || "");

      setResponses({
        name: savedName || "",
        organization: savedInstitution || "",
        email: savedEmail || "",
      });
    } catch (error) {
      console.error("Error loading participant info:", error);
    }
  };

  const checkEligibility = async () => {
    try {
      const eligibility = await canSubmitEvaluation(
        participant.code,
        evaluationType
      );

      if (!eligibility.canSubmit) {
        let message = "Cannot submit evaluation";

        if (eligibility.reason === "evaluation_closed") {
          message =
            i18n.language === "fr"
              ? "Cette évaluation est fermée"
              : "This evaluation is closed";
        } else if (eligibility.reason === "already_completed") {
          message =
            i18n.language === "fr"
              ? "Vous avez déjà complété cette évaluation"
              : "You have already completed this evaluation";
        } else if (eligibility.reason === "requires_day1") {
          message =
            i18n.language === "fr"
              ? "Veuillez compléter l'évaluation du Jour 1 d'abord"
              : "Please complete Day 1 evaluation first";
        } else if (eligibility.reason === "requires_day1_and_day2") {
          message =
            i18n.language === "fr"
              ? "Veuillez compléter les évaluations du Jour 1 et Jour 2 d'abord"
              : "Please complete Day 1 and Day 2 evaluations first";
        }

        Alert.alert(
          i18n.language === "fr" ? "Non disponible" : "Not available",
          message,
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error("Error checking eligibility:", error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      await submitEvaluation(participant.code, evaluationType, responses);

      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        navigation.goBack();
      }, 2000);
    } catch (error) {
      console.error("Submit error:", error);

      let errorMessage = error.message || "Failed to submit evaluation";

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getEvaluationTitle = () => {
    if (evaluationType === "day1") {
      return i18n.language === "fr" ? "Évaluation Jour 1" : "Day 1 Evaluation";
    } else if (evaluationType === "day2") {
      return i18n.language === "fr" ? "Évaluation Jour 2" : "Day 2 Evaluation";
    } else {
      return i18n.language === "fr" ? "Évaluation Finale" : "Final Evaluation";
    }
  };

  const renderChoice = (questionKey, options) => {
    return (
      <View style={styles.choicesContainer}>
        {options.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.choiceBtn,
              responses[questionKey] === option.value && styles.choiceBtnActive,
            ]}
            onPress={() =>
              setResponses({ ...responses, [questionKey]: option.value })
            }
          >
            <Text
              style={[
                styles.choiceText,
                responses[questionKey] === option.value &&
                  styles.choiceTextActive,
              ]}
            >
              {i18n.language === "fr" ? option.labelFr : option.labelEn}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // PART A : Day 1 & Day 2 Evaluation
  const renderDayEvaluation = () => {
    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← {t("back")}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getEvaluationTitle()}</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Section 1: Informations générales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {i18n.language === "fr"
              ? "1. Informations générales"
              : "1. General Information"}
          </Text>

          {/* Nom (optionnel) - Pré-rempli */}
          <View style={styles.questionBlock}>
            <Text style={styles.questionLabel}>
              {i18n.language === "fr" ? "Nom (optionnel)" : "Name (optional)"}
            </Text>
            <Text style={styles.prefilledText}>{name || "N/A"}</Text>
          </View>

          {/* Organisation - Pré-remplie */}
          <View style={styles.questionBlock}>
            <Text style={styles.questionLabel}>
              {i18n.language === "fr" ? "Organisation" : "Organization"}
            </Text>
            <Text style={styles.prefilledText}>{institution || "N/A"}</Text>
          </View>

          {/* Rôle */}
          <View style={styles.questionBlock}>
            <Text style={styles.questionLabel}>
              {i18n.language === "fr"
                ? "Votre rôle pendant la conférence"
                : "Your role during the conference"}
            </Text>
            {renderChoice("role", [
              {
                value: "attendee",
                labelFr: "Participant",
                labelEn: "Attendee",
              },
              { value: "speaker", labelFr: "Intervenant", labelEn: "Speaker" },
              {
                value: "organizer",
                labelFr: "Organisateur",
                labelEn: "Organizer",
              },
              { value: "other", labelFr: "Autre", labelEn: "Other" },
            ])}
            {responses.role === "other" && (
              <TextInput
                style={styles.textInput}
                placeholder={
                  i18n.language === "fr" ? "Précisez..." : "Specify..."
                }
                value={responses.role_other || ""}
                onChangeText={text =>
                  setResponses({ ...responses, role_other: text })
                }
              />
            )}
          </View>
        </View>

        {/* Section 2: Logistique et organisation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {i18n.language === "fr"
              ? "2. Logistique et organisation"
              : "2. Logistics and Organization"}
          </Text>

          {/* Q1: Qualité accueil */}
          <View style={styles.questionBlock}>
            <Text style={styles.questionLabel}>
              {i18n.language === "fr"
                ? "Comment évaluez-vous la qualité de l'accueil et de l'enregistrement ?"
                : "How would you rate the quality of reception and registration?"}
            </Text>
            {renderChoice("reception_quality", [
              {
                value: "excellent",
                labelFr: "Excellent",
                labelEn: "Excellent",
              },
              { value: "good", labelFr: "Bon", labelEn: "Good" },
              { value: "average", labelFr: "Moyen", labelEn: "Average" },
              {
                value: "needs_improvement",
                labelFr: "À améliorer",
                labelEn: "Needs improvement",
              },
            ])}
          </View>

          {/* Q2: Informations pratiques */}
          <View style={styles.questionBlock}>
            <Text style={styles.questionLabel}>
              {i18n.language === "fr"
                ? "Les informations pratiques (lieu, horaires, programme) étaient-elles claires et accessibles ?"
                : "Was practical information (venue, schedule, program) clear and accessible?"}
            </Text>
            {renderChoice("info_clear", [
              { value: "yes", labelFr: "Oui", labelEn: "Yes" },
              {
                value: "partially",
                labelFr: "Partiellement",
                labelEn: "Partially",
              },
              { value: "no", labelFr: "Non", labelEn: "No" },
            ])}
          </View>

          {/* Q3: Conditions matérielles */}
          <View style={styles.questionBlock}>
            <Text style={styles.questionLabel}>
              {i18n.language === "fr"
                ? "Comment jugez-vous les conditions matérielles (salles, équipements, restauration, signalétique) ?"
                : "How would you rate the facilities (rooms, equipment, catering, signage)?"}
            </Text>
            {renderChoice("facilities", [
              {
                value: "very_satisfactory",
                labelFr: "Très satisfaisantes",
                labelEn: "Very satisfactory",
              },
              {
                value: "satisfactory",
                labelFr: "Satisfaisantes",
                labelEn: "Satisfactory",
              },
              {
                value: "unsatisfactory",
                labelFr: "Peu satisfaisantes",
                labelEn: "Unsatisfactory",
              },
              { value: "poor", labelFr: "Insatisfaisantes", labelEn: "Poor" },
            ])}
          </View>

          {/* Q4: Difficultés logistiques */}
          <View style={styles.questionBlock}>
            <Text style={styles.questionLabel}>
              {i18n.language === "fr"
                ? "Avez-vous rencontré des difficultés logistiques ?"
                : "Did you encounter any logistical issues?"}
            </Text>
            {renderChoice("logistical_issues", [
              { value: "yes", labelFr: "Oui", labelEn: "Yes" },
              { value: "no", labelFr: "Non", labelEn: "No" },
            ])}
            {responses.logistical_issues === "yes" && (
              <TextInput
                style={styles.textInput}
                placeholder={
                  i18n.language === "fr"
                    ? "Si oui, lesquelles ?"
                    : "If yes, please specify"
                }
                value={responses.logistical_issues_details || ""}
                onChangeText={text =>
                  setResponses({
                    ...responses,
                    logistical_issues_details: text,
                  })
                }
                multiline
              />
            )}
          </View>
        </View>

        {/* Section 3: Planning et respect des horaires */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {i18n.language === "fr"
              ? "3. Planning et respect des horaires"
              : "3. Planning and Time Management"}
          </Text>

          {/* Q1: Programme structuré */}
          <View style={styles.questionBlock}>
            <Text style={styles.questionLabel}>
              {i18n.language === "fr"
                ? "Le programme de la conférence était-il bien structuré et équilibré ?"
                : "Was the conference program well structured and balanced?"}
            </Text>
            {renderChoice("program_structured", [
              { value: "yes", labelFr: "Oui", labelEn: "Yes" },
              {
                value: "moderately",
                labelFr: "Moyennement",
                labelEn: "Moderately",
              },
              { value: "no", labelFr: "Non", labelEn: "No" },
            ])}
          </View>

          {/* Q2: Ponctualité */}
          <View style={styles.questionBlock}>
            <Text style={styles.questionLabel}>
              {i18n.language === "fr"
                ? "Les sessions ont-elles commencé et terminé à l'heure prévue ?"
                : "Did sessions start and end on time?"}
            </Text>
            {renderChoice("sessions_on_time", [
              { value: "always", labelFr: "Toujours", labelEn: "Always" },
              {
                value: "most_time",
                labelFr: "La plupart du temps",
                labelEn: "Most of the time",
              },
              { value: "rarely", labelFr: "Rarement", labelEn: "Rarely" },
              { value: "never", labelFr: "Jamais", labelEn: "Never" },
            ])}
          </View>

          {/* Q3: Temps pour échanges */}
          <View style={styles.questionBlock}>
            <Text style={styles.questionLabel}>
              {i18n.language === "fr"
                ? "Avez-vous eu suffisamment de temps pour les échanges et les pauses ?"
                : "Was there enough time for networking and breaks?"}
            </Text>
            {renderChoice("enough_time_networking", [
              { value: "yes", labelFr: "Oui", labelEn: "Yes" },
              { value: "no", labelFr: "Non", labelEn: "No" },
            ])}
          </View>
        </View>

        {/* Section 4: Recommandations et suggestions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {i18n.language === "fr"
              ? "4. Recommandations et suggestions"
              : "4. Recommendations and Suggestions"}
          </Text>

          {/* Q1: Ce que vous avez apprécié */}
          <View style={styles.questionBlock}>
            <Text style={styles.questionLabel}>
              {i18n.language === "fr"
                ? "Qu'avez-vous le plus apprécié durant la conférence ?"
                : "What did you appreciate most during the conference?"}
            </Text>
            <TextInput
              style={[styles.textInput, styles.textInputLarge]}
              placeholder={
                i18n.language === "fr" ? "Votre réponse..." : "Your answer..."
              }
              value={responses.most_appreciated || ""}
              onChangeText={text =>
                setResponses({ ...responses, most_appreciated: text })
              }
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Q2: Améliorations suggérées */}
          <View style={styles.questionBlock}>
            <Text style={styles.questionLabel}>
              {i18n.language === "fr"
                ? "Quelles améliorations suggérez-vous pour les prochaines éditions ?"
                : "What improvements would you suggest for future editions?"}
            </Text>
            <TextInput
              style={[styles.textInput, styles.textInputLarge]}
              placeholder={
                i18n.language === "fr"
                  ? "Vos suggestions..."
                  : "Your suggestions..."
              }
              value={responses.improvements_suggested || ""}
              onChangeText={text =>
                setResponses({ ...responses, improvements_suggested: text })
              }
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Bouton Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>
            {loading
              ? i18n.language === "fr"
                ? "Envoi..."
                : "Submitting..."
              : i18n.language === "fr"
              ? "Soumettre"
              : "Submit"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  // PART B : Final Evaluation (15 questions en 6 sections)
  const renderFinalEvaluation = () => {
    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← {t("back")}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getEvaluationTitle()}</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Section 1: Complete Identification */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {i18n.language === "fr"
              ? "1. Identification complète"
              : "1. Complete Identification"}
          </Text>

          {/* Q1-3: Name, Email, Organization - Pré-remplis */}
          <View style={styles.questionBlock}>
            <Text style={styles.questionLabel}>
              {i18n.language === "fr" ? "Nom" : "Name"}
            </Text>
            <Text style={styles.prefilledText}>{name || "N/A"}</Text>
          </View>

          <View style={styles.questionBlock}>
            <Text style={styles.questionLabel}>Email</Text>
            <Text style={styles.prefilledText}>{responses.email || "N/A"}</Text>
          </View>

          <View style={styles.questionBlock}>
            <Text style={styles.questionLabel}>
              {i18n.language === "fr"
                ? "Université / Organisation"
                : "University / Organization"}
            </Text>
            <Text style={styles.prefilledText}>{institution || "N/A"}</Text>
          </View>

          {/* Q4: Your role */}
          <View style={styles.questionBlock}>
            <Text style={styles.questionLabel}>
              {i18n.language === "fr" ? "Votre rôle" : "Your role"}
            </Text>
            {renderChoice("final_role", [
              {
                value: "faculty",
                labelFr: "Enseignant/Chercheur",
                labelEn: "Faculty/Researcher",
              },
              {
                value: "student",
                labelFr: "Étudiant (Master/PhD)",
                labelEn: "Student (Master/PhD)",
              },
              {
                value: "staff",
                labelFr: "Personnel administratif/technique",
                labelEn: "Administrative/Technical Staff",
              },
              {
                value: "partner",
                labelFr: "Partenaire externe/industrie",
                labelEn: "External/Industry Partner",
              },
              { value: "other", labelFr: "Autre", labelEn: "Other" },
            ])}
          </View>
        </View>

        {/* Section 2: Overall Assessment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {i18n.language === "fr"
              ? "2. Évaluation globale"
              : "2. Overall Assessment"}
          </Text>

          {/* Q5: Overall experience */}
          <View style={styles.questionBlock}>
            <Text style={styles.questionLabel}>
              {i18n.language === "fr"
                ? "Votre expérience globale de la conférence"
                : "Your overall conference experience"}
            </Text>
            {renderChoice("overall_rating", [
              {
                value: "insufficient",
                labelFr: "Insuffisant",
                labelEn: "Insufficient",
              },
              {
                value: "needs_improvement",
                labelFr: "À améliorer",
                labelEn: "Needs improvement",
              },
              {
                value: "satisfactory",
                labelFr: "Satisfaisant",
                labelEn: "Satisfactory",
              },
              {
                value: "excellent",
                labelFr: "Excellent",
                labelEn: "Excellent",
              },
            ])}
          </View>

          {/* Q6: Met expectations */}
          <View style={styles.questionBlock}>
            <Text style={styles.questionLabel}>
              {i18n.language === "fr"
                ? "La conférence a-t-elle répondu à vos attentes sur le thème ?"
                : "Did the conference meet your expectations on the theme?"}
            </Text>
            {renderChoice("met_expectations", [
              {
                value: "not_at_all",
                labelFr: "Pas du tout",
                labelEn: "Not at all",
              },
              {
                value: "partially",
                labelFr: "Partiellement",
                labelEn: "Partially",
              },
              { value: "largely", labelFr: "Largement", labelEn: "Largely" },
              { value: "totally", labelFr: "Totalement", labelEn: "Totally" },
            ])}
            {(responses.met_expectations === "not_at_all" ||
              responses.met_expectations === "partially") && (
              <TextInput
                style={styles.textInput}
                placeholder={i18n.language === "fr" ? "Pourquoi ?" : "Why?"}
                value={responses.met_expectations_why || ""}
                onChangeText={text =>
                  setResponses({ ...responses, met_expectations_why: text })
                }
                multiline
              />
            )}
          </View>
        </View>

        {/* Section 3: Impact and Learning */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {i18n.language === "fr"
              ? "3. Impact et apprentissage"
              : "3. Impact and Learning"}
          </Text>

          {/* Q7: Areas of new knowledge (Multiple selection - text input pour simplifier) */}
          <View style={styles.questionBlock}>
            <Text style={styles.questionLabel}>
              {i18n.language === "fr"
                ? "Dans quels domaines avez-vous acquis de nouvelles connaissances ? (Listez-les)"
                : "In which areas did you gain new knowledge? (List them)"}
            </Text>
            <TextInput
              style={[styles.textInput, styles.textInputLarge]}
              placeholder={
                i18n.language === "fr"
                  ? "Ex: Enseignement, Innovation, Entrepreneuriat..."
                  : "Ex: Teaching, Innovation, Entrepreneurship..."
              }
              value={responses.knowledge_areas || ""}
              onChangeText={text =>
                setResponses({ ...responses, knowledge_areas: text })
              }
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Q8: Most impactful thing (REQUIRED) */}
          <View style={styles.questionBlock}>
            <Text style={[styles.questionLabel, styles.requiredLabel]}>
              {i18n.language === "fr"
                ? "LA chose la plus impactante de cette conférence * (obligatoire)"
                : "THE most impactful thing from this conference * (required)"}
            </Text>
            <TextInput
              style={[styles.textInput, styles.textInputLarge]}
              placeholder={
                i18n.language === "fr"
                  ? "Idée, pratique, contact, ressource..."
                  : "Idea, practice, contact, resource..."
              }
              value={responses.most_impactful || ""}
              onChangeText={text =>
                setResponses({ ...responses, most_impactful: text })
              }
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Section 4: Network and Collaborations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {i18n.language === "fr"
              ? "4. Réseau et collaborations"
              : "4. Network and Collaborations"}
          </Text>

          {/* Q9: Sense of belonging */}
          <View style={styles.questionBlock}>
            <Text style={styles.questionLabel}>
              {i18n.language === "fr"
                ? "La conférence a-t-elle renforcé votre sentiment d'appartenance au réseau Afretec ?"
                : "Has the conference strengthened your sense of belonging to the Afretec network?"}
            </Text>
            {renderChoice("network_belonging", [
              {
                value: "no_impact",
                labelFr: "Aucun impact",
                labelEn: "No impact",
              },
              { value: "slightly", labelFr: "Légèrement", labelEn: "Slightly" },
              {
                value: "moderately",
                labelFr: "Modérément",
                labelEn: "Moderately",
              },
              {
                value: "considerably",
                labelFr: "Considérablement",
                labelEn: "Considerably",
              },
            ])}
          </View>

          {/* Q10: Collaboration opportunities */}
          <View style={styles.questionBlock}>
            <Text style={styles.questionLabel}>
              {i18n.language === "fr"
                ? "Avez-vous identifié des opportunités de collaboration concrètes ?"
                : "Have you identified concrete collaboration opportunities?"}
            </Text>
            {renderChoice("collaboration_opportunities", [
              {
                value: "yes_several",
                labelFr: "Oui, plusieurs",
                labelEn: "Yes, several",
              },
              {
                value: "yes_one_two",
                labelFr: "Oui, une ou deux",
                labelEn: "Yes, one or two",
              },
              {
                value: "no_open",
                labelFr: "Non, mais je reste ouvert",
                labelEn: "No, but I remain open",
              },
              { value: "no", labelFr: "Non", labelEn: "No" },
            ])}
            {(responses.collaboration_opportunities === "yes_several" ||
              responses.collaboration_opportunities === "yes_one_two") && (
              <TextInput
                style={styles.textInput}
                placeholder={
                  i18n.language === "fr"
                    ? "Avec quelle(s) institution(s) ou dans quel(s) domaine(s) ?"
                    : "With which institution(s) or in which area(s)?"
                }
                value={responses.collaboration_details || ""}
                onChangeText={text =>
                  setResponses({ ...responses, collaboration_details: text })
                }
                multiline
              />
            )}
          </View>
        </View>

        {/* Section 5: UCAD Organization */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {i18n.language === "fr"
              ? "5. Organisation UCAD"
              : "5. UCAD Organization"}
          </Text>

          {/* Q11: Evaluate aspects */}
          <Text style={styles.questionLabel}>
            {i18n.language === "fr"
              ? "Évaluez l'organisation globale par l'UCAD :"
              : "Evaluate the overall organization by UCAD:"}
          </Text>

          {/* Aspect 1: Welcome and registration */}
          <View style={styles.questionBlock}>
            <Text style={styles.subQuestionLabel}>
              {i18n.language === "fr"
                ? "Accueil et enregistrement"
                : "Welcome and registration"}
            </Text>
            {renderChoice("ucad_welcome", [
              {
                value: "insufficient",
                labelFr: "Insuffisant",
                labelEn: "Insufficient",
              },
              {
                value: "needs_improvement",
                labelFr: "À améliorer",
                labelEn: "Needs improvement",
              },
              {
                value: "satisfactory",
                labelFr: "Satisfaisant",
                labelEn: "Satisfactory",
              },
              {
                value: "excellent",
                labelFr: "Excellent",
                labelEn: "Excellent",
              },
            ])}
          </View>

          {/* Aspect 2: Quality of venue */}
          <View style={styles.questionBlock}>
            <Text style={styles.subQuestionLabel}>
              {i18n.language === "fr"
                ? "Qualité du lieu (Azalai Hotel)"
                : "Quality of venue (Azalai Hotel)"}
            </Text>
            {renderChoice("ucad_venue", [
              {
                value: "insufficient",
                labelFr: "Insuffisant",
                labelEn: "Insufficient",
              },
              {
                value: "needs_improvement",
                labelFr: "À améliorer",
                labelEn: "Needs improvement",
              },
              {
                value: "satisfactory",
                labelFr: "Satisfaisant",
                labelEn: "Satisfactory",
              },
              {
                value: "excellent",
                labelFr: "Excellent",
                labelEn: "Excellent",
              },
            ])}
          </View>

          {/* Aspect 3: Catering */}
          <View style={styles.questionBlock}>
            <Text style={styles.subQuestionLabel}>
              {i18n.language === "fr" ? "Restauration" : "Catering"}
            </Text>
            {renderChoice("ucad_catering", [
              {
                value: "insufficient",
                labelFr: "Insuffisant",
                labelEn: "Insufficient",
              },
              {
                value: "needs_improvement",
                labelFr: "À améliorer",
                labelEn: "Needs improvement",
              },
              {
                value: "satisfactory",
                labelFr: "Satisfaisant",
                labelEn: "Satisfactory",
              },
              {
                value: "excellent",
                labelFr: "Excellent",
                labelEn: "Excellent",
              },
            ])}
          </View>

          {/* Aspect 4: Punctuality */}
          <View style={styles.questionBlock}>
            <Text style={styles.subQuestionLabel}>
              {i18n.language === "fr"
                ? "Ponctualité et gestion du temps"
                : "Punctuality and time management"}
            </Text>
            {renderChoice("ucad_punctuality", [
              {
                value: "insufficient",
                labelFr: "Insuffisant",
                labelEn: "Insufficient",
              },
              {
                value: "needs_improvement",
                labelFr: "À améliorer",
                labelEn: "Needs improvement",
              },
              {
                value: "satisfactory",
                labelFr: "Satisfaisant",
                labelEn: "Satisfactory",
              },
              {
                value: "excellent",
                labelFr: "Excellent",
                labelEn: "Excellent",
              },
            ])}
          </View>

          {/* Aspect 5: Communication */}
          <View style={styles.questionBlock}>
            <Text style={styles.subQuestionLabel}>
              {i18n.language === "fr"
                ? "Communication avant/pendant l'événement"
                : "Communication before/during event"}
            </Text>
            {renderChoice("ucad_communication", [
              {
                value: "insufficient",
                labelFr: "Insuffisant",
                labelEn: "Insufficient",
              },
              {
                value: "needs_improvement",
                labelFr: "À améliorer",
                labelEn: "Needs improvement",
              },
              {
                value: "satisfactory",
                labelFr: "Satisfaisant",
                labelEn: "Satisfactory",
              },
              {
                value: "excellent",
                labelFr: "Excellent",
                labelEn: "Excellent",
              },
            ])}
          </View>
        </View>

        {/* Section 6: Recommendations for Afretec 2026 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {i18n.language === "fr"
              ? "6. Recommandations pour Afretec 2026"
              : "6. Recommendations for Afretec 2026"}
          </Text>

          {/* Q12: Activity to DISCONTINUE */}
          <View style={styles.questionBlock}>
            <Text style={styles.questionLabel}>
              {i18n.language === "fr"
                ? "Quelle activité devrait être ARRÊTÉE ou SIGNIFICATIVEMENT MODIFIÉE ?"
                : "Which activity should be DISCONTINUED or SIGNIFICANTLY MODIFIED?"}
            </Text>
            <TextInput
              style={[styles.textInput, styles.textInputLarge]}
              placeholder={
                i18n.language === "fr" ? "Votre réponse..." : "Your answer..."
              }
              value={responses.activity_discontinue || ""}
              onChangeText={text =>
                setResponses({ ...responses, activity_discontinue: text })
              }
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Q13: Activity to MAINTAIN */}
          <View style={styles.questionBlock}>
            <Text style={styles.questionLabel}>
              {i18n.language === "fr"
                ? "Quelle activité devrait être MAINTENUE ou RENFORCÉE ?"
                : "Which activity should be MAINTAINED or STRENGTHENED?"}
            </Text>
            <TextInput
              style={[styles.textInput, styles.textInputLarge]}
              placeholder={
                i18n.language === "fr" ? "Votre réponse..." : "Your answer..."
              }
              value={responses.activity_maintain || ""}
              onChangeText={text =>
                setResponses({ ...responses, activity_maintain: text })
              }
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Q14: Suggestions for 2026 themes (Optional) */}
          <View style={styles.questionBlock}>
            <Text style={styles.questionLabel}>
              {i18n.language === "fr"
                ? "Suggestions de thèmes ou activités pour Afretec 2026 (optionnel)"
                : "Suggestions for themes or activities for Afretec 2026 (optional)"}
            </Text>
            <TextInput
              style={[styles.textInput, styles.textInputLarge]}
              placeholder={
                i18n.language === "fr"
                  ? "Vos suggestions..."
                  : "Your suggestions..."
              }
              value={responses.suggestions_2026 || ""}
              onChangeText={text =>
                setResponses({ ...responses, suggestions_2026: text })
              }
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Q15: Other comments (Optional) */}
          <View style={styles.questionBlock}>
            <Text style={styles.questionLabel}>
              {i18n.language === "fr"
                ? "Autres commentaires ou suggestions (optionnel)"
                : "Other comments or suggestions (optional)"}
            </Text>
            <TextInput
              style={[styles.textInput, styles.textInputLarge]}
              placeholder={
                i18n.language === "fr"
                  ? "Vos commentaires..."
                  : "Your comments..."
              }
              value={responses.other_comments || ""}
              onChangeText={text =>
                setResponses({ ...responses, other_comments: text })
              }
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Bouton Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>
            {loading
              ? i18n.language === "fr"
                ? "Envoi..."
                : "Submitting..."
              : i18n.language === "fr"
              ? "Soumettre"
              : "Submit"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {evaluationType === "final"
        ? renderFinalEvaluation()
        : renderDayEvaluation()}

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.successModal}>
          <View style={styles.successBox}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successTitle}>
              {i18n.language === "fr" ? "Merci !" : "Thank you!"}
            </Text>
            <Text style={styles.successText}>
              {i18n.language === "fr"
                ? "Votre évaluation a été enregistrée"
                : "Your evaluation has been saved"}
            </Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backBtn: {
    color: COLORS.white,
    fontSize: 16,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  section: {
    backgroundColor: COLORS.white,
    margin: 15,
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 15,
  },
  questionBlock: {
    marginBottom: 20,
  },
  questionLabel: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 10,
    fontWeight: "600",
  },
  requiredLabel: {
    color: COLORS.primary,
  },
  subQuestionLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
    fontWeight: "600",
  },
  prefilledText: {
    fontSize: 16,
    color: COLORS.gray,
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 8,
  },
  choicesContainer: {
    gap: 8,
  },
  choiceBtn: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  choiceBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "10",
  },
  choiceText: {
    fontSize: 15,
    color: COLORS.gray,
    fontWeight: "500",
  },
  choiceTextActive: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 50,
    marginTop: 8,
    textAlignVertical: "top",
  },
  textInputLarge: {
    minHeight: 100,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    margin: 15,
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
  },
  btnDisabled: {
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
  successText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: "center",
  },
});

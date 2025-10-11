export const QUESTION_TEMPLATES = {
  plenary: [
    {
      id: "relevance",
      type: "star",
      question: {
        en: "Relevance for your context?",
        fr: "Pertinence pour votre contexte ?",
      },
      max: 4,
    },
    {
      id: "clarity",
      type: "thumbs",
      question: {
        en: "Presentation clarity?",
        fr: "Clarté de la présentation ?",
      },
    },
    {
      id: "actionable_idea",
      type: "choice",
      question: {
        en: "Did you get actionable ideas?",
        fr: "Avez-vous des idées concrètes ?",
      },
      options: [
        { value: "yes", label: { en: "Yes", fr: "Oui" } },
        { value: "no", label: { en: "No", fr: "Non" } },
        { value: "maybe", label: { en: "Maybe", fr: "Peut-être" } },
      ],
    },
    {
      id: "key_takeaway",
      type: "text",
      question: {
        en: "One key takeaway (optional)",
        fr: "Une idée clé (optionnel)",
      },
      optional: true,
      maxLength: 100,
      bonusPoints: 5,
    },
  ],

  panel: [
    {
      id: "quality",
      type: "star",
      question: {
        en: "Quality of discussions?",
        fr: "Qualité des échanges ?",
      },
      max: 4,
    },
    {
      id: "diversity",
      type: "choice",
      question: {
        en: "Were perspectives diverse?",
        fr: "Perspectives diversifiées ?",
      },
      options: [
        { value: "yes", label: { en: "Yes", fr: "Oui" } },
        { value: "partially", label: { en: "Partially", fr: "Partiellement" } },
        { value: "no", label: { en: "No", fr: "Non" } },
      ],
    },
    {
      id: "recommend",
      type: "thumbs",
      question: {
        en: "Recommend this format?",
        fr: "Recommanderiez-vous ce format ?",
      },
    },
  ],

  workshop: [
    {
      id: "animation",
      type: "star",
      question: {
        en: "Animation quality?",
        fr: "Qualité de l'animation ?",
      },
      max: 4,
    },
    {
      id: "collaboration",
      type: "choice",
      question: {
        en: "Did it foster collaboration ideas?",
        fr: "A favorisé l'émergence d'idées ?",
      },
      options: [
        { value: "not_at_all", label: { en: "Not at all", fr: "Pas du tout" } },
        { value: "a_little", label: { en: "A little", fr: "Un peu" } },
        { value: "moderately", label: { en: "Moderately", fr: "Modérément" } },
        { value: "a_lot", label: { en: "A lot", fr: "Beaucoup" } },
      ],
    },
    {
      id: "format",
      type: "thumbs",
      question: {
        en: "Was the format effective?",
        fr: "Format efficace ?",
      },
    },
  ],

  break: [
    {
      id: "networking",
      type: "star",
      question: {
        en: "Useful for networking?",
        fr: "Utile pour le réseautage ?",
      },
      max: 4,
    },
    {
      id: "contacts",
      type: "choice",
      question: {
        en: "Interesting contacts made?",
        fr: "Contacts intéressants établis ?",
      },
      options: [
        { value: "yes_many", label: { en: "Yes, many", fr: "Oui, plusieurs" } },
        {
          value: "yes_few",
          label: { en: "Yes, few", fr: "Oui, quelques-uns" },
        },
        { value: "not_yet", label: { en: "Not yet", fr: "Pas encore" } },
      ],
    },
  ],
};

/**
 * OpenShelf Multilingual Translation Engine & Fallback Dictionary
 * Supported languages:
 * English (en), Spanish (es), German (de), French (fr), Japanese (ja), Hindi (hi).
 */

export const ACADEMIC_DICTIONARY: Record<string, Record<string, string>> = {
  // Chapter Headings
  "Chapter 1: Foundational Concepts & Problem Scope": {
    en: "Chapter 1: Foundational Concepts & Problem Scope",
    es: "Capítulo 1: Conceptos Fundamentales y Alcance del Problema",
    de: "Kapitel 1: Grundlegende Konzepte und Problembereich",
    fr: "Chapitre 1 : Concepts fondamentaux et portée du problème",
    ja: "第1章: 基本概念と問題の範囲",
    hi: "अध्याय 1: मूलभूत अवधारणाएँ और समस्या का दायरा",
  },
  "Chapter 2: Core Methodology & Step-by-Step Breakdown": {
    en: "Chapter 2: Core Methodology & Step-by-Step Breakdown",
    es: "Capítulo 2: Metodología Central y Desglose Paso a Paso",
    de: "Kapitel 2: Kernmethodik und Schritt-für-Schritt-Aufschlüsselung",
    fr: "Chapitre 2 : Méthodologie centrale et étapes détaillées",
    ja: "第2章: 主要な方法論と段階的な内訳",
    hi: "अध्याय 2: मुख्य कार्यप्रणाली और चरण-दर-चरण विवरण",
  },
  "Chapter 3: Practical Drills, Case Studies & Solutions": {
    en: "Chapter 3: Practical Drills, Case Studies & Solutions",
    es: "Capítulo 3: Ejercicios Prácticos, Estudios de Caso y Soluciones",
    de: "Kapitel 3: Praktische Übungen, Fallstudien und Lösungen",
    fr: "Chapitre 3 : Exercices pratiques, études de cas et solutions",
    ja: "第3章: 実践的なドリル、ケーススタディ、解決策",
    hi: "अध्याय 3: व्यावहारिक अभ्यास, केस स्टडी और समाधान",
  },

  // Common Reader Paragraphs
  "In this section, we examine the constituent parts and transition mechanisms. Understanding why certain rules apply depends strictly on following the sequential order of operations.": {
    en: "In this section, we examine the constituent parts and transition mechanisms. Understanding why certain rules apply depends strictly on following the sequential order of operations.",
    es: "En esta sección examinamos las partes constituyentes y los mecanismos de transición. Comprender por qué se aplican ciertas reglas depende estrictamente de seguir el orden secuencial de las operaciones.",
    de: "In diesem Abschnitt untersuchen wir die Bestandteile und Übergangsmechanismen. Das Verständnis, warum bestimmte Regeln gelten, hängt strikt von der Einhaltung der sequenziellen Reihenfolge der Operationen ab.",
    fr: "Dans cette section, nous examinons les éléments constitutifs et les mécanismes de transition. Comprendre pourquoi certaines règles s'appliquent dépend strictement de l'ordre séquentiel des opérations.",
    ja: "このセクションでは、構成要素と移行メカニズムを検討します。特定のルールが適用される理由を理解するには、操作の順序に厳密に従う必要があります。",
    hi: "इस खंड में, हम घटक भागों और संक्रमण तंत्रों की जांच करते हैं। यह समझना कि कुछ नियम क्यों लागू होते हैं, संचालन के अनुक्रमिक क्रम का पालन करने पर निर्भर करता है।",
  },
  "Carefully cross-reference the references and formulas highlighted in the companion study guide.": {
    en: "Carefully cross-reference the references and formulas highlighted in the companion study guide.",
    es: "Haga referencias cruzadas con cuidado de las fuentes y fórmulas resaltadas en la guía de estudio complementaria.",
    de: "Vergleichen Sie sorgfältig die im begleitenden Studienführer hervorgehobenen Referenzen und Formeln.",
    fr: "Consultez attentivement les références et les formules mises en évidence dans le guide d'étude d'accompagnement.",
    ja: "付属の学習ガイドで強調表示されている参考文献と数式を注意深く相互参照してください。",
    hi: "अध्ययन मार्गदर्शिका में हाइलाइट किए गए संदर्भों और सूत्रों का ध्यानपूर्वक मिलान करें।",
  },
  "Review the practice prompts below and verify your answers before comparing with the chapter rubric.": {
    en: "Review the practice prompts below and verify your answers before comparing with the chapter rubric.",
    es: "Revise las indicaciones de práctica a continuación y verifique sus respuestas antes de compararlas con la rúbrica del capítulo.",
    de: "Überprüfen Sie die folgenden Übungsaufgaben und verifizieren Sie Ihre Antworten, bevor Sie sie mit dem Kapitelrubrik abgleichen.",
    fr: "Passez en revue les questions d'exercice ci-dessous et vérifiez vos réponses avant de les comparer aux critères d'évaluation.",
    ja: "以下の練習問題を確認し、章の評価基準と比較する前に回答を確認してください。",
    hi: "नीचे दिए गए अभ्यास प्रश्नों की समीक्षा करें और अध्याय के मूल्यांकन से तुलना करने से पहले अपने उत्तरों की पुष्टि करें।",
  },

  // Subjects & Tags
  "Computer Science": {
    en: "Computer Science",
    es: "Ciencias de la Computación",
    de: "Informatik",
    fr: "Informatique",
    ja: "コンピュータサイエンス",
    hi: "कंप्यूटर विज्ञान",
  },
  "Mathematics": {
    en: "Mathematics",
    es: "Matemáticas",
    de: "Mathematik",
    fr: "Mathématiques",
    ja: "数学",
    hi: "गणित",
  },
  "Physics": {
    en: "Physics",
    es: "Física",
    de: "Physik",
    fr: "Physique",
    ja: "物理学",
    hi: "भौतिक विज्ञान",
  },
  "Chemistry": {
    en: "Chemistry",
    es: "Química",
    de: "Chemie",
    fr: "Chimie",
    ja: "化学",
    hi: "रसायन विज्ञान",
  },
  "Study guide": {
    en: "Study guide",
    es: "Guía de estudio",
    de: "Studienführer",
    fr: "Guide d'étude",
    ja: "学習ガイド",
    hi: "अध्ययन गाइड",
  },
  "Notes": {
    en: "Notes",
    es: "Apuntes",
    de: "Notizen",
    fr: "Notes de cours",
    ja: "ノート",
    hi: "नोट्स",
  },
  "Exam Prep": {
    en: "Exam Prep",
    es: "Preparación de Examen",
    de: "Prüfungsvorbereitung",
    fr: "Préparation aux examens",
    ja: "試験対策",
    hi: "परीक्षा तैयारी",
  },
  "Cheat sheet": {
    en: "Cheat sheet",
    es: "Hoja de referencia",
    de: "Spickzettel",
    fr: "Aide-mémoire",
    ja: "チートシート",
    hi: "त्वरित संदर्भ पत्र",
  },
}

/**
 * Translates dynamic templated sentences (e.g. Chapter titles, resource intros)
 */
function translatePattern(text: string, lang: string): string | null {
  if (lang === "en") return text

  // Match: Chapter {N}: Practical Drills, Case Studies & Solutions
  const chapterMatch = text.match(/^Chapter (\d+): (.*)$/i)
  if (chapterMatch) {
    const num = chapterMatch[1]
    const rest = chapterMatch[2]
    if (rest.includes("Practical Drills") || rest.includes("Case Studies")) {
      switch (lang) {
        case "ja":
          return `第${num}章: 実践的なドリル、ケーススタディ、解決策`
        case "fr":
          return `Chapitre ${num} : Exercices pratiques, études de cas et solutions`
        case "hi":
          return `अध्याय ${num}: व्यावहारिक अभ्यास, केस स्टडी और समाधान`
        case "es":
          return `Capítulo ${num}: Ejercicios Prácticos, Estudios de Caso y Soluciones`
        case "de":
          return `Kapitel ${num}: Praktische Übungen, Fallstudien und Lösungen`
      }
    }
  }

  // Match: {title} provides a systematic walkthrough tailored for {subject} learners.
  if (text.includes("provides a systematic walkthrough tailored for")) {
    switch (lang) {
      case "ja":
        return text
          .replace("provides a systematic walkthrough tailored for", "は次の学習者に合わせた体系的なウォークスルーを提供します：")
          .replace("learners.", "。")
      case "fr":
        return text
          .replace("provides a systematic walkthrough tailored for", "fournit un guide méthodique adapté aux étudiants en")
          .replace("learners.", ".")
      case "hi":
        return text
          .replace("provides a systematic walkthrough tailored for", "शिक्षार्थियों के लिए अनुकूलित एक व्यवस्थित विवरण प्रदान करता है।")
      case "es":
        return text
          .replace("provides a systematic walkthrough tailored for", "proporciona una guía sistemática adaptada para los estudiantes de")
      case "de":
        return text
          .replace("provides a systematic walkthrough tailored for", "bietet eine systematische Anleitung, zugeschnitten auf Lernende von")
    }
  }

  // Match: This learning resource synthesizes core principles...
  if (text.includes("synthesizes core principles, standard academic conventions")) {
    switch (lang) {
      case "ja":
        return "この学習リソースは、基本原則、学術基準、実証済みの実践的応用を統合したものです。コミュニティのバージョン管理を通じて維持および更新されています。"
      case "fr":
        return "Cette ressource pédagogique fait la synthèse des principes fondamentaux, des conventions académiques et des applications pratiques vérifiées. Elle est maintenue et actualisée par le contrôle des versions communautaire."
      case "hi":
        return "यह शिक्षण संसाधन मूल सिद्धांतों, मानक शैक्षणिक सम्मेलनों और सत्यापित वास्तविक अनुप्रयोगों को संश्लेषित करता है। यह समुदाय संस्करण नियंत्रण द्वारा अद्यतन रहता है।"
      case "es":
        return "Este recurso de aprendizaje sintetiza principios fundamentales, convenciones académicas y aplicaciones prácticas verificadas. Se mantiene actualizado mediante control de versiones comunitario."
      case "de":
        return "Diese Lernressource fasst Kernprinzipien, wissenschaftliche Konventionen und verifizierte Anwendungen zusammen und wird durch Versionskontrolle gepflegt."
    }
  }

  // Match: Key learning outcomes include...
  if (text.includes("Key learning outcomes include")) {
    switch (lang) {
      case "ja":
        return "主な学習成果には、明確な定義の確立、アルゴリズムの依存関係の把握、試験問題における一般的な落とし穴の特定などが含まれます。"
      case "fr":
        return "Les principaux acquis d'apprentissage comprennent l'établissement de définitions claires, la cartographie des dépendances algorithmiques et l'identification des pièges fréquents dans les examens."
      case "hi":
        return "मुख्य शिक्षण परिणामों में सटीक परिभाषाएँ स्थापित करना, कलन विधि निर्भरताओं को समझना और परीक्षा के प्रश्नों में सामान्य गलतियों की पहचान करना शामिल है।"
      case "es":
        return "Los resultados clave de aprendizaje incluyen establecer definiciones verificadas, mapear dependencias algorítmicas e identificar trampas comunes en exámenes."
      case "de":
        return "Zu den wichtigsten Lernergebnissen gehören verifizierte Definitionen, die Zuordnung von Abhängigkeiten und das Erkennen typischer Prüfungsfehler."
    }
  }

  // Match: Continuing the detailed analysis for Page...
  if (text.includes("Continuing the detailed analysis for Page")) {
    switch (lang) {
      case "ja":
        return text
          .replace("Continuing the detailed analysis for Page", "詳細な分析を続けます - ページ")
          .replace("of", "/")
      case "fr":
        return text
          .replace("Continuing the detailed analysis for Page", "Poursuite de l'analyse détaillée pour la page")
          .replace("of", "sur")
      case "hi":
        return text
          .replace("Continuing the detailed analysis for Page", "विस्तृत विश्लेषण जारी है पृष्ठ")
      case "es":
        return text
          .replace("Continuing the detailed analysis for Page", "Continuando el análisis detallado para la Página")
      case "de":
        return text
          .replace("Continuing the detailed analysis for Page", "Fortsetzung der detaillierten Analyse für Seite")
    }
  }

  return null
}

/**
 * Returns translated texts for a batch of strings across all supported languages
 */
export function getFallbackTranslations(texts: string[], targetLang: string): string[] {
  if (!targetLang || targetLang === "en") return texts

  return texts.map((text) => {
    if (!text || typeof text !== "string") return text

    // 1. Exact match in dictionary
    const exactMatch = ACADEMIC_DICTIONARY[text.trim()]
    if (exactMatch && exactMatch[targetLang]) {
      return exactMatch[targetLang]
    }

    // 2. Pattern match for templated sentences
    const patternResult = translatePattern(text, targetLang)
    if (patternResult) {
      return patternResult
    }

    // 3. Keyword / phrase replacements for tags and subject words
    let translated = text
    for (const [key, translations] of Object.entries(ACADEMIC_DICTIONARY)) {
      if (translations[targetLang] && text.includes(key)) {
        translated = translated.split(key).join(translations[targetLang])
      }
    }

    return translated
  })
}

/**
 * Phonetic helper for audio synthesis
 */
export function getPhoneticSpeechText(text: string, _lang: string): string {
  return text
}

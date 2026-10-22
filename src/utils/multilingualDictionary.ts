/**
 * OpenShelf Multilingual Translation Engine & Fallback Dictionary
 * Provides authentic, high-quality native translations across 6 languages:
 * English (en), Spanish (es), German (de), Hindi (hi), Tamil (ta), Malayalam (ml).
 */

export interface DictionaryEntry {
  en: string
  es: string
  de: string
  hi: string
  ta: string
  ml: string
}

export const ACADEMIC_DICTIONARY: Record<string, Record<string, string>> = {
  // Chapter Headings
  "Chapter 1: Foundational Concepts & Problem Scope": {
    en: "Chapter 1: Foundational Concepts & Problem Scope",
    es: "Capítulo 1: Conceptos Fundamentales y Alcance del Problema",
    de: "Kapitel 1: Grundlegende Konzepte und Problembereich",
    hi: "अध्याय 1: मूलभूत अवधारणाएँ और समस्या का दायरा",
    ta: "அத்தியாயம் 1: அடிப்படைக் கருத்துக்கள் மற்றும் சிக்கலின் நோக்கம்",
    ml: "അധ്യായം 1: അടിസ്ഥാനപരമായ ആശയങ്ങളും പ്രശ്ന വ്യാപ്തിയും",
  },
  "Chapter 2: Core Methodology & Step-by-Step Breakdown": {
    en: "Chapter 2: Core Methodology & Step-by-Step Breakdown",
    es: "Capítulo 2: Metodología Central y Desglose Paso a Paso",
    de: "Kapitel 2: Kernmethodik und Schritt-für-Schritt-Aufschlüsselung",
    hi: "अध्याय 2: मुख्य कार्यप्रणाली और चरण-दर-चरण विवरण",
    ta: "அத்தியாயம் 2: முதன்மை வழிமுறைகள் மற்றும் படிமுறை விளக்கம்",
    ml: "അധ്യായം 2: പ്രധാന രീതിശാസ്ത്രവും ഘട്ടം ഘട്ടമായുള്ള വിശദീകരണവും",
  },
  "Chapter 3: Practical Drills, Case Studies & Solutions": {
    en: "Chapter 3: Practical Drills, Case Studies & Solutions",
    es: "Capítulo 3: Ejercicios Prácticos, Estudios de Caso y Soluciones",
    de: "Kapitel 3: Praktische Übungen, Fallstudien und Lösungen",
    hi: "अध्याय 3: व्यावहारिक अभ्यास, केस स्टडी और समाधान",
    ta: "அத்தியாயம் 3: நடைமுறைப் பயிற்சிகள், வழக்கு ஆய்வுகள் மற்றும் தீர்வுகள்",
    ml: "അധ്യായം 3: പ്രായോഗിക പരിശീലനങ്ങൾ, കേസ് സ്റ്റഡികൾ, പരിഹാരങ്ങൾ",
  },

  // Common Reader Paragraphs
  "In this section, we examine the constituent parts and transition mechanisms. Understanding why certain rules apply depends strictly on following the sequential order of operations.": {
    en: "In this section, we examine the constituent parts and transition mechanisms. Understanding why certain rules apply depends strictly on following the sequential order of operations.",
    es: "En esta sección examinamos las partes constituyentes y los mecanismos de transición. Comprender por qué se aplican ciertas reglas depende estrictamente de seguir el orden secuencial de las operaciones.",
    de: "In diesem Abschnitt untersuchen wir die Bestandteile und Übergangsmechanismen. Das Verständnis, warum bestimmte Regeln gelten, hängt strikt von der Einhaltung der sequenziellen Reihenfolge der Operationen ab.",
    hi: "इस खंड में, हम घटक भागों और संक्रमण तंत्रों की जांच करते हैं। यह समझना कि कुछ नियम क्यों लागू होते हैं, संचालन के अनुक्रमिक क्रम का पालन करने पर निर्भर करता है।",
    ta: "இந்த பிரிவில், நாம் உறுப்புப் பகுதிகளையும் அதன் செயல்பாட்டு வழிமுறைகளையும் ஆராய்வோம். சில விதிகள் ஏன் பொருந்தும் என்பதைப் புரிந்துகொள்வது வரிசைமுறையைப் பின்பற்றுவதைச் சார்ந்துள்ளது.",
    ml: "ഈ ഭാഗത്ത്, ഞങ്ങൾ ഘടകഭാഗങ്ങളെയും പരിവർത്തന സംവിധാനങ്ങളെയും പരിശോധിക്കുന്നു. ചില നിയമങ്ങൾ എന്തുകൊണ്ട് ബാധകമാകുന്നുവെന്ന് മനസ്സിലാക്കുന്നത് പ്രവർത്തനങ്ങളുടെ തുടർച്ചയായ ക്രമം പാലിക്കുന്നതിനെ ആശ്രയിച്ചിരിക്കുന്നു.",
  },
  "Carefully cross-reference the references and formulas highlighted in the companion study guide.": {
    en: "Carefully cross-reference the references and formulas highlighted in the companion study guide.",
    es: "Haga referencias cruzadas con cuidado de las fuentes y fórmulas resaltadas en la guía de estudio complementaria.",
    de: "Vergleichen Sie sorgfältig die im begleitenden Studienführer hervorgehobenen Referenzen und Formeln.",
    hi: "अध्ययन मार्गदर्शिका में हाइलाइट किए गए संदर्भों और सूत्रों का ध्यानपूर्वक मिलान करें।",
    ta: "படிப்பு வழிகாட்டியில் சிறப்பிக்கப்பட்டுள்ள குறிப்புகள் மற்றும் சூத்திரங்களை கவனமாகச் சரிபார்க்கவும்.",
    ml: "പഠന സഹായിയിൽ എടുത്തുകാണിച്ചിരിക്കുന്ന റഫറൻസുകളും സൂത്രവാക്യങ്ങളും ശ്രദ്ധാപൂർവ്വം താരതമ്യം ചെയ്യുക.",
  },
  "Review the practice prompts below and verify your answers before comparing with the chapter rubric.": {
    en: "Review the practice prompts below and verify your answers before comparing with the chapter rubric.",
    es: "Revise las indicaciones de práctica a continuación y verifique sus respuestas antes de compararlas con la rúbrica del capítulo.",
    de: "Überprüfen Sie die folgenden Übungsaufgaben und verifizieren Sie Ihre Antworten, bevor Sie sie mit dem Kapitelrubrik abgleichen.",
    hi: "नीचे दिए गए अभ्यास प्रश्नों की समीक्षा करें और अध्याय के मूल्यांकन से तुलना करने से पहले अपने उत्तरों की पुष्टि करें।",
    ta: "கீழே உள்ள பயிற்சி வினாக்களை மதிப்பாய்வு செய்து பதில்களைச் சரிபார்க்கவும்.",
    ml: "താഴെയുള്ള പരിശീലന ചോദ്യങ്ങൾ അവലോകനം ചെയ്ത് ഉത്തരങ്ങൾ പരിശോധിക്കുക.",
  },

  // Subjects & Tags
  "Computer Science": {
    en: "Computer Science",
    es: "Ciencias de la Computación",
    de: "Informatik",
    hi: "कंप्यूटर विज्ञान",
    ta: "கணினி அறிவியல்",
    ml: "കമ്പ്യൂട്ടർ സയൻസ്",
  },
  "Mathematics": {
    en: "Mathematics",
    es: "Matemáticas",
    de: "Mathematik",
    hi: "गणित",
    ta: "கணிதம்",
    ml: "ഗണിതം",
  },
  "Physics": {
    en: "Physics",
    es: "Física",
    de: "Physik",
    hi: "भौतिक विज्ञान",
    ta: "இயற்பியல்",
    ml: "ഭൗതികശാസ്ത്രം",
  },
  "Chemistry": {
    en: "Chemistry",
    es: "Química",
    de: "Chemie",
    hi: "रसायन विज्ञान",
    ta: "வேதியியல்",
    ml: "രസതന്ത്രം",
  },
  "Study guide": {
    en: "Study guide",
    es: "Guía de estudio",
    de: "Studienführer",
    hi: "अध्ययन गाइड",
    ta: "படிப்பு வழிகாட்டி",
    ml: "പഠന സഹായി",
  },
  "Notes": {
    en: "Notes",
    es: "Apuntes",
    de: "Notizen",
    hi: "नोट्स",
    ta: "குறிப்புகள்",
    ml: "കുറിപ്പുകൾ",
  },
  "Exam Prep": {
    en: "Exam Prep",
    es: "Preparación de Examen",
    de: "Prüfungsvorbereitung",
    hi: "परीक्षा तैयारी",
    ta: "தேர்வு தயாரிப்பு",
    ml: "പരീക്ഷാ തയ്യാറെടുപ്പ്",
  },
  "Cheat sheet": {
    en: "Cheat sheet",
    es: "Hoja de referencia",
    de: "Spickzettel",
    hi: "त्वरित संदर्भ पत्र",
    ta: "குறிப்பேடு",
    ml: "ചീറ്റ് ഷീറ്റ്",
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
        case "ta":
          return `அத்தியாயம் ${num}: நடைமுறைப் பயிற்சிகள், வழக்கு ஆய்வுகள் மற்றும் தீர்வுகள்`
        case "ml":
          return `അധ്യായം ${num}: പ്രായോഗിക പരിശീലനങ്ങൾ, കേസ് സ്റ്റഡികൾ, പരിഹാരങ്ങൾ`
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
      case "ta":
        return text
          .replace("provides a systematic walkthrough tailored for", "வழங்குகிறது ஒரு முறையான வழிகாட்டல்")
          .replace("learners.", "கற்பவர்களுக்காக சிறப்பாக வடிவமைக்கப்பட்டது.")
      case "ml":
        return text
          .replace("provides a systematic walkthrough tailored for", "നൽകുന്നു ഒരു ചിട്ടയായ പഠന സഹായി")
          .replace("learners.", "പഠിതാക്കൾക്കായി പ്രത്യേകം രൂപകൽപ്പന ചെയ്തത്.")
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
      case "ta":
        return "இந்த கற்றல் வளமானது அடிப்படைக் கோட்பாடுகள், கல்வி மரபுகள் மற்றும் சரிபார்க்கப்பட்ட நடைமுறைப் பயன்பாடுகளை ஒருங்கிணைக்கிறது. சமூக பதிப்புக் கட்டுப்பாட்டின் மூலம் இது தொடர்ந்து பராமரிக்கப்பட்டு புதுப்பிக்கப்படுகிறது."
      case "ml":
        return "ഈ പഠന വിഭവം അടിസ്ഥാന തത്വങ്ങൾ, അക്കാദമിക് മാനദണ്ഡങ്ങൾ, പരിശോധിച്ച യഥാർത്ഥ പ്രയോഗങ്ങൾ എന്നിവ സമന്വയിപ്പിക്കുന്നു. കമ്മ്യൂണിറ്റി പതിപ്പ് നിയന്ത്രണത്തിലൂടെ ഇത് നിരന്തരം പുതുക്കപ്പെടുന്നു."
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
      case "ta":
        return "முக்கிய கற்றல் முடிவுகளில் துல்லியமான வரையறைகளை நிறுவுதல், அல்காரிதக் கட்டமைப்பை வரைபடமாக்குதல் மற்றும் தேர்வு வினாக்களில் பொதுவான தவறுகளைக் கண்டறிதல் ஆகியவை அடங்கும்."
      case "ml":
        return "പ്രധാന പഠന നേട്ടങ്ങളിൽ കൃത്യമായ നിർവചനങ്ങൾ സ്ഥാപിക്കൽ, അൽഗോരിത ഘടനകൾ തിരിച്ചറിയൽ, പരീക്ഷാ ചോദ്യങ്ങളിലെ സാധ്യതയുള്ള പിശകുകൾ കണ്ടെത്തൽ എന്നിവ ഉൾപ്പെടുന്നു."
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
      case "ta":
        return text
          .replace("Continuing the detailed analysis for Page", "விரிவான ஆய்வைத் தொடர்கிறது பக்கம்")
          .replace("of", "-")
      case "ml":
        return text
          .replace("Continuing the detailed analysis for Page", "വിശദമായ വിശകലനം തുടരുന്നു പേജ്")
          .replace("of", "-")
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
 * Returns translated texts for a batch of strings across all 6 supported languages
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

// ==============================================================================
// Phonetic Speech Transliteration for Amazon Polly & Multilingual Voice Synthesis
// Converts Indic Unicode scripts (Tamil & Malayalam) into natural phonetic Latin
// so AWS Polly and browser speech synthesis engines speak seamlessly without stopping.
// ==============================================================================

const TAMIL_PHONETICS: [string, string][] = [
  [
    "அத்தியாயம் 1: அடிப்படைக் கருத்துக்கள் மற்றும் சிக்கலின் நோக்கம்",
    "Athiyayam ondru: Adippadai karuthukkal matrum sikkalin nokkam.",
  ],
  [
    "அத்தியாயம் 2: முதன்மை வழிமுறைகள் மற்றும் படிமுறை விளக்கம்",
    "Athiyayam irandu: Mudhanmai vazhimuraigal matrum padimurai vilakkam.",
  ],
  [
    "அத்தியாயம் 3: நடைமுறைப் பயிற்சிகள், வழக்கு ஆய்வுகள் மற்றும் தீர்வுகள்",
    "Athiyayam moondru: Nadaimurai payirchigal, vazhakku aaivugal matrum theervugal.",
  ],
  [
    "வழங்குகிறது ஒரு முறையான வழிகாட்டல்",
    "valangugiradhu oru muraiyaana vazhikaattal",
  ],
  [
    "கற்பவர்களுக்காக சிறப்பாக வடிவமைக்கப்பட்டது",
    "karpabargalukkaaga sirappaga vadivamaikkappattadhu",
  ],
  [
    "இந்த கற்றல் வளமானது அடிப்படைக் கோட்பாடுகள்",
    "Indha katral valamaanadhu adippadaik kotpaadugal",
  ],
  [
    "கல்வி மரபுகள் மற்றும் சரிபார்க்கப்பட்ட நடைமுறைப் பயன்பாடுகளை ஒருங்கிணைக்கிறது",
    "kalvi marabugal matrum saripaarkkappatta nadaimurai payanpaadugalai orunginaikkiradhu",
  ],
  [
    "சமூக பதிப்புக் கட்டுப்பாட்டின் மூலம் இது தொடர்ந்து பராமரிக்கப்பட்டு புதுப்பிக்கப்படுகிறது",
    "Samooga padhippuk kattuppaattin moolam idhu thodarnthu paraamarikkappattu pudhuppikkappadugiradhu",
  ],
  [
    "முக்கிய கற்றல் முடிவுகளில் துல்லியமான வரையறைகளை நிறுவுதல்",
    "Mukkiya katral mudivugalil thulliyamaana varaiyaraigalai niruvudhal",
  ],
  [
    "அல்காரிதக் கட்டமைப்பை வரைபடமாக்குதல் மற்றும் தேர்வு வினாக்களில் பொதுவான தவறுகளைக் கண்டறிதல் ஆகியவை அடங்கும்",
    "algoorithak kattamaippai varaipadamaakkudhal matrum thervu vinaakkalil podhuvaana thavarugalai kandaridhal aagiyavai adangum",
  ],
  [
    "இந்த பிரிவில், நாம் உறுப்புப் பகுதிகளையும் அதன் செயல்பாட்டு வழிமுறைகளையும் ஆராய்வோம்",
    "Indha pirivil, naam uruppup pagudhigalaiyum adhan seyalpaattu vazhimuraigalaiyum aaraaivom",
  ],
  [
    "சில விதிகள் ஏன் பொருந்தும் என்பதைப் புரிந்துகொள்வது வரிசைமுறையைப் பின்பற்றுவதைச் சார்ந்துள்ளது",
    "Sila vidhigal aen porundhum enbadhaip purindhukolvadhu varisaimuraiyaip pinpatruvadhai saarndhulladhu",
  ],
  [
    "படிப்பு வழிகாட்டியில் சிறப்பிக்கப்பட்டுள்ள குறிப்புகள் மற்றும் சூத்திரங்களை கவனமாகச் சரிபார்க்கவும்",
    "Padippu vazhikaattiyil sirappikkappattulla kurippugal matrum soothirangalai kavanamaagach saripaarkkavum",
  ],
  [
    "கீழே உள்ள பயிற்சி வினாக்களை மதிப்பாய்வு செய்து பதில்களைச் சரிபார்க்கவும்",
    "Keezhae ulla payirchi vinaakkalai madhippaaivu seidhu badhilgalaich saripaarkkavum",
  ],
  [
    "விரிவான ஆய்வைத் தொடர்கிறது பக்கம்",
    "Virivaana aaivait thodargiradhu pakkam",
  ],
  ["கணினி அறிவியல்", "Ganini Ariviyal"],
  ["படிப்பு வழிகாட்டி", "Padippu Vazhikaatti"],
  ["குறிப்புகள்", "Kurippugal"],
  ["தேர்வு தயாரிப்பு", "Thervu Thayaarippu"],
  ["குறிப்பேடு", "Kurippaedu"],
]

const MALAYALAM_PHONETICS: [string, string][] = [
  [
    "അധ്യായം 1: അടിസ്ഥാനപരമായ ആശയങ്ങളും പ്രശ്ന വ്യാപ്തിയും",
    "Adhyayam onnu: Adisthanaparamaaya aashayangalum prashna vyaapthiyum.",
  ],
  [
    "അധ്യായം 2: പ്രധാന രീതിശാസ്ത്രവും ഘട്ടം ഘട്ടമായുള്ള വിശദീകരണവും",
    "Adhyayam randu: Pradhaana reethisasthravum ghattam ghattamaayulla vishadheekaranavum.",
  ],
  [
    "അധ്യായം 3: പ്രായോഗിക പരിശീലനങ്ങൾ, കേസ് സ്റ്റഡികൾ, പരിഹാരങ്ങൾ",
    "Adhyayam moonnu: Praayogika parisheelanangal, case studikal, pariharangal.",
  ],
  [
    "നൽകുന്നു ഒരു ചിട്ടയായ പഠന സഹായി",
    "nalkunnu oru chittayaaya padhana sahaayi",
  ],
  [
    "പഠിതാക്കൾക്കായി പ്രത്യേകം രൂപകൽപ്പന ചെയ്തത്",
    "padhithaakkalkkaayi prathyekam roopakalpana cheythathu",
  ],
  [
    "ഈ പഠന വിഭവം അടിസ്ഥാന തത്വങ്ങൾ",
    "Ee padhana vibhavam adisthaana thathwangal",
  ],
  [
    "അക്കാദമിക് മാനദണ്ഡങ്ങൾ, പരിശോധിച്ച യഥാർത്ഥ പ്രയോഗങ്ങൾ എന്നിവ സമന്വയിപ്പിക്കുന്നു",
    "academic maanadhandangal, parishodhicha yathaartha prayogangal enniva samanwayippikkunnu",
  ],
  [
    "കമ്മ്യൂണിറ്റി പതിപ്പ് നിയന്ത്രണത്തിലൂടെ ഇത് നിരന്തരം പുതുക്കപ്പെടുന്നു",
    "Community pathippu niyanthranathiloode ithu nirantharam puthukkappadunnu",
  ],
  [
    "പ്രധാന പഠന നേട്ടങ്ങളിൽ കൃത്യമായ നിർവചനങ്ങൾ സ്ഥാപിക്കൽ",
    "Pradhaana padhana nettangalil krithyamaaya nirvachhanangal sthaapikkal",
  ],
  [
    "അൽഗോരിത ഘടനകൾ തിരിച്ചറിയൽ, പരീക്ഷാ ചോദ്യങ്ങളിലെ സാധ്യതയുള്ള പിശകുകൾ കണ്ടെത്തൽ എന്നിവ ഉൾപ്പെടുന്നു",
    "algoritha ghadanakal thirichariyal, pareeksha chodyangalile saadhyathayulla pishakukal kandethal enniva ulppedunnu",
  ],
  [
    "ഈ ഭാഗത്ത്, ഞങ്ങൾ ഘടകഭാഗങ്ങളെയും പരിവർത്തന സംവിധാനങ്ങളെയും പരിശോധിക്കുന്നു",
    "Ee bhaagathu, njangal ghadakabhaagangaleyum parivarthana samvidhaanangaleyum parishodhikkunnu",
  ],
  [
    "ചില നിയമങ്ങൾ എന്തുകൊണ്ട് ബാധകമാകുന്നുവെന്ന്",
    "chila niyamangal enthukondu baadhakamaagunnuvennu",
  ],
  [
    "പഠന സഹായിയിൽ എടുത്തുകാണിച്ചിരിക്കുന്ന റഫറൻസുകളും സൂത്രവാക്യങ്ങളും ശ്രദ്ധാപൂർവ്വം താരതമ്യം ചെയ്യുക",
    "Padhana sahaayiyil eduthukaanichirikkunna referencesum soothravaakyangalum shraddhaapoorvam tharathamyam cheyyuka",
  ],
  [
    "താഴെയുള്ള പരിശീലന ചോദ്യങ്ങൾ അവലോകനം ചെയ്ത് ഉത്തരങ്ങൾ പരിശോധിക്കുക",
    "Thazheyulla parisheelana chodyangal avalokanam cheythu uthharangal parishodhikkuka",
  ],
  ["വിശദമായ വിശകലനം തുടരുന്നു പേജ്", "Vishadhamaaya vishakalanam thudarunnu page"],
  ["കമ്പ്യൂട്ടർ സയൻസ്", "Computer Science"],
  ["പഠന സഹായി", "Padhana Sahaayi"],
  ["കുറിപ്പുകൾ", "Kurippukal"],
  ["പരീക്ഷാ തയ്യാറെടുപ്പ്", "Pareeksha Thayaaredippu"],
  ["ചീറ്റ് ഷീറ്റ്", "Cheat Sheet"],
]

function transliterateTamilScript(input: string): string {
  const vowels: Record<string, string> = {
    "அ": "a",
    "ஆ": "aa",
    "இ": "i",
    "ஈ": "ee",
    "உ": "u",
    "ஊ": "oo",
    "எ": "e",
    "ஏ": "ae",
    "ஐ": "ai",
    "ஒ": "o",
    "ஓ": "oa",
    "ஔ": "au",
  }
  const consonants: Record<string, string> = {
    "க": "k",
    "ங": "ng",
    "ச": "ch",
    "ஞ": "ny",
    "ட": "d",
    "ண": "n",
    "த": "th",
    "ந": "n",
    "ப": "p",
    "ம": "m",
    "ய": "y",
    "ர": "r",
    "ல": "l",
    "வ": "v",
    "ழ": "zh",
    "ள": "l",
    "ற": "r",
    "ன": "n",
    "ஜ": "j",
    "ஷ": "sh",
    "ஸ": "s",
    "ஹ": "h",
  }
  const signs: Record<string, string> = {
    "ா": "aa",
    "ி": "i",
    "ீ": "ee",
    "ு": "u",
    "ூ": "oo",
    "ெ": "e",
    "ே": "ae",
    "ை": "ai",
    "ொ": "o",
    "ோ": "oa",
    "ௌ": "au",
  }
  let out = ""
  for (let i = 0; i < input.length; i++) {
    const ch = input[i]
    if (vowels[ch]) {
      out += vowels[ch]
    } else if (consonants[ch]) {
      const next = input[i + 1]
      if (next === "\u0BCD") {
        out += consonants[ch]
        i++
      } else if (next && signs[next]) {
        out += consonants[ch] + signs[next]
        i++
      } else {
        out += consonants[ch] + "a"
      }
    } else if (ch >= "\u0B80" && ch <= "\u0BFF") {
      // skip unhandled marks
    } else {
      out += ch
    }
  }
  return out
}

function transliterateMalayalamScript(input: string): string {
  const vowels: Record<string, string> = {
    "അ": "a",
    "ആ": "aa",
    "ഇ": "i",
    "ഈ": "ee",
    "ഉ": "u",
    "ഊ": "oo",
    "ഋ": "ri",
    "എ": "e",
    "ഏ": "ae",
    "ഐ": "ai",
    "ഒ": "o",
    "ഓ": "oa",
    "ഔ": "au",
  }
  const consonants: Record<string, string> = {
    "ക": "k",
    "ഖ": "kh",
    "ഗ": "g",
    "ഘ": "gh",
    "ങ": "ng",
    "ച": "ch",
    "ഛ": "chh",
    "ജ": "j",
    "ഝ": "jh",
    "ഞ": "ny",
    "ട": "t",
    "ഠ": "th",
    "ഡ": "d",
    "ഢ": "dh",
    "ണ": "n",
    "ത": "th",
    "ഥ": "th",
    "ദ": "d",
    "ധ": "dh",
    "ന": "n",
    "പ": "p",
    "ഫ": "ph",
    "ബ": "b",
    "ഭ": "bh",
    "മ": "m",
    "യ": "y",
    "ര": "r",
    "ല": "l",
    "വ": "v",
    "ശ": "sh",
    "ഷ": "sh",
    "സ": "s",
    "ഹ": "h",
    "ള": "l",
    "ഴ": "zh",
    "റ": "r",
  }
  const signs: Record<string, string> = {
    "ാ": "aa",
    "ി": "i",
    "ീ": "ee",
    "ു": "u",
    "ൂ": "oo",
    "ൃ": "ri",
    "െ": "e",
    "േ": "ae",
    "ൈ": "ai",
    "ൊ": "o",
    "ോ": "oa",
    "ൌ": "au",
    "ൗ": "au",
  }
  let out = ""
  for (let i = 0; i < input.length; i++) {
    const ch = input[i]
    if (vowels[ch]) {
      out += vowels[ch]
    } else if (consonants[ch]) {
      const next = input[i + 1]
      if (next === "\u0D4D") {
        out += consonants[ch]
        i++
      } else if (next && signs[next]) {
        out += consonants[ch] + signs[next]
        i++
      } else {
        out += consonants[ch] + "a"
      }
    } else if (ch === "\u0D02") {
      out += "m"
    } else if (ch >= "\u0D00" && ch <= "\u0D7F") {
      // skip unhandled marks
    } else {
      out += ch
    }
  }
  return out
}

/**
 * Converts text into phonetically pronounceable speech text for AWS Polly & TTS
 */
export function getPhoneticSpeechText(text: string, lang: string): string {
  if (!text) return ""
  if (lang === "ta") {
    let result = text
    for (const [tamil, phonetic] of TAMIL_PHONETICS) {
      if (result.includes(tamil)) {
        result = result.split(tamil).join(phonetic)
      }
    }
    return transliterateTamilScript(result)
  }
  if (lang === "ml") {
    let result = text
    for (const [malayalam, phonetic] of MALAYALAM_PHONETICS) {
      if (result.includes(malayalam)) {
        result = result.split(malayalam).join(phonetic)
      }
    }
    return transliterateMalayalamScript(result)
  }
  return text
}

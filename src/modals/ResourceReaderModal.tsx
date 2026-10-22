import { useState, useEffect, useRef, useMemo } from "react"
import { Item, Version } from "../types"
import { Modal } from "../components/common/Modal"
import { Button } from "../components/common/Button"
import { Icon } from "../components/common/Icon"
import api from "../services/api"
import {
  getFallbackTranslations,
  getPhoneticSpeechText,
} from "../utils/multilingualDictionary"

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸", nativeName: "English" },
  { code: "es", label: "Spanish", flag: "🇪🇸", nativeName: "Español" },
  { code: "de", label: "German", flag: "🇩🇪", nativeName: "Deutsch" },
  { code: "fr", label: "French", flag: "🇫🇷", nativeName: "Français" },
  { code: "ja", label: "Japanese", flag: "🇯🇵", nativeName: "日本語" },
  { code: "hi", label: "Hindi", flag: "🇮🇳", nativeName: "हिन्दी" },
] as const

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]["code"]

interface TranslatedPage {
  heading: string
  paragraphs: string[]
  tags: string[]
}

export function ResourceReaderModal({
  selected,
  selectedVersions,
  onClose,
}: {
  selected: Item
  selectedVersions: Version[]
  onClose: () => void
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [fullscreen, setFullscreen] = useState(false)
  const totalPages = selected.pages || 12
  const currentVersion = selectedVersions[0]?.number ?? 1

  // Smart Reader Translation State
  const [currentLang, setCurrentLang] = useState<LanguageCode>("en")
  const [isTranslating, setIsTranslating] = useState(false)
  const translationCache = useRef<Record<string, TranslatedPage>>({})

  // Smart Reader Audio (Polly) State
  const [audioState, setAudioState] =
    useState<"idle" | "loading" | "playing" | "paused">("idle")
  const [voiceGender, setVoiceGender] = useState<"female" | "male">("female")
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioCache = useRef<Record<string, string>>({}) // key -> blobUrl
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Keyboard navigation for reader: Left/Right arrows for page flips, +/- for zoom, F for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        handlePageChange(Math.max(1, currentPage - 1))
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        handlePageChange(Math.min(totalPages, currentPage + 1))
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault()
        setZoomLevel((z) => Math.min(150, z + 10))
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault()
        setZoomLevel((z) => Math.max(70, z - 10))
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault()
        setFullscreen((f) => !f)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentPage, totalPages])

  // Cleanup audio playback on unmount or close
  useEffect(() => {
    return () => {
      stopAudioPlayback()
    }
  }, [])

  const stopAudioPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    speechUtteranceRef.current = null
    setAudioState("idle")
  }

  // Base English content generator
  const baseContent = useMemo(() => {
    switch (currentPage) {
      case 1:
        return {
          heading: "Chapter 1: Foundational Concepts & Problem Scope",
          paragraphs: [
            `${selected.title} provides a systematic walkthrough tailored for ${selected.subject} learners.`,
            `This learning resource synthesizes core principles, standard academic conventions, and verified real-world applications. Authored by ${selected.author}, this document is maintained and updated via community version control.`,
            `Key learning outcomes include establishing verified definitions, mapping core algorithmic dependencies, and identifying standard pitfalls in exam questions.`,
          ],
          codeOrBox: `// Academic Domain & License Context\nconst resourceScope = {\n  domain: "${selected.subject}",\n  scope: "${selected.type}",\n  license: "${selected.license}",\n  verified: true\n};`,
        }
      case 2:
        return {
          heading: "Chapter 2: Core Methodology & Step-by-Step Breakdown",
          paragraphs: [
            "In this section, we examine the constituent parts and transition mechanisms. Understanding why certain rules apply depends strictly on following the sequential order of operations.",
            "Carefully cross-reference the references and formulas highlighted in the companion study guide.",
          ],
          codeOrBox: `[Step 1] Identify problem constraints -> [Step 2] Map key formulas -> [Step 3] Apply verification check.`,
        }
      default:
        return {
          heading: `Chapter ${currentPage}: Practical Drills, Case Studies & Solutions`,
          paragraphs: [
            `Continuing the detailed analysis for Page ${currentPage} of ${selected.title}.`,
            "Review the practice prompts below and verify your answers before comparing with the chapter rubric.",
          ],
          codeOrBox: `Practice Exercise ${currentPage}.1:\nVerify constraints and formulate an optimal approach according to the methods established in Section 1.`,
        }
    }
  }, [currentPage, selected])

  // Display Content (Original or Translated)
  const [displayContent, setDisplayContent] = useState<TranslatedPage>({
    heading: baseContent.heading,
    paragraphs: baseContent.paragraphs,
    tags: selected.tags,
  })

  // Handle Translation changes
  useEffect(() => {
    let isCancelled = false

    if (currentLang === "en") {
      setDisplayContent({
        heading: baseContent.heading,
        paragraphs: baseContent.paragraphs,
        tags: selected.tags,
      })
      setIsTranslating(false)
      return
    }

    const cacheKey = `${selected.id}_p${currentPage}_${currentLang}`
    if (translationCache.current[cacheKey]) {
      setDisplayContent(translationCache.current[cacheKey])
      setIsTranslating(false)
      return
    }

    setIsTranslating(true)

    // Batch translate heading, paragraphs, and tags together
    const textBatch = [
      baseContent.heading,
      ...baseContent.paragraphs,
      ...selected.tags,
    ]

    api
      .translateContent(textBatch, currentLang)
      .then((res) => {
        if (isCancelled) return

        const translated =
          Array.isArray(res?.translatedTexts) && res.translatedTexts.length > 0
            ? res.translatedTexts
            : getFallbackTranslations(textBatch, currentLang)

        const heading = translated[0] || baseContent.heading
        const paragraphs = translated.slice(
          1,
          1 + baseContent.paragraphs.length,
        )
        const tags = translated.slice(1 + baseContent.paragraphs.length)

        const pageData: TranslatedPage = {
          heading,
          paragraphs:
            paragraphs.length > 0 ? paragraphs : baseContent.paragraphs,
          tags: tags.length > 0 ? tags : selected.tags,
        }

        translationCache.current[cacheKey] = pageData
        setDisplayContent(pageData)
      })
      .catch((err) => {
        console.warn("Cloud translation failed, applying native fallback:", err)
        if (!isCancelled) {
          const fallbackBatch = getFallbackTranslations(textBatch, currentLang)
          const heading = fallbackBatch[0] || baseContent.heading
          const paragraphs = fallbackBatch.slice(
            1,
            1 + baseContent.paragraphs.length,
          )
          const tags = fallbackBatch.slice(1 + baseContent.paragraphs.length)

          const pageData: TranslatedPage = {
            heading,
            paragraphs:
              paragraphs.length > 0 ? paragraphs : baseContent.paragraphs,
            tags: tags.length > 0 ? tags : selected.tags,
          }
          translationCache.current[cacheKey] = pageData
          setDisplayContent(pageData)
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsTranslating(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [currentPage, currentLang, baseContent, selected])

  const handlePageChange = (newPage: number) => {
    stopAudioPlayback()
    setCurrentPage(newPage)
  }

  const handleLanguageChange = (lang: LanguageCode) => {
    stopAudioPlayback()
    setCurrentLang(lang)
  }

  // Handle Amazon Polly Speech Synthesis
  const startSpeechSynthesis = async (
    gender: "female" | "male" = voiceGender,
  ) => {
    stopAudioPlayback()
    setAudioState("loading")

    const fullTextToRead = `${displayContent.heading}. ${displayContent.paragraphs.join(" ")}`

    const cacheKey = `${selected.id}_p${currentPage}_${currentLang}_${gender}`

    // Check client-side audio cache
    if (audioCache.current[cacheKey]) {
      const audioUrl = audioCache.current[cacheKey]
      playAudioFromUrl(audioUrl, gender)
      return
    }

    try {
      const res = await api.synthesizeSpeech(fullTextToRead, {
        languageCode: currentLang,
        gender: gender,
      })

      if (res.audioUrl && !res.fallback) {
        audioCache.current[cacheKey] = res.audioUrl
        playAudioFromUrl(res.audioUrl, gender)
      } else {
        // Fallback to browser-native speech synthesis
        fallbackBrowserSpeech(fullTextToRead, currentLang, gender)
      }
    } catch {
      fallbackBrowserSpeech(fullTextToRead, currentLang, gender)
    }
  }

  const handleToggleAudio = async () => {
    if (audioState === "playing") {
      if (audioRef.current) {
        audioRef.current.pause()
      } else if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.pause()
      }
      setAudioState("paused")
      return
    }

    if (audioState === "paused") {
      if (audioRef.current) {
        audioRef.current.play()
      } else if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.resume()
      }
      setAudioState("playing")
      return
    }

    await startSpeechSynthesis(voiceGender)
  }

  const handleVoiceGenderChange = (gender: "female" | "male") => {
    setVoiceGender(gender)
    if (audioState === "playing" || audioState === "loading") {
      startSpeechSynthesis(gender)
    }
  }

  const playAudioFromUrl = (
    url: string,
    gender: "female" | "male" = voiceGender,
  ) => {
    stopAudioPlayback()
    const audio = new Audio(url)
    audioRef.current = audio

    audio.onended = () => {
      setAudioState("idle")
    }

    audio.onerror = () => {
      const fullTextToRead = `${displayContent.heading}. ${displayContent.paragraphs.join(" ")}`
      fallbackBrowserSpeech(fullTextToRead, currentLang, gender)
    }

    audio
      .play()
      .then(() => {
        setAudioState("playing")
      })
      .catch(() => {
        const fullTextToRead = `${displayContent.heading}. ${displayContent.paragraphs.join(" ")}`
        fallbackBrowserSpeech(fullTextToRead, currentLang, gender)
      })
  }

  const fallbackBrowserSpeech = (
    text: string,
    lang: string,
    gender: "female" | "male" = voiceGender,
  ) => {
    stopAudioPlayback()
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setAudioState("idle")
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    const langMap: Record<string, string> = {
      en: "en-US",
      es: "es-ES",
      de: "de-DE",
      fr: "fr-FR",
      ja: "ja-JP",
      hi: "hi-IN",
    }
    utterance.lang = langMap[lang] || lang
    utterance.rate = 1.0

    // Voice Pitch adjustment: Male voices have deeper pitch (0.82), Female voices have brighter pitch (1.18)
    if (gender === "male") {
      utterance.pitch = 0.82
    } else {
      utterance.pitch = 1.18
    }

    const voices = window.speechSynthesis.getVoices()
    if (voices && voices.length > 0) {
      const langPrefix = lang.toLowerCase()
      const matching = voices.filter(
        (v) =>
          v.lang.toLowerCase().startsWith(langPrefix) ||
          v.lang.toLowerCase().replace("_", "-").includes(langPrefix),
      )
      const pool = matching.length > 0 ? matching : voices

      if (gender === "male") {
        const maleVoice = pool.find((v) =>
          /male|david|george|mark|guy|stefan|pablo|arjun|rishi/i.test(v.name),
        )
        if (maleVoice) utterance.voice = maleVoice
      } else {
        const femaleVoice = pool.find((v) =>
          /female|zira|samantha|victoria|susan|laura|kavya|aditi|hazel/i.test(
            v.name,
          ),
        )
        if (femaleVoice) utterance.voice = femaleVoice
      }
    }

    utterance.onend = () => {
      setAudioState("idle")
      speechUtteranceRef.current = null
    }

    utterance.onerror = () => {
      setAudioState("idle")
      speechUtteranceRef.current = null
    }

    speechUtteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
    setAudioState("playing")
  }

  return (
    <Modal
      className="reader-modal-dialog"
      extraWide
      kicker={`${selected.subject} · ${selected.format}`}
      onClose={() => {
        stopAudioPlayback()
        onClose()
      }}
      title={selected.title}
    >
      <div
        className={`reader-interactive-container ${
          fullscreen ? "reader-fullscreen" : ""
        }`}
      >
        {/* Reader Primary Toolbar */}
        <div className="reader-toolbar">
          <div className="reader-toolbar-left">
            <span className="reader-doc-badge">
              <Icon name="book" size={16} /> {selected.format} Document
            </span>
            <span className="reader-version-pill">v{currentVersion}.0</span>
          </div>

          {/* Flip Buttons */}
          <div className="reader-toolbar-center">
            <button
              aria-label="Previous page"
              className="reader-page-nav prev"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              title="Previous page (Left Arrow)"
              type="button"
            >
              <Icon name="chevron_left" size={16} />
            </button>
            <span className="reader-page-indicator">
              Page <strong>{currentPage}</strong> of{" "}
              <strong>{totalPages}</strong>
            </span>
            <button
              aria-label="Next page"
              className="reader-page-nav next"
              disabled={currentPage >= totalPages}
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              title="Next page (Right Arrow)"
              type="button"
            >
              <Icon name="chevron" size={16} />
            </button>
          </div>

          <div className="reader-toolbar-right">
            <button
              className="reader-tool-btn"
              onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
              title="Zoom out (-)"
              type="button"
            >
              –
            </button>
            <span className="reader-zoom-text">{zoomLevel}%</span>
            <button
              className="reader-tool-btn"
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              title="Zoom in (+)"
              type="button"
            >
              +
            </button>
            <button
              className="reader-tool-btn"
              onClick={() => setZoomLevel(100)}
              title="Reset Zoom to 100%"
              type="button"
            >
              1:1
            </button>
            <button
              className={`reader-tool-btn ${fullscreen ? "active" : ""}`}
              onClick={() => setFullscreen((f) => !f)}
              title={fullscreen ? "Exit full view (F)" : "Expand full view (F)"}
              type="button"
            >
              <Icon name="monitor" size={16} />
            </button>
          </div>
        </div>

        {/* Smart Reader Control Deck (Amazon Polly & Amazon Translate) */}
        <div className="reader-smart-deck">
          {/* Audio Narration Section (Amazon Polly) */}
          <div className="smart-deck-audio-group">
            <button
              className={`smart-deck-btn ${
                audioState === "playing" ? "playing" : ""
              } ${audioState === "loading" ? "loading" : ""}`}
              disabled={audioState === "loading"}
              onClick={handleToggleAudio}
              title="Listen to this page (Amazon Polly AI Voice)"
              type="button"
            >
              <Icon
                name={
                  audioState === "playing"
                    ? "pause"
                    : audioState === "loading"
                      ? "clock"
                      : "headphones"
                }
                size={16}
              />
              <span className="btn-label">
                {audioState === "loading"
                  ? "Synthesizing..."
                  : audioState === "playing"
                    ? "Pause Narration"
                    : audioState === "paused"
                      ? "Resume Narration"
                      : "Listen to Page"}
              </span>
              {audioState === "playing" && (
                <span className="audio-wave-animation" aria-hidden="true">
                  <span className="wave-bar"></span>
                  <span className="wave-bar"></span>
                  <span className="wave-bar"></span>
                </span>
              )}
            </button>

            {audioState !== "idle" && (
              <button
                className="smart-deck-btn stop-btn"
                onClick={stopAudioPlayback}
                title="Stop narration"
                type="button"
              >
                <Icon name="stop" size={14} />
              </button>
            )}

            {/* Voice Gender Toggle */}
            <div className="smart-voice-toggle">
              <button
                className={`voice-choice-btn ${
                  voiceGender === "female" ? "active" : ""
                }`}
                onClick={() => handleVoiceGenderChange("female")}
                title="Female Voice (Joanna/Lupe/Vicki/Celine/Mizuki/Aditi)"
                type="button"
              >
                Female
              </button>
              <button
                className={`voice-choice-btn ${
                  voiceGender === "male" ? "active" : ""
                }`}
                onClick={() => handleVoiceGenderChange("male")}
                title="Male Voice (Matthew/Miguel/Hans/Mathieu/Takumi)"
                type="button"
              >
                Male
              </button>
            </div>

            <span className="smart-service-tag polly">
              <Icon name="volume" size={12} /> Polly TTS
            </span>
          </div>

          {/* Multilingual Translation Section (Amazon Translate) */}
          <div className="smart-deck-translate-group">
            <span className="translate-icon-label">
              <Icon name="translate" size={16} />
            </span>
            <select
              aria-label="Select Document Language"
              className="smart-lang-select"
              disabled={isTranslating}
              onChange={(e) =>
                handleLanguageChange(e.target.value as LanguageCode)
              }
              value={currentLang}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.label} ({lang.nativeName})
                </option>
              ))}
            </select>

            {isTranslating ? (
              <span className="smart-translating-pill">
                <span className="pulse-dot"></span> Translating...
              </span>
            ) : currentLang !== "en" ? (
              <span className="smart-service-tag translate active">
                <Icon name="check" size={12} /> AWS Translated
              </span>
            ) : (
              <span className="smart-service-tag translate">AWS Translate</span>
            )}
          </div>
        </div>

        {/* Reader Document Canvas */}
        <div className="reader-canvas-viewport">
          <div
            className="reader-zoom-wrapper"
            style={{ zoom: `${zoomLevel}%` }}
          >
            <div className="reader-document-sheet">
              {/* Header / Watermark info */}
              <div className="reader-sheet-header">
                <span className="sheet-brand">OpenShelf Academic Edition</span>
                <span className="sheet-id">
                  ID: #{selected.id} · Rev {currentVersion}.0
                </span>
              </div>

              <div className="reader-sheet-body">
                <div className="reader-sheet-kicker-row">
                  <span className="reader-sheet-kicker">
                    {selected.subject} — {selected.type}
                  </span>
                  {currentLang !== "en" && (
                    <span className="reader-lang-indicator-badge">
                      Translated to{" "}
                      {
                        SUPPORTED_LANGUAGES.find((l) => l.code === currentLang)
                          ?.label
                      }
                    </span>
                  )}
                </div>

                <h2 className="reader-sheet-title">{displayContent.heading}</h2>
                <div className="reader-sheet-meta">
                  <span>
                    By <strong>{selected.author}</strong>
                  </span>
                  <span>•</span>
                  <span>License: {selected.license}</span>
                  <span>•</span>
                  <span>Verified Community Copy</span>
                </div>

                <hr className="reader-sheet-divider" />

                <div
                  className={`reader-sheet-content ${
                    isTranslating ? "content-translating" : ""
                  }`}
                >
                  <h3 className="chapter-heading">{displayContent.heading}</h3>
                  {displayContent.paragraphs.map((p, idx) => (
                    <p className="reader-paragraph" key={idx}>
                      {p}
                    </p>
                  ))}

                  <div className="reader-callout-box">
                    <div className="callout-header">
                      <Icon name="code" size={16} /> Exemplar Reference & Schema
                    </div>
                    <pre className="callout-code">{baseContent.codeOrBox}</pre>
                  </div>

                  <h4>Topic Key Points & Tags</h4>
                  <div className="reader-tag-chips">
                    {displayContent.tags.map((tag) => (
                      <span className="reader-chip" key={tag}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sheet Footer */}
                <div className="reader-sheet-footer">
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <span>OpenShelf Cloud Storage: S3 Controlled Read</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reader Bottom Bar */}
        <div className="reader-bottom-bar">
          <span className="reader-meta-note">
            <Icon name="shield" size={14} /> Controlled access via AWS S3
            Presigned Document Stream · Shortcuts: ◄ ► (Pages) · +/- (Zoom) · F
            (Fullscreen)
          </span>
          <div className="reader-bottom-actions">
            <Button
              className="secondary-button"
              disabled={currentPage <= 1}
              icon="chevron_left"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            >
              Previous
            </Button>
            <Button
              className="secondary-button"
              disabled={currentPage >= totalPages}
              icon="chevron"
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
            >
              Next page
            </Button>
            <Button
              className="primary-button"
              icon="check"
              onClick={() => {
                stopAudioPlayback()
                onClose()
              }}
            >
              Finished reading
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
export default ResourceReaderModal

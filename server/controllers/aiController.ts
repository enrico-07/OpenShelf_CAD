/**
 * AI Services Controller for OpenShelf (Amazon Polly & Amazon Translate)
 */

import { Request, Response } from "express"
import {
  synthesizeSpeech,
  SUPPORTED_POLLY_VOICES,
} from "../aws/pollyClient.ts"
import {
  translateSingleText,
  translateBatchTexts,
  SUPPORTED_LANGUAGES,
} from "../aws/translateClient.ts"
import type { VoiceId } from "@aws-sdk/client-polly"

/**
 * POST /api/ai/synthesize-speech
 * Converts educational text into an MP3 audio stream using Amazon Polly
 */
export async function synthesizeSpeechHandler(req: Request, res: Response): Promise<void> {
  try {
    const { text, voiceId, languageCode = "en", gender = "female" } = req.body

    if (!text || typeof text !== "string") {
      res.status(400).json({
        success: false,
        error: "A valid 'text' string is required for speech synthesis.",
      })
      return
    }

    // Determine voice ID based on language and preference if not explicitly provided
    let selectedVoice: VoiceId = (voiceId as VoiceId) || "Joanna"
    if (!voiceId && SUPPORTED_POLLY_VOICES[languageCode]) {
      selectedVoice =
        gender === "male"
          ? SUPPORTED_POLLY_VOICES[languageCode].male
          : SUPPORTED_POLLY_VOICES[languageCode].female
    }

    const result = await synthesizeSpeech(text, selectedVoice)

    if (result.isFallback || result.audioBuffer.length === 0) {
      // Instruct client to use native browser speech synthesis fallback
      res.status(200).json({
        success: true,
        data: {
          fallback: true,
          voiceId: selectedVoice,
          languageCode,
          message: "AWS Polly standard voice streaming unavailable, using client speech fallback.",
        },
      })
      return
    }

    // Return the audio stream with binary audio/mpeg headers
    res.setHeader("Content-Type", result.contentType)
    res.setHeader("Content-Disposition", `inline; filename="narration-${selectedVoice}.mp3"`)
    res.setHeader("Cache-Control", "public, max-age=86400") // Cache 24h
    res.send(result.audioBuffer)
  } catch (err: any) {
    console.error("[aiController] Speech synthesis error:", err)
    res.status(500).json({
      success: false,
      error: err.message || "Failed to synthesize speech.",
    })
  }
}

/**
 * POST /api/ai/translate
 * Translates educational content using Amazon Translate
 */
export async function translateHandler(req: Request, res: Response): Promise<void> {
  try {
    const { text, texts, targetLanguage, sourceLanguage = "auto" } = req.body

    if (!targetLanguage || typeof targetLanguage !== "string") {
      res.status(400).json({
        success: false,
        error: "A valid 'targetLanguage' code (e.g. 'es', 'de', 'hi', 'ta', 'ml') is required.",
      })
      return
    }

    // Verify target language is supported
    const isSupported = SUPPORTED_LANGUAGES.some((l) => l.code === targetLanguage)
    if (!isSupported) {
      res.status(400).json({
        success: false,
        error: `Target language '${targetLanguage}' is not currently enabled. Enabled languages: ${SUPPORTED_LANGUAGES.map(
          (l) => l.code
        ).join(", ")}`,
      })
      return
    }

    // Single text translation
    if (typeof text === "string" && text.length > 0) {
      const result = await translateSingleText(text, targetLanguage, sourceLanguage)
      res.status(200).json({
        success: true,
        data: result,
      })
      return
    }

    // Batch texts translation (e.g. multiple paragraphs)
    if (Array.isArray(texts) && texts.length > 0) {
      const validTexts = texts.filter((t) => typeof t === "string")
      const result = await translateBatchTexts(validTexts, targetLanguage, sourceLanguage)
      res.status(200).json({
        success: true,
        data: result,
      })
      return
    }

    res.status(400).json({
      success: false,
      error: "Either 'text' string or 'texts' array must be provided.",
    })
  } catch (err: any) {
    console.error("[aiController] Translation error:", err)
    res.status(500).json({
      success: false,
      error: err.message || "Failed to translate content.",
    })
  }
}

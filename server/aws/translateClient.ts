/**
 * Amazon Translate Client for OpenShelf
 * Neural machine translation for educational documents across diverse languages.
 */

import {
  TranslateClient,
  TranslateTextCommand,
} from "@aws-sdk/client-translate"
import type { TranslateTextCommandInput } from "@aws-sdk/client-translate"
import { awsConfig } from "./config.ts"

export const translateClient = new TranslateClient({
  region: awsConfig.region,
  ...(awsConfig.credentials ? { credentials: awsConfig.credentials } : {}),
})

export interface TranslationResult {
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  isFallback?: boolean
}

export interface MultiTranslationResult {
  translatedTexts: string[]
  sourceLanguage: string
  targetLanguage: string
  isFallback?: boolean
}

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸", nativeName: "English" },
  { code: "es", label: "Spanish", flag: "🇪🇸", nativeName: "Español" },
  { code: "de", label: "German", flag: "🇩🇪", nativeName: "Deutsch" },
  { code: "fr", label: "French", flag: "🇫🇷", nativeName: "Français" },
  { code: "ja", label: "Japanese", flag: "🇯🇵", nativeName: "日本語" },
  { code: "hi", label: "Hindi", flag: "🇮🇳", nativeName: "हिन्दी" },
] as const

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"]

/**
 * Translates a single text string using Amazon Translate
 */
export async function translateSingleText(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = "auto"
): Promise<TranslationResult> {
  const safeText = text.slice(0, 3000).trim()

  if (!safeText) {
    return {
      translatedText: "",
      sourceLanguage,
      targetLanguage,
      isFallback: false,
    }
  }

  // If target language is same as source (or English default with en source), return original
  if (targetLanguage === sourceLanguage) {
    return {
      translatedText: safeText,
      sourceLanguage,
      targetLanguage,
      isFallback: false,
    }
  }

  if (awsConfig.isConfigured) {
    try {
      const params: TranslateTextCommandInput = {
        Text: safeText,
        SourceLanguageCode: sourceLanguage,
        TargetLanguageCode: targetLanguage,
      }

      const command = new TranslateTextCommand(params)
      const response = await translateClient.send(command)

      return {
        translatedText: response.TranslatedText || safeText,
        sourceLanguage: response.SourceLanguageCode || sourceLanguage,
        targetLanguage: response.TargetLanguageCode || targetLanguage,
        isFallback: false,
      }
    } catch (err: any) {
      console.warn("[Amazon Translate] Translation error, falling back:", err.message)
    }
  }

  // Fallback if AWS Translate is not configured or in local offline mode
  return {
    translatedText: safeText,
    sourceLanguage,
    targetLanguage,
    isFallback: true,
  }
}

/**
 * Translates multiple paragraphs or texts sequentially/in parallel
 */
export async function translateBatchTexts(
  texts: string[],
  targetLanguage: string,
  sourceLanguage: string = "auto"
): Promise<MultiTranslationResult> {
  const results = await Promise.all(
    texts.map((t) => translateSingleText(t, targetLanguage, sourceLanguage))
  )

  const isAnyFallback = results.some((r) => r.isFallback)
  const detectedSource = results[0]?.sourceLanguage || sourceLanguage

  return {
    translatedTexts: results.map((r) => r.translatedText),
    sourceLanguage: detectedSource,
    targetLanguage,
    isFallback: isAnyFallback,
  }
}

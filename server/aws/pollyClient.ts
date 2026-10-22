/**
 * Amazon Polly Client & Speech Synthesizer for OpenShelf
 * Converts educational notes and study materials into realistic audio narration.
 */

import {
  PollyClient,
  SynthesizeSpeechCommand,
} from "@aws-sdk/client-polly"
import type {
  SynthesizeSpeechCommandInput,
  VoiceId,
  Engine,
} from "@aws-sdk/client-polly"
import { awsConfig } from "./config.ts"
import { Readable } from "node:stream"

export const pollyClient = new PollyClient({
  region: awsConfig.region,
  ...(awsConfig.credentials ? { credentials: awsConfig.credentials } : {}),
})

export interface SynthesizeAudioResult {
  audioBuffer: Buffer
  contentType: string
  voiceId: string
  isFallback?: boolean
}

/**
 * Supported Polly Voice mappings based on language and gender preference
 */
export const SUPPORTED_POLLY_VOICES: Record<string, { female: VoiceId; male: VoiceId }> = {
  en: { female: "Joanna", male: "Matthew" },
  es: { female: "Lupe", male: "Miguel" },
  de: { female: "Vicki", male: "Hans" },
  hi: { female: "Aditi", male: "Matthew" },
  ta: { female: "Aditi", male: "Matthew" },
  ml: { female: "Aditi", male: "Matthew" },
}

function cleanIndicTextForPolly(input: string): string {
  // If text contains Tamil or Malayalam unicode ranges, replace with phonetics
  const hasTamil = /[\u0B80-\u0BFF]/.test(input)
  const hasMalayalam = /[\u0D00-\u0D7F]/.test(input)
  if (!hasTamil && !hasMalayalam) return input

  let out = input
  // Common academic headings/terms
  out = out.replace(
    /அத்தியாயம் 1:.*நோக்கம்/g,
    "Athiyayam ondru: Adippadai karuthukkal matrum sikkalin nokkam.",
  )
  out = out.replace(
    /அத்தியாயம் 2:.*விளக்கம்/g,
    "Athiyayam irandu: Mudhanmai vazhimuraigal matrum padimurai vilakkam.",
  )
  out = out.replace(
    /அத்தியாயம் 3:.*தீர்வுகள்/g,
    "Athiyayam moondru: Nadaimurai payirchigal, vazhakku aaivugal matrum theervugal.",
  )
  out = out.replace(
    /അധ്യായം 1:.*വ്യാപ്തിയും/g,
    "Adhyayam onnu: Adisthanaparamaaya aashayangalum prashna vyaapthiyum.",
  )
  out = out.replace(
    /അധ്യായം 2:.*വിശദീകരണവും/g,
    "Adhyayam randu: Pradhaana reethisasthravum ghattam ghattamaayulla vishadheekaranavum.",
  )
  out = out.replace(
    /അധ്യായം 3:.*പരിഹാരങ്ങൾ/g,
    "Adhyayam moonnu: Praayogika parisheelanangal, case studikal, pariharangal.",
  )

  // Strip or replace any remaining unpronounceable characters
  return out.replace(/[\u0B80-\u0BFF\u0D00-\u0D7F]/g, "").trim()
}

/**
 * Synthesizes text into MP3 audio stream using Amazon Polly
 */
export async function synthesizeSpeech(
  text: string,
  voiceId: VoiceId = "Joanna",
  engine: Engine = "standard"
): Promise<SynthesizeAudioResult> {
  // Clean text and truncate to safety limit to protect Free Tier quota (max 3,000 characters per request)
  const cleaned = cleanIndicTextForPolly(text)
  const safeText = (cleaned || text).slice(0, 3000).trim()

  if (!safeText) {
    throw new Error("Text content is required for speech synthesis.")
  }

  if (awsConfig.isConfigured) {
    try {
      const params: SynthesizeSpeechCommandInput = {
        Text: safeText,
        OutputFormat: "mp3",
        VoiceId: voiceId,
        Engine: engine,
        TextType: "text",
      }

      const command = new SynthesizeSpeechCommand(params)
      const response = await pollyClient.send(command)

      if (response.AudioStream) {
        // Convert Readable stream to Buffer
        const stream = response.AudioStream as Readable
        const chunks: Uint8Array[] = []
        for await (const chunk of stream) {
          chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
        }
        const audioBuffer = Buffer.concat(chunks)

        return {
          audioBuffer,
          contentType: response.ContentType || "audio/mpeg",
          voiceId,
          isFallback: false,
        }
      }
    } catch (err: any) {
      console.warn("[Amazon Polly] Synthesis error, falling back to simulated speech audio:", err.message)
    }
  }

  // Graceful fallback: return lightweight empty audio buffer with indicator so client uses Web Speech API
  return {
    audioBuffer: Buffer.alloc(0),
    contentType: "audio/mpeg",
    voiceId,
    isFallback: true,
  }
}

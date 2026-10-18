export function sanitizeText(input: unknown): string {
  if (typeof input !== "string") return ""
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/[<>'"&]/g, (char) => {
      switch (char) {
        case "<":
          return "&lt;"
        case ">":
          return "&gt;"
        case "'":
          return "&#39;"
        case '"':
          return "&quot;"
        case "&":
          return "&amp;"
        default:
          return char
      }
    })
    .trim()
}

export function isValidUrl(url: unknown): boolean {
  if (!url || typeof url !== "string") return false
  const trimmed = url.trim()
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

export function isValidEmail(email: unknown): boolean {
  if (!email || typeof email !== "string") return false
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
  return emailRegex.test(email.trim()) && email.length <= 254
}

export function stripDangerousKeys<T>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj

  if (Array.isArray(obj)) {
    return obj.map((item) => stripDangerousKeys(item)) as unknown as T
  }

  const clean: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue
    }
    clean[key] = stripDangerousKeys(value)
  }
  return clean as T
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validateResourceInput(data: any): ValidationResult {
  const errors: string[] = []

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Invalid request body"] }
  }

  if (!data.title || typeof data.title !== "string" || data.title.trim().length === 0) {
    errors.push("Title is required and must not be empty")
  } else if (data.title.length > 150) {
    errors.push("Title cannot exceed 150 characters")
  }

  if (!data.subject || typeof data.subject !== "string") {
    errors.push("Subject is required")
  }

  if (data.description && typeof data.description === "string" && data.description.length > 2000) {
    errors.push("Description cannot exceed 2000 characters")
  }

  if (data.link && !isValidUrl(data.link)) {
    errors.push("External link must be a valid http or https URL")
  }

  if (data.tags && !Array.isArray(data.tags)) {
    errors.push("Tags must be an array of strings")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function validateFeedbackInput(data: any): ValidationResult {
  const errors: string[] = []

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Invalid request body"] }
  }

  if (data.rating !== undefined && (typeof data.rating !== "number" || data.rating < 1 || data.rating > 5)) {
    errors.push("Rating must be an integer between 1 and 5")
  }

  if (data.text && typeof data.text === "string" && data.text.length > 1000) {
    errors.push("Feedback comment cannot exceed 1000 characters")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function validateReportInput(data: any): ValidationResult {
  const errors: string[] = []

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Invalid request body"] }
  }

  if (!data.reason || typeof data.reason !== "string" || data.reason.trim().length === 0) {
    errors.push("Reason is required")
  } else if (data.reason.length > 200) {
    errors.push("Reason cannot exceed 200 characters")
  }

  if (data.details && typeof data.details === "string" && data.details.length > 1500) {
    errors.push("Details cannot exceed 1500 characters")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

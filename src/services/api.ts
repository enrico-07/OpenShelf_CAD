import {
  Item,
  Version,
  Feedback,
  FeedbackReply,
  Note,
  Collection,
  Status,
  UserProfile,
} from "../types"
import {
  sanitizeString,
  sanitizeObject,
  getSafeStored,
  setSafeStored,
} from "../utils/security"

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api"

class SecureApiClient {
  private token: string | null = null

  constructor() {
    this.token = getSafeStored<string | null>("auth_token", null)
  }

  public setToken(token: string | null): void {
    this.token = token
    if (token) {
      setSafeStored("auth_token", token)
    } else {
      localStorage.removeItem("openshelf_auth_token")
    }
  }

  public getToken(): string | null {
    if (!this.token) {
      this.token = getSafeStored<string | null>("auth_token", null)
    }
    return this.token
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }
    const token = this.getToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
    return headers
  }

  private async request<T,>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {}),
      },
    }

    try {
      const response = await fetch(url, config)

      // Handle Rate Limiting
      if (response.status === 429) {
        const errorJson = await response.json().catch(() => ({}))
        const retryAfter =
          response.headers.get("Retry-After") ||
          errorJson.retryAfterSeconds ||
          "a few"
        throw new Error(
          errorJson.message ||
            `Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`,
        )
      }

      // Handle Unauthorized / Token Expiry
      if (response.status === 401) {
        this.setToken(null)
      }

      const json = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          json.message || json.error || `HTTP error ${response.status}`,
        )
      }

      return sanitizeObject(json.data ?? json) as T
    } catch (err: any) {
      // Re-throw rate limit or validation errors directly
      if (err.message && err.message.includes("Rate limit")) {
        throw err
      }
      throw err
    }
  }

  // --- Authentication ---

  async login(
    email: string,
    role: "learner" | "moderator" = "learner",
    name?: string,
  ): Promise<{ user: UserProfile, token: string }> {
    try {
      const res = await this.request<{ user: UserProfile, token: string }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            email: email.trim(),
            role,
            name: sanitizeString(name),
          }),
        },
      )
      if (res.token) {
        this.setToken(res.token)
      }
      return res
    } catch (err) {
      // Fallback for standalone demo mode
      const cleanName =
        sanitizeString(name) ||
        (role === "moderator" ? "Community Moderator" : "Learner")
      const demoUser: UserProfile = {
        name: cleanName,
        email: email.trim().toLowerCase(),
        role,
        avatarInitials: cleanName
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
      }
      return { user: demoUser, token: "demo-token" }
    }
  }

  async register(data: {
    name: string
    email: string
    password?: string
    role: "learner" | "moderator"
  }): Promise<{ user: UserProfile, token: string }> {
    return this.request<{ user: UserProfile, token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: sanitizeString(data.name),
        email: data.email.trim(),
        password: data.password || "SecurePassword123!",
        role: data.role,
      }),
    })
  }

  logout(): void {
    this.setToken(null)
    localStorage.removeItem("openshelf_user")
  }

  // --- Resources ---

  async getResources(params?: {
    q?: string
    subject?: string
    format?: string
    status?: string
  }): Promise<Item[]> {
    const searchParams = new URLSearchParams()
    if (params?.q) searchParams.set("q", sanitizeString(params.q))
    if (params?.subject) searchParams.set("subject", params.subject)
    if (params?.format) searchParams.set("format", params.format)
    if (params?.status) searchParams.set("status", params.status)

    const queryStr = searchParams.toString()
    const endpoint = `/resources${queryStr ? `?${queryStr}` : ""}`
    return this.request<Item[]>(endpoint)
  }

  async getResourceById(id: number): Promise<Item> {
    return this.request<Item>(`/resources/${id}`)
  }

  async uploadResource(item: Partial<Item>): Promise<Item> {
    const payload = {
      title: sanitizeString(item.title),
      subject: sanitizeString(item.subject),
      type: sanitizeString(item.type),
      description: sanitizeString(item.description),
      tags: Array.isArray(item.tags)
        ? item.tags.map((t) => sanitizeString(t)).filter(Boolean)
        : [],
      license: sanitizeString(item.license),
      attribution: sanitizeString(item.attribution),
      link: item.link ? item.link.trim() : undefined,
      color: item.color,
      pages: item.pages || 12,
    }

    return this.request<Item>("/resources", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async uploadRevision(
    resourceId: number,
    note: string,
    author: string,
  ): Promise<Version> {
    return this.request<Version>(`/resources/${resourceId}/revisions`, {
      method: "POST",
      body: JSON.stringify({
        note: sanitizeString(note),
        author: sanitizeString(author),
      }),
    })
  }

  async getVersions(resourceId: number): Promise<Version[]> {
    return this.request<Version[]>(`/resources/${resourceId}/versions`)
  }

  async getFeedback(resourceId: number): Promise<Feedback[]> {
    return this.request<Feedback[]>(`/resources/${resourceId}/feedback`)
  }

  async submitFeedback(
    resourceId: number,
    feedbackItem: Omit<Feedback, "id">,
  ): Promise<Feedback> {
    return this.request<Feedback>(`/resources/${resourceId}/feedback`, {
      method: "POST",
      body: JSON.stringify({
        rating: feedbackItem.rating,
        text: sanitizeString(feedbackItem.text),
      }),
    })
  }

  async replyFeedback(
    resourceId: number,
    feedbackId: number,
    text: string,
  ): Promise<FeedbackReply> {
    return this.request<FeedbackReply>(
      `/resources/${resourceId}/feedback/${feedbackId}/reply`,
      {
        method: "POST",
        body: JSON.stringify({
          text: sanitizeString(text),
        }),
      },
    )
  }

  async submitReport(
    resourceId: number,
    reason: string,
    details?: string,
  ): Promise<boolean> {
    await this.request(`/resources/${resourceId}/report`, {
      method: "POST",
      body: JSON.stringify({
        reason: sanitizeString(reason),
        details: sanitizeString(details),
      }),
    })
    return true
  }

  async getModerationQueue(): Promise<Item[]> {
    return this.request<Item[]>("/moderation/queue")
  }

  async moderateResource(resourceId: number, status: Status): Promise<boolean> {
    await this.request(`/moderation/${resourceId}`, {
      method: "POST",
      body: JSON.stringify({ status }),
    })
    return true
  }

  async getPresignedDownloadUrl(
    resourceId: number,
    versionNum: number,
  ): Promise<string> {
    const res = await this.request<{ downloadUrl: string }>(
      `/resources/${resourceId}/download-url?version=${versionNum}`,
    )
    return res.downloadUrl
  }

  async getCollections(): Promise<Collection[]> {
    return this.request<Collection[]>("/collections")
  }

  async createCollection(
    name: string,
    description?: string,
    ids?: number[],
  ): Promise<Collection> {
    return this.request<Collection>("/collections", {
      method: "POST",
      body: JSON.stringify({
        name: sanitizeString(name),
        description: sanitizeString(description),
        ids: ids || [],
      }),
    })
  }

  async getNotes(): Promise<Note[]> {
    return this.request<Note[]>("/notes")
  }

  async markNoteRead(noteId: number): Promise<boolean> {
    await this.request(`/notes/${noteId}/read`, {
      method: "PUT",
    })
    return true
  }
}

export const api = new SecureApiClient()
export default api

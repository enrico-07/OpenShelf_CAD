export type IconName = "archive" | "arrow" | "bell" | "book" | "bookmark" | "calculate" | "chart" | "check" | "chevron" | "chevron_left" | "clock" | "close" | "code" | "collection" | "compass" | "download" | "filter" | "flag" | "folder" | "heart" | "history" | "layers" | "logout" | "mail" | "menu" | "message" | "monitor" | "moon" | "more" | "plus" | "psychology" | "science" | "school" | "search" | "settings" | "shelves" | "shield" | "star" | "sun" | "upload" | "user" | "users" | "versions"

export type Status = "approved" | "pending" | "rejected" | "reported"

export type ThemePref = "light" | "dark" | "system"

export type Resource = {
  id: number
  title: string
  subject: string
  type: string
  author: string
  initials: string
  rating: number
  saves: number
  format: string
  updated: string
  description: string
  tags: string[]
  color: string
  pages: number
  versions: number
  featured?: boolean
}

export type Item = Resource & {
  status: Status
  license: string
  mine?: boolean
  reportReason?: string
  attribution?: string
  link?: string
  file?: string
}

export type Version = {
  number: number
  note: string
  author: string
  when: string
  file: string
  size?: string
  diffSummary?: {
    added: string[]
    removed: string[]
    modified: string[]
  }
}

export type FeedbackReply = {
  id: number
  author: string
  initials: string
  text: string
  when: string
  role?: "learner" | "author" | "moderator"
}

export type Feedback = {
  id: number
  author: string
  initials: string
  rating: number
  text: string
  when: string
  helpful: number
  replies?: FeedbackReply[]
}

export type Note = {
  id: number
  tone: "blue" | "green" | "amber" | "rose"
  icon: IconName
  title: string
  body: string
  when: string
  read: boolean
}

export type Collection = {
  id: number
  name: string
  description: string
  ids: number[]
  tone: string
}

export type UserProfile = {
  name: string
  email: string
  role: "learner" | "moderator" | "guest"
  avatarInitials?: string
}

export type NotificationPreferences = {
  email: boolean
  digest: boolean
  moderation: boolean
  feedback: boolean
}

export type SubjectInfo = [IconName, string, string]

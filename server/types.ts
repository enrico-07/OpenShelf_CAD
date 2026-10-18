export type Status = "approved" | "pending" | "rejected" | "reported"

export interface Resource {
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

export interface Item extends Resource {
  status: Status
  license: string
  mine?: boolean
  reportReason?: string
  attribution?: string
  link?: string
  file?: string
}

export interface Version {
  number: number
  note: string
  author: string
  when: string
  file: string
  size?: string
}

export interface FeedbackReply {
  id: number
  author: string
  initials: string
  text: string
  when: string
  role?: "learner" | "author" | "moderator"
}

export interface Feedback {
  id: number
  author: string
  initials: string
  rating: number
  text: string
  when: string
  helpful: number
  replies?: FeedbackReply[]
}

export interface Note {
  id: number
  tone: "blue" | "green" | "amber" | "rose"
  icon: string
  title: string
  body: string
  when: string
  read: boolean
}

export interface Collection {
  id: number
  name: string
  description: string
  ids: number[]
  tone: string
}

export interface UserProfile {
  id?: string
  name: string
  email: string
  role: "learner" | "moderator"
  avatarInitials?: string
}

export interface AuthTokenPayload {
  userId: string
  name: string
  email: string
  role: "learner" | "moderator"
  iat?: number
  exp?: number
}

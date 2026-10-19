/**
 * Amazon DynamoDB Service Layer for OpenShelf
 * Handles data persistence to DynamoDB with seamless fallback to in-memory store.
 */

import {
  GetCommand,
  PutCommand,
  ScanCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb"
import { dynamoDocClient } from "../aws/dynamoClient.ts"
import { awsConfig } from "../aws/config.ts"
import type {
  Item,
  Version,
  Feedback,
  FeedbackReply,
  Note,
  Collection,
  Status,
  UserProfile,
} from "../types.ts"

// Local fallback in-memory store
const localStore = {
  items: [] as Item[],
  versions: {} as Record<number, Version[]>,
  feedback: {} as Record<number, Feedback[]>,
  notes: [] as Note[],
  collections: [] as Collection[],
  users: [] as (UserProfile & { passwordHash?: string })[],
}

export class DynamoDbService {
  private tables = awsConfig.dynamoDb.tables

  // ==========================================
  // RESOURCES
  // ==========================================

  public async getResources(filters?: {
    query?: string
    subject?: string
    format?: string
    status?: string
    isModerator?: boolean
  }): Promise<Item[]> {
    try {
      if (!awsConfig.isConfigured) {
        return this.filterLocalResources(filters)
      }

      const res = await dynamoDocClient.send(
        new ScanCommand({
          TableName: this.tables.resources,
        })
      )

      let items = (res.Items as Item[]) || []
      return this.applyFilters(items, filters)
    } catch (err: any) {
      console.warn(`[DynamoDB] getResources fallback: ${err.message}`)
      return this.filterLocalResources(filters)
    }
  }

  public async getResourceById(id: number): Promise<Item | null> {
    try {
      if (!awsConfig.isConfigured) {
        return localStore.items.find((i) => i.id === id) || null
      }

      const res = await dynamoDocClient.send(
        new GetCommand({
          TableName: this.tables.resources,
          Key: { id },
        })
      )
      return (res.Item as Item) || null
    } catch (err: any) {
      console.warn(`[DynamoDB] getResourceById fallback: ${err.message}`)
      return localStore.items.find((i) => i.id === id) || null
    }
  }

  public async putResource(item: Item): Promise<Item> {
    // Keep local store in sync
    const idx = localStore.items.findIndex((i) => i.id === item.id)
    if (idx >= 0) {
      localStore.items[idx] = item
    } else {
      localStore.items.push(item)
    }

    try {
      if (awsConfig.isConfigured) {
        await dynamoDocClient.send(
          new PutCommand({
            TableName: this.tables.resources,
            Item: item,
          })
        )
      }
    } catch (err: any) {
      console.warn(`[DynamoDB] putResource fallback: ${err.message}`)
    }

    return item
  }

  public async updateResourceStatus(
    id: number,
    status: Status,
    reportReason?: string
  ): Promise<Item | null> {
    const item = await this.getResourceById(id)
    if (!item) return null

    item.status = status
    if (reportReason !== undefined) {
      item.reportReason = reportReason
    } else if (status === "approved") {
      delete item.reportReason
    }

    return this.putResource(item)
  }

  public async incrementSaves(id: number): Promise<number> {
    const item = await this.getResourceById(id)
    if (!item) return 0
    item.saves = (item.saves || 0) + 1
    await this.putResource(item)
    return item.saves
  }

  // ==========================================
  // RESOURCE VERSIONS
  // ==========================================

  public async getVersions(resourceId: number): Promise<Version[]> {
    try {
      if (!awsConfig.isConfigured) {
        return localStore.versions[resourceId] || []
      }

      const res = await dynamoDocClient.send(
        new QueryCommand({
          TableName: this.tables.resourceVersions,
          KeyConditionExpression: "resourceId = :rid",
          ExpressionAttributeValues: {
            ":rid": resourceId,
          },
        })
      )

      return (res.Items as (Version & { resourceId: number })[]) || []
    } catch (err: any) {
      console.warn(`[DynamoDB] getVersions fallback: ${err.message}`)
      return localStore.versions[resourceId] || []
    }
  }

  public async putVersion(resourceId: number, version: Version): Promise<Version> {
    if (!localStore.versions[resourceId]) {
      localStore.versions[resourceId] = []
    }
    localStore.versions[resourceId].push(version)

    try {
      if (awsConfig.isConfigured) {
        await dynamoDocClient.send(
          new PutCommand({
            TableName: this.tables.resourceVersions,
            Item: {
              resourceId,
              version: version.number,
              ...version,
            },
          })
        )
      }
    } catch (err: any) {
      console.warn(`[DynamoDB] putVersion fallback: ${err.message}`)
    }

    return version
  }

  // ==========================================
  // FEEDBACK & RATINGS
  // ==========================================

  public async getFeedback(resourceId: number): Promise<Feedback[]> {
    try {
      if (!awsConfig.isConfigured) {
        return localStore.feedback[resourceId] || []
      }

      const res = await dynamoDocClient.send(
        new QueryCommand({
          TableName: this.tables.feedback,
          KeyConditionExpression: "resourceId = :rid",
          ExpressionAttributeValues: {
            ":rid": resourceId,
          },
        })
      )

      return (res.Items as (Feedback & { resourceId: number })[]) || []
    } catch (err: any) {
      console.warn(`[DynamoDB] getFeedback fallback: ${err.message}`)
      return localStore.feedback[resourceId] || []
    }
  }

  public async putFeedback(resourceId: number, feedbackItem: Feedback): Promise<Feedback> {
    if (!localStore.feedback[resourceId]) {
      localStore.feedback[resourceId] = []
    }
    localStore.feedback[resourceId].push(feedbackItem)

    try {
      if (awsConfig.isConfigured) {
        await dynamoDocClient.send(
          new PutCommand({
            TableName: this.tables.feedback,
            Item: {
              resourceId,
              id: feedbackItem.id,
              ...feedbackItem,
            },
          })
        )
      }
    } catch (err: any) {
      console.warn(`[DynamoDB] putFeedback fallback: ${err.message}`)
    }

    return feedbackItem
  }

  public async addFeedbackReply(
    resourceId: number,
    feedbackId: number,
    reply: FeedbackReply
  ): Promise<Feedback | null> {
    const list = await this.getFeedback(resourceId)
    const target = list.find((f) => f.id === feedbackId)
    if (!target) return null

    if (!target.replies) target.replies = []
    target.replies.push(reply)

    await this.putFeedback(resourceId, target)
    return target
  }

  // ==========================================
  // USER LIBRARY & COLLECTIONS
  // ==========================================

  public async getCollections(): Promise<Collection[]> {
    try {
      if (!awsConfig.isConfigured) {
        return localStore.collections
      }

      const res = await dynamoDocClient.send(
        new ScanCommand({
          TableName: this.tables.collections,
        })
      )

      return (res.Items as Collection[]) || localStore.collections
    } catch (err: any) {
      console.warn(`[DynamoDB] getCollections fallback: ${err.message}`)
      return localStore.collections
    }
  }

  public async putCollection(collection: Collection): Promise<Collection> {
    const idx = localStore.collections.findIndex((c) => c.id === collection.id)
    if (idx >= 0) {
      localStore.collections[idx] = collection
    } else {
      localStore.collections.push(collection)
    }

    try {
      if (awsConfig.isConfigured) {
        await dynamoDocClient.send(
          new PutCommand({
            TableName: this.tables.collections,
            Item: collection,
          })
        )
      }
    } catch (err: any) {
      console.warn(`[DynamoDB] putCollection fallback: ${err.message}`)
    }

    return collection
  }

  // ==========================================
  // NOTIFICATIONS (NOTES)
  // ==========================================

  public async getNotes(): Promise<Note[]> {
    try {
      if (!awsConfig.isConfigured) {
        return localStore.notes
      }

      const res = await dynamoDocClient.send(
        new ScanCommand({
          TableName: this.tables.userLibrary, // Can store in user library or dedicated table
        })
      )

      return (res.Items as Note[]) || localStore.notes
    } catch (err: any) {
      return localStore.notes
    }
  }

  public async putNote(note: Note): Promise<Note> {
    localStore.notes.unshift(note)
    return note
  }

  public async markNoteRead(id: number): Promise<boolean> {
    const target = localStore.notes.find((n) => n.id === id)
    if (target) {
      target.read = true
      return true
    }
    return false
  }

  // ==========================================
  // HELPER FILTERING LOGIC
  // ==========================================

  private filterLocalResources(filters?: {
    query?: string
    subject?: string
    format?: string
    status?: string
    isModerator?: boolean
  }): Item[] {
    return this.applyFilters(localStore.items, filters)
  }

  private applyFilters(
    items: Item[],
    filters?: {
      query?: string
      subject?: string
      format?: string
      status?: string
      isModerator?: boolean
    }
  ): Item[] {
    let filtered = [...items]

    if (!filters?.isModerator) {
      filtered = filtered.filter(
        (it) => it.status === "approved" || it.status === "reported"
      )
    } else if (filters.status) {
      filtered = filtered.filter((it) => it.status === filters.status)
    }

    if (filters?.query) {
      const q = filters.query.toLowerCase()
      filtered = filtered.filter(
        (it) =>
          it.title.toLowerCase().includes(q) ||
          it.subject.toLowerCase().includes(q) ||
          it.description.toLowerCase().includes(q) ||
          it.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    if (filters?.subject) {
      filtered = filtered.filter((it) => it.subject === filters.subject)
    }

    if (filters?.format && filters.format !== "Any format") {
      filtered = filtered.filter((it) => it.format === filters.format)
    }

    return filtered
  }
}

export const dynamoDbService = new DynamoDbService()
export default dynamoDbService

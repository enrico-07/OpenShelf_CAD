import {
  Item,
  Collection,
  Note,
  Feedback,
  Version,
  SubjectInfo,
  Resource,
} from "../types"

export const initialResources: Resource[] = []

export const subjects: SubjectInfo[] = [
  ["code", "Computer Science", "cobalt"],
  ["calculate", "Mathematics", "violet"],
  ["science", "Chemistry", "tangerine"],
  ["psychology", "Psychology", "rose"],
  ["history", "History", "forest"],
  ["school", "Study Skills", "sky"],
]

export const licenses = [
  "Creative Commons BY 4.0",
  "Creative Commons BY-NC 4.0",
  "Creative Commons BY-SA 4.0",
  "Shared with permission",
  "Public domain",
]

export const versionNotes = [
  "Initial upload",
  "Corrected references and examples",
  "Added worked examples",
  "Reorganised sections for clarity",
  "Fixed typos reported by learners",
  "Added glossary and summary page",
  "Improved diagrams and added practice prompts",
]

export const contributors: string[] = []

export function seedVersions(resource: Resource): Version[] {
  if (!resource || !resource.versions) return []
  return Array.from({ length: resource.versions }, (_, index) => {
    const number = resource.versions - index
    return {
      number,
      note:
        versionNotes[Math.min(number - 1, versionNotes.length - 1)] ||
        "Version update",
      author: resource.author,
      when: index === 0 ? resource.updated : `${index * 3} weeks ago`,
      file: `s3://openshelf-files/${resource.id}/v${number}.${resource.format.toLowerCase()}`,
      size: `${(1.2 + number * 0.4).toFixed(1)} MB`,
    }
  })
}

export const seedFeedback: Record<number, Feedback[]> = {}

export const seedNotes: Note[] = []

export const seedSubmissions: Item[] = []

export const seedCollections: Collection[] = []

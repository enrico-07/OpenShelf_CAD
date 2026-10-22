import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Item,
  Version,
  Feedback,
  Note,
  Collection,
  Status,
  UserProfile,
  NotificationPreferences,
} from "./types"
import {
  subjects,
  licenses,
  initialResources,
  seedSubmissions,
  seedVersions,
  seedFeedback,
  seedNotes,
  seedCollections,
} from "./data/seedData"
import { useTheme } from "./hooks/useTheme"
import { api } from "./services/api"
import {
  getSafeStored,
  setSafeStored,
  checkClientRateLimit,
  sanitizeString,
  sanitizeUrl,
} from "./utils/security"

// Components
import Toast from "./components/common/Toast"
import Sidebar from "./components/navigation/Sidebar"
import Topbar from "./components/navigation/Topbar"
import MobileBottomNav from "./components/navigation/MobileBottomNav"
import DetailDrawer from "./components/navigation/DetailDrawer"
import Icon from "./components/common/Icon"
import Breadcrumbs from "./components/common/Breadcrumbs"

// Views
import SignInView from "./views/SignInView"
import DiscoverView from "./views/DiscoverView"
import SubjectsView from "./views/SubjectsView"
import LibraryView from "./views/LibraryView"
import CollectionsView from "./views/CollectionsView"
import ContributionsView from "./views/ContributionsView"
import CommunityView from "./views/CommunityView"
import ModerationView from "./views/ModerationView"
import InsightsView from "./views/InsightsView"
import NotificationsView from "./views/NotificationsView"
import ProfileView from "./views/ProfileView"
import SettingsView from "./views/SettingsView"

// Modals
import UploadModal, { DraftState } from "./modals/UploadModal"
import VersionHistoryModal from "./modals/VersionHistoryModal"
import ReportModal from "./modals/ReportModal"
import CollectModal from "./modals/CollectModal"
import NewCollectionModal from "./modals/NewCollectionModal"
import ResourceReaderModal from "./modals/ResourceReaderModal"

export default function App() {
  const defaultItems = useMemo<Item[]>(
    () => [
      ...initialResources.map(
        (resource): Item => ({
          ...resource,
          status: resource.id === 6 ? "reported" : "approved",
          reportReason:
            resource.id === 6 ? "Shared without permission" : undefined,
          license:
            resource.id % 2
              ? "Creative Commons BY-NC 4.0"
              : "Creative Commons BY 4.0",
          mine: [1, 5].includes(resource.id),
        }),
      ),
      ...seedSubmissions,
    ],
    [],
  )

  const defaultVersions = useMemo(
    () =>
      Object.fromEntries(
        [...initialResources, ...seedSubmissions].map((resource) => [
          resource.id,
          seedVersions(resource),
        ]),
      ),
    [],
  )

  const [user, setUser] = useState<UserProfile | null>(() =>
    getSafeStored<UserProfile | null>("user", null),
  )
  const [activeView, setActiveView] = useState(() =>
    getSafeStored<string>("activeView", "Discover"),
  )
  const [isLoading, setIsLoading] = useState(false)

  const [items, setItems] = useState<Item[]>(() => {
    const stored = getSafeStored<Item[]>("items", [])
    return stored.length > 0 ? stored : defaultItems
  })

  const [versions, setVersions] = useState<Record<number, Version[]>>(() => {
    const stored = getSafeStored<Record<number, Version[]>>("versions", {})
    return Object.keys(stored).length > 0 ? stored : defaultVersions
  })

  const [feedback, setFeedback] = useState<Record<number, Feedback[]>>(() => {
    const stored = getSafeStored<Record<number, Feedback[]>>("feedback", {})
    return Object.keys(stored).length > 0 ? stored : seedFeedback
  })
  const [notes, setNotes] = useState<Note[]>(() => {
    const stored = getSafeStored<Note[]>("notes", [])
    return stored.length > 0 ? stored : seedNotes
  })
  const [collections, setCollections] = useState<Collection[]>(() => {
    const stored = getSafeStored<Collection[]>("collections", [])
    return stored.length > 0 ? stored : seedCollections
  })

  const [selectedId, setSelectedId] = useState(() =>
    getSafeStored<number>("selectedId", 0),
  )
  const [saved, setSaved] = useState<number[]>(() =>
    getSafeStored<number[]>("saved", []),
  )
  const [following, setFollowing] = useState<number[]>(() =>
    getSafeStored<number[]>("following", []),
  )
  const [followedSubjects, setFollowedSubjects] = useState<string[]>(() =>
    getSafeStored<string[]>("followedSubjects", []),
  )
  const [myRatings, setMyRatings] = useState<Record<number, number>>(() =>
    getSafeStored<Record<number, number>>("myRatings", {}),
  )

  // Synchronization with browser LocalStorage on changes
  useEffect(() => {
    setSafeStored("user", user)
  }, [user])

  useEffect(() => {
    setSafeStored("activeView", activeView)
  }, [activeView])

  useEffect(() => {
    setSafeStored("items", items)
  }, [items])

  useEffect(() => {
    setSafeStored("versions", versions)
  }, [versions])

  useEffect(() => {
    setSafeStored("feedback", feedback)
  }, [feedback])

  useEffect(() => {
    setSafeStored("notes", notes)
  }, [notes])

  useEffect(() => {
    setSafeStored("collections", collections)
  }, [collections])

  useEffect(() => {
    setSafeStored("saved", saved)
  }, [saved])

  useEffect(() => {
    setSafeStored("following", following)
  }, [following])

  useEffect(() => {
    setSafeStored("followedSubjects", followedSubjects)
  }, [followedSubjects])

  useEffect(() => {
    setSafeStored("myRatings", myRatings)
  }, [myRatings])

  useEffect(() => {
    setSafeStored("selectedId", selectedId)
  }, [selectedId])

  // Synchronize live data from Backend API and DynamoDB across devices
  const syncCloudData = useCallback(async () => {
    try {
      const isMod = user?.role === "moderator"
      const [cloudResources, queueItems] = await Promise.all([
        api.getResources().catch(() => null),
        isMod ? api.getModerationQueue().catch(() => []) : Promise.resolve([]),
      ])

      setItems((prev) => {
        const byId = new Map<number, Item>()
        // Preserve existing items
        prev.forEach((it) => byId.set(it.id, it))
        // Authoritatively update with cloud resources
        if (cloudResources && Array.isArray(cloudResources)) {
          cloudResources.forEach((it) => byId.set(it.id, it))
        }
        // Authoritatively update with moderation queue items (pending/reported)
        if (queueItems && Array.isArray(queueItems)) {
          queueItems.forEach((it) => byId.set(it.id, it))
        }
        return Array.from(byId.values())
      })
    } catch (err: any) {
      console.warn("[Cloud Sync Notice]:", err.message)
    }
  }, [user?.role])

  // Synchronize on mount AND whenever user role or active view changes
  useEffect(() => {
    syncCloudData()
  }, [syncCloudData, activeView])

  useEffect(() => {
    let active = true
    api
      .getNotes()
      .then((data) => {
        if (active && data && data.length > 0) {
          setNotes(data)
        }
      })
      .catch(() => {})

    api
      .getCollections()
      .then((data) => {
        if (active && data && data.length > 0) {
          setCollections(data)
        }
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [])

  // Filtering & Search
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("All resources")
  const [subject, setSubject] = useState("")
  const [format, setFormat] = useState("Any format")
  const [sort, setSort] = useState("Most relevant")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Modals & Panels
  const [upload, setUpload] = useState<null | { revisionOf?: number }>(null)
  const [uploadStep, setUploadStep] = useState(1)
  const emptyDraft: DraftState = {
    title: "",
    subject: subjects[0]?.[1] || "Computer Science",
    type: "Study guide",
    description: "",
    tags: "",
    license: licenses[0],
    attribution: "",
    link: "",
    file: "",
    note: "",
  }
  const [draft, setDraft] = useState<DraftState>(emptyDraft)

  const closeUpload = () => {
    setUpload(null)
    setUploadStep(1)
    setDraft({
      title: "",
      subject: subjects[0]?.[1] || "Computer Science",
      type: "Study guide",
      description: "",
      tags: "",
      license: licenses[0],
      attribution: "",
      link: "",
      file: "",
      note: "",
    })
  }

  const [modal, setModal] =
    useState<null | "versions" | "report" | "collect" | "newCollection" | "reader">(
      null,
    )
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMobileNav, setShowMobileNav] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailTab, setDetailTab] =
    useState<"overview" | "feedback" | "history">("overview")

  const [comment, setComment] = useState("")
  const [openCollection, setOpenCollection] = useState<number | null>(null)
  const [modTab, setModTab] = useState<Status>("pending")
  const [prefs, setPrefs] = useState<NotificationPreferences>(() =>
    getSafeStored<NotificationPreferences>("prefs", {
      email: true,
      digest: true,
      moderation: true,
      feedback: false,
    }),
  )
  useEffect(() => {
    setSafeStored("prefs", prefs)
  }, [prefs])

  const [toast, setToast] = useState("")

  const theme = useTheme()
  const toastTimer = useRef<number | undefined>(undefined)
  const searchRef = useRef<HTMLInputElement>(null)

  const published = items.filter(
    (item) => item.status === "approved" || item.status === "reported",
  )
  const selected = items.find((item) => item.id === selectedId) ?? items[0]
  const selectedVersions = selected ? (versions[selected.id] ?? []) : []
  const selectedFeedback = selected ? (feedback[selected.id] ?? []) : []
  const unread = notes.filter((note) => !note.read).length
  const queueCount = items.filter(
    (item) => item.status === "pending" || item.status === "reported",
  ).length

  const getInitials = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()

  const initials = user ? getInitials(user.name) : "CR"

  const visibleResources = useMemo(() => {
    const normalized = query.toLowerCase().trim()
    let result = published.filter((resource) => {
      const matchesQuery =
        !normalized ||
        `${resource.title} ${resource.subject} ${resource.type} ${resource.author} ${resource.tags.join(" ")}`
          .toLowerCase()
          .includes(normalized)
      const matchesFilter =
        filter === "All resources" ||
        (filter === "Study guides" && resource.type === "Study guide") ||
        (filter === "Revision notes" && resource.type === "Revision notes") ||
        (filter === "Reading lists" && resource.type === "Reading list") ||
        (filter === "Following" &&
          (following.includes(resource.id) ||
            followedSubjects.includes(resource.subject))) ||
        (filter === "Most saved" && resource.saves > 900)
      const matchesSubject = !subject || resource.subject === subject
      const matchesFormat =
        format === "Any format" || resource.format === format
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => resource.tags.includes(tag))
      return (
        matchesQuery &&
        matchesFilter &&
        matchesSubject &&
        matchesFormat &&
        matchesTags
      )
    })
    if (activeView === "My Library")
      result = result.filter((resource) => saved.includes(resource.id))
    if (sort === "Highest rated")
      result = [...result].sort((a, b) => b.rating - a.rating)
    if (sort === "Most saved")
      result = [...result].sort((a, b) => b.saves - a.saves)
    return result
  }, [
    activeView,
    filter,
    format,
    following,
    followedSubjects,
    published,
    query,
    saved,
    selectedTags,
    sort,
    subject,
  ])

  const flash = (message: string) => {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(""), 2600)
  }

  const notify = (note: Omit<Note, "id" | "read" | "when">) =>
    setNotes((current) => [
      { ...note, id: Date.now(), read: false, when: "Just now" },
      ...current,
    ])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  const handleReplyFeedback = async (feedbackId: number, text: string) => {
    if (!selected) return
    const rateCheck = checkClientRateLimit("reply", 2000)
    if (!rateCheck.allowed) {
      flash(
        `Please wait ${rateCheck.remainingSeconds}s before posting another reply`,
      )
      return
    }
    const cleanText = sanitizeString(text)
    try {
      const reply = await api.replyFeedback(selected.id, feedbackId, cleanText)
      setFeedback((current) => ({
        ...current,
        [selected.id]: (current[selected.id] ?? []).map((f) =>
          f.id === feedbackId
            ? {
                ...f,
                replies: [...(f.replies ?? []), reply],
              }
            : f,
        ),
      }))
      flash("Reply posted to thread")
    } catch {
      setFeedback((current) => ({
        ...current,
        [selected.id]: (current[selected.id] ?? []).map((f) =>
          f.id === feedbackId
            ? {
                ...f,
                replies: [
                  ...(f.replies ?? []),
                  {
                    id: Date.now(),
                    author: user?.name ?? "Contributor",
                    initials,
                    text: cleanText,
                    when: "Just now",
                    role: user?.role === "moderator" ? "moderator" : "learner",
                  },
                ],
              }
            : f,
        ),
      }))
      flash("Reply posted to thread")
    }
  }

  const toggleSave = (id: number) => {
    const isSaved = saved.includes(id)
    setSaved((current) =>
      isSaved ? current.filter((item) => item !== id) : [...current, id],
    )
    flash(isSaved ? "Removed from your library" : "Saved to your library")
  }

  const toggleFollow = (id: number) => {
    const on = following.includes(id)
    setFollowing((current) =>
      on ? current.filter((item) => item !== id) : [...current, id],
    )
    flash(
      on
        ? "Updates muted"
        : prefs.email
          ? "Following - email alerts enabled (SNS)"
          : "Following resource updates",
    )
  }

  const toggleSubject = (name: string) => {
    const on = followedSubjects.includes(name)
    setFollowedSubjects((current) =>
      on ? current.filter((item) => item !== name) : [...current, name],
    )
    flash(on ? `Unfollowed ${name}` : `Following ${name}`)
  }

  const openResource = (id: number) => {
    setSelectedId(id)
    setDetailTab("overview")
    setDetailOpen(true)
  }

  const openReader = (id?: number) => {
    const targetId = id !== undefined ? id : selectedId
    if (id !== undefined) {
      setSelectedId(id)
    }
    const target = items.find((i) => i.id === targetId) ?? selected
    if (target?.format === "Link" && target.link) {
      const safeLink = sanitizeUrl(target.link)
      if (safeLink) {
        window.open(safeLink, "_blank", "noopener,noreferrer")
      } else {
        flash("External link blocked: unsafe protocol detected")
      }
      return
    }
    setDetailTab("overview")
    setModal("reader")
  }

  const selectView = (view: string) => {
    setIsLoading(true)
    setActiveView(view)
    setShowMobileNav(false)
    setShowNotifications(false)
    setOpenCollection(null)
    if (view !== "Discover" && view !== "My Library") setQuery("")
    setTimeout(() => setIsLoading(false), 240)
  }

  const startUpload = (revisionOf?: number) => {
    if (user?.role === "guest") {
      flash(
        "Guest mode is read-only. Please create an account or sign in to publish study materials.",
      )
      return
    }
    const parent = items.find((item) => item.id === revisionOf)
    if (parent) {
      setDraft({
        title: parent.title,
        subject: parent.subject,
        type: parent.type,
        description: parent.description,
        tags: parent.tags.join(", "),
        license: parent.license,
        attribution: "",
        link: "",
        file: "",
        note: "",
      })
    } else {
      setDraft({
        title: "",
        subject: subjects[0]?.[1] || "Computer Science",
        type: "Study guide",
        description: "",
        tags: "",
        license: licenses[0],
        attribution: "",
        link: "",
        file: "",
        note: "",
      })
    }
    setUpload({ revisionOf })
    setUploadStep(1)
  }

  const submitUpload = async (event: FormEvent, uploadedFile?: File | null) => {
    event.preventDefault()
    if (uploadStep < 3) {
      setUploadStep((step) => step + 1)
      return
    }

    const rateCheck = checkClientRateLimit("upload", 3000)
    if (!rateCheck.allowed) {
      flash(
        `Rate limited: Please wait ${rateCheck.remainingSeconds}s before submitting again`,
      )
      return
    }

    const parent = items.find((item) => item.id === upload?.revisionOf)
    if (parent) {
      const cleanNote = sanitizeString(draft.note || "Community improvement")
      const authorName = user?.name ?? "Contributor"
      try {
        const newVer = await api.uploadRevision(
          parent.id,
          cleanNote,
          authorName,
        )

        // Direct-to-S3 upload for revision if file provided
        if (uploadedFile) {
          try {
            const presigned = await api.getPresignedUploadUrl(
              uploadedFile.name,
              uploadedFile.type || "application/pdf",
              parent.id,
              newVer.number,
            )
            await api.uploadFileToS3(presigned.uploadUrl, uploadedFile)
            console.log(
              `[S3] Streamed revision to ${presigned.bucket}/${presigned.s3Key}`,
            )
          } catch (uploadErr: any) {
            console.warn("[S3 Revision Upload Notice]:", uploadErr.message)
            flash(`Revision created, but S3 sync notice: ${uploadErr.message}`)
          }
        }

        setVersions((current) => ({
          ...current,
          [parent.id]: [newVer, ...(current[parent.id] ?? [])],
        }))
        setItems((current) =>
          current.map((item) =>
            item.id === parent.id
              ? { ...item, versions: newVer.number, updated: "Just now" }
              : item,
          ),
        )
        notify({
          tone: "blue",
          icon: "versions",
          title: "Revision published",
          body: `Version ${newVer.number} of ${parent.title} is live. Followers were notified via SNS.`,
        })
        flash(`Version ${newVer.number} added to the history`)
      } catch (err: any) {
        const msg =
          typeof err?.message === "string" && err.message !== "[object Object]"
            ? err.message
            : typeof err === "string"
              ? err
              : "Failed to submit revision"
        flash(msg)
      }
    } else {
      try {
        const cleanTitle = sanitizeString(draft.title)
        const cleanSubject = sanitizeString(draft.subject)
        const cleanType = sanitizeString(draft.type)
        const cleanDesc = sanitizeString(draft.description)
        const cleanTags = draft.tags
          .split(",")
          .map((tag) => sanitizeString(tag))
          .filter(Boolean)
        const cleanLicense = sanitizeString(draft.license)
        const cleanLink = draft.link ? sanitizeUrl(draft.link) : undefined

        const subjectColor =
          subjects.find(([, name]) => name === draft.subject)?.[2] ?? "cobalt"

        const newItem = await api.uploadResource({
          title: cleanTitle,
          subject: cleanSubject,
          type: cleanType,
          description: cleanDesc,
          tags: cleanTags,
          license: cleanLicense,
          attribution: sanitizeString(draft.attribution),
          link: cleanLink || undefined,
          color: subjectColor,
          pages: 12,
        })

        // Direct-to-S3 upload for initial resource if file provided
        if (uploadedFile) {
          try {
            const presigned = await api.getPresignedUploadUrl(
              uploadedFile.name,
              uploadedFile.type || "application/pdf",
              newItem.id,
              1,
            )
            await api.uploadFileToS3(presigned.uploadUrl, uploadedFile)
            console.log(
              `[S3] Streamed file to ${presigned.bucket}/${presigned.s3Key}`,
            )
            flash("Resource & PDF file successfully uploaded to Amazon S3!")
          } catch (uploadErr: any) {
            console.warn("[S3 Upload Notice]:", uploadErr.message)
            flash(`Uploaded metadata, but S3 sync notice: ${uploadErr.message}`)
          }
        }

        setItems((current) => [newItem, ...current])
        setVersions((current) => ({
          ...current,
          [newItem.id]: [
            {
              number: 1,
              note: "Initial upload",
              author: user?.name ?? "Contributor",
              when: "Just now",
              file: `s3://openshelf-files/${newItem.id}/v1.pdf`,
            },
          ],
        }))
        flash("Resource submitted securely for community review")
      } catch (err: any) {
        const msg =
          typeof err?.message === "string" && err.message !== "[object Object]"
            ? err.message
            : typeof err === "string"
              ? err
              : "Failed to submit resource"
        flash(msg)
      }
    }
    closeUpload()
  }

  const moderate = async (id: number, status: Status) => {
    if (user?.role !== "moderator") {
      flash("Access denied: Moderator role required")
      return
    }

    const target = items.find((item) => item.id === id)
    try {
      await api.moderateResource(id, status)
    } catch (err: any) {
      console.warn("Moderation cloud sync notice:", err?.message || err)
    }

    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              reportReason:
                status === "approved" ? undefined : item.reportReason,
            }
          : item,
      ),
    )
    if (target) {
      notify({
        tone: status === "approved" ? "green" : "rose",
        icon: status === "approved" ? "check" : "close",
        title:
          status === "approved"
            ? "Contribution approved"
            : "Contribution rejected",
        body: `${target.title} was ${status} by a moderator.`,
      })
    }
    flash(
      status === "approved"
        ? "Approved and published"
        : "Rejected - contributor notified",
    )
  }

  const submitFeedback = async () => {
    if (!selected) return
    const rating = myRatings[selected.id] ?? 0
    if (!comment.trim() && !rating) return

    const rateCheck = checkClientRateLimit("feedback", 2000)
    if (!rateCheck.allowed) {
      flash(
        `Rate limited: Please wait ${rateCheck.remainingSeconds}s before posting feedback`,
      )
      return
    }

    const cleanComment = sanitizeString(comment)
    try {
      const created = await api.submitFeedback(selected.id, {
        author: user?.name ?? "Contributor",
        initials,
        rating: rating || 5,
        text: cleanComment || "Rated this resource.",
        when: "Just now",
        helpful: 0,
      })
      setFeedback((current) => ({
        ...current,
        [selected.id]: [created, ...(current[selected.id] ?? [])],
      }))
      setComment("")
      flash("Thanks - your feedback is visible to the community")
    } catch (err: any) {
      flash(err.message || "Failed to submit feedback")
    }
  }

  const rate = (n: number) => {
    if (!selected) return
    setMyRatings((current) => ({ ...current, [selected.id]: n }))
    flash(`You rated this ${n} star${n > 1 ? "s" : ""}`)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const isInput =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement

      // Cmd/Ctrl + K: Focus global search
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        searchRef.current?.focus()
        return
      }

      // Cmd/Ctrl + U: Quick upload / share resource
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "u") {
        event.preventDefault()
        startUpload()
        return
      }

      // Escape: Close all active modals, popovers, and detail drawer
      if (event.key === "Escape") {
        setModal(null)
        setShowNotifications(false)
        setShowMobileNav(false)
        setDetailOpen(false)
        return
      }

      // Non-input navigation shortcuts
      if (!isInput && !modal) {
        // 's': Save / bookmark currently selected resource
        if (event.key === "s" || event.key === "S") {
          event.preventDefault()
          if (selected) toggleSave(selected.id)
        }
        // 'd' or '1': Switch to Discover
        else if (event.key === "1") {
          selectView("Discover")
        }
        // '2': Switch to My Library
        else if (event.key === "2") {
          selectView("My Library")
        }
        // '3': Switch to Collections
        else if (event.key === "3") {
          selectView("Collections")
        }
        // 'o': Open Reader for selected item
        else if (event.key === "o" || event.key === "O") {
          event.preventDefault()
          if (selected) setModal("reader")
        }
        // 't': Toggle Dark / Light theme
        else if (event.key === "t" || event.key === "T") {
          event.preventDefault()
          theme.toggle()
        }
        // 'n': Toggle Notifications popover
        else if (event.key === "n" || event.key === "N") {
          event.preventDefault()
          setShowNotifications((prev) => !prev)
        }
        // '?': Help toast showing available shortcuts
        else if (event.key === "?") {
          event.preventDefault()
          flash(
            "Shortcuts: ⌘K (Search) · ⌘U (Upload) · O (Reader) · S (Bookmark) · T (Theme) · 1-3 (Views)",
          )
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [modal, selected?.id, theme])

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  if (!user) {
    return (
      <SignInView
        items={items}
        onSignIn={async (creds) => {
          if (creds.mode === "up") {
            const res = await api.register({
              name:
                creds.name ||
                (creds.role === "moderator"
                  ? "Community Moderator"
                  : "Learner"),
              email: creds.email,
              password: creds.password,
              role: creds.role,
              moderatorCode: creds.moderatorCode,
            })
            setUser(res.user)
            flash(`Account created! Welcome, ${res.user.name}`)
          } else {
            const res = await api.login(
              creds.email,
              creds.password,
              creds.role,
              creds.name,
              creds.moderatorCode,
            )
            setUser(res.user)
            flash(`Signed in securely as ${res.user.name}`)
          }
        }}
        onGuestAccess={() => {
          const guestUser: UserProfile = {
            name: "Guest Learner",
            email: "guest@openshelf.local",
            role: "guest",
            avatarInitials: "GL",
          }
          setUser(guestUser)
          flash("Exploring OpenShelf in Guest Mode (Read-Only)")
        }}
        theme={theme}
      />
    )
  }

  const titles: Record<string, [string, string]> = {
    Discover: [
      "Discover",
      "Notes, guides and reading lists shared by the community.",
    ],
    "Browse subjects": [
      "Subjects",
      "Follow a subject to hear about new resources in it.",
    ],
    "My Library": ["My library", "Resources you have saved."],
    Collections: [
      "Collections",
      "Group resources by course, topic or project.",
    ],
    "My Contributions": [
      "My contributions",
      "Publishing status and versions of what you have shared.",
    ],
    Community: [
      "Community",
      "Recent feedback and the people improving resources.",
    ],
    Moderation: ["Moderation", "Review new submissions and reported content."],
    Insights: [
      "Platform health",
      "Errors, latency, failed requests and background jobs.",
    ],
    Notifications: [
      "Notifications",
      "Updates from resources and subjects you follow.",
    ],
    Profile: [user.name, "Your public contributor profile."],
    Settings: ["Settings", "Appearance, notifications and account."],
  }

  const [viewTitle, viewCopy] = titles[activeView] ?? titles.Discover
  const mine = items.filter((item) => item.mine)
  const allFeedback = Object.entries(feedback).flatMap(([id, list]) =>
    list.map((entry) => ({
      ...entry,
      resource: items.find((item) => item.id === Number(id)),
    })),
  )
  const featuredItem = items.find((item) => item.id === 1) ?? items[0]
  const draftParent = items.find((item) => item.id === upload?.revisionOf)

  const renderCurrentView = () => {
    switch (activeView) {
      case "Browse subjects":
        return (
          <SubjectsView
            followedSubjects={followedSubjects}
            onSelectSubject={(subj) => {
              setSubject(subj)
              setActiveView("Discover")
              setShowFilters(true)
            }}
            onToggleSubject={toggleSubject}
            published={published}
            subjects={subjects}
          />
        )

      case "My Library":
        return (
          <LibraryView
            onBrowseMore={() => selectView("Discover")}
            onOpenResource={openResource}
            onToggleSave={toggleSave}
            saved={saved}
            savedResources={published.filter((res) => saved.includes(res.id))}
            selectedId={selectedId}
          />
        )

      case "Collections":
        return (
          <CollectionsView
            collections={collections}
            items={items}
            onCloseCollection={() => setOpenCollection(null)}
            onDeleteCollection={(id) => {
              setCollections((list) => list.filter((c) => c.id !== id))
              setOpenCollection(null)
              flash("Collection deleted")
            }}
            onOpenCollection={setOpenCollection}
            onOpenResource={openResource}
            onStartNewCollection={() => setModal("newCollection")}
            onToggleSave={toggleSave}
            openCollection={openCollection}
            saved={saved}
            selectedId={selectedId}
          />
        )

      case "My Contributions":
        return (
          <ContributionsView
            mine={mine}
            onOpenResource={openResource}
            onStartUpload={startUpload}
            versions={versions}
          />
        )

      case "Community":
        return (
          <CommunityView
            allFeedback={allFeedback}
            onOpenResource={(id) => {
              openResource(id)
              setDetailTab("feedback")
            }}
          />
        )

      case "Moderation":
        return (
          <ModerationView
            isModerator={user.role === "moderator"}
            items={items}
            modTab={modTab}
            onModerate={moderate}
            onOpenReader={openReader}
            onOpenResource={openResource}
            onSelectModTab={setModTab}
            onRefresh={syncCloudData}
            onUpgradeWithPasskey={async (passkey) => {
              try {
                const res = await api.upgradeRole(passkey)
                setUser(res.user)
                flash("Moderator privileges verified & unlocked!")
                await syncCloudData()
                return true
              } catch (err: any) {
                flash(err.message || "Invalid passkey")
                return false
              }
            }}
          />
        )

      case "Insights":
        return <InsightsView />

      case "Notifications":
        return (
          <NotificationsView
            notes={notes}
            onMarkAllRead={() =>
              setNotes((list) => list.map((n) => ({ ...n, read: true })))
            }
            onReadNote={(id) =>
              setNotes((list) =>
                list.map((n) => (n.id === id ? { ...n, read: true } : n)),
              )
            }
            unreadCount={unread}
          />
        )

      case "Profile":
        return (
          <ProfileView
            collectionsCount={collections.length}
            followedSubjects={followedSubjects}
            followingCount={following.length + followedSubjects.length}
            mine={mine}
            onEditProfile={() => selectView("Settings")}
            onOpenResource={openResource}
            onToggleSave={toggleSave}
            saved={saved}
            savedCount={saved.length}
            selectedId={selectedId}
            user={user}
          />
        )

      case "Settings":
        return (
          <SettingsView
            onSaveSettings={() => flash("Settings saved")}
            onSignOut={() => {
              api.logout()
              setUser(null)
              flash("Signed out securely")
            }}
            onTogglePref={(k) => setPrefs((p) => ({ ...p, [k]: !p[k] }))}
            onUpdateUserName={(name) => setUser({ ...user, name })}
            onUpgradeToModerator={async (passkey) => {
              try {
                const res = await api.upgradeRole(passkey)
                setUser(res.user)
                flash("Moderator privileges verified & unlocked!")
                return true
              } catch (err: any) {
                flash(err.message || "Invalid passkey")
                return false
              }
            }}
            prefs={prefs}
            theme={theme}
            user={user}
          />
        )

      case "Discover":
      default:
        return (
          <DiscoverView
            featuredItem={featuredItem}
            filter={filter}
            followedSubjects={followedSubjects}
            format={format}
            isLoading={isLoading}
            onFilterChange={setFilter}
            onFormatChange={setFormat}
            onOpenReader={openReader}
            onOpenResource={openResource}
            onResetFilters={() => {
              setQuery("")
              setFilter("All resources")
              setSubject("")
              setFormat("Any format")
              setSelectedTags([])
            }}
            onSelectView={selectView}
            onSortChange={setSort}
            onSubjectChange={setSubject}
            onToggleFilters={() => setShowFilters((v) => !v)}
            onToggleSave={toggleSave}
            onToggleSubject={toggleSubject}
            onToggleTag={toggleTag}
            published={published}
            query={query}
            saved={saved}
            selectedId={selectedId}
            selectedTags={selectedTags}
            showFilters={showFilters}
            sort={sort}
            subject={subject}
            visibleResources={visibleResources}
          />
        )
    }
  }

  return (
    <div
      className={`app-shell ${detailOpen ? "detail-open" : "detail-closed"}`}
    >
      <div
        aria-hidden="true"
        className={`scrim ${showMobileNav || detailOpen ? "visible" : ""} ${
          detailOpen ? "for-detail" : ""
        }`}
        onClick={() => {
          setShowMobileNav(false)
          setDetailOpen(false)
        }}
      />

      <Sidebar
        activeView={activeView}
        collectionsCount={collections.length}
        onCloseMobileNav={() => setShowMobileNav(false)}
        onSelectView={selectView}
        onStartUpload={() => startUpload()}
        queueCount={queueCount}
        savedCount={saved.length}
        showMobileNav={showMobileNav}
        unreadCount={unread}
        user={user}
      />

      <main className="workspace">
        <Topbar
          detailOpen={detailOpen}
          onClearQuery={() => setQuery("")}
          onOpenMobileNav={() => setShowMobileNav(true)}
          onQueryChange={(val) => {
            setQuery(val)
            if (!["Discover", "My Library"].includes(activeView))
              setActiveView("Discover")
          }}
          onSelectSuggestion={(sug) => {
            setQuery(sug)
            if (!["Discover", "My Library"].includes(activeView))
              setActiveView("Discover")
          }}
          onSelectView={selectView}
          onSignOut={() => {
            api.logout()
            setUser(null)
            flash("Signed out securely")
          }}
          onStartUpload={() => startUpload()}
          onToggleDetail={() => setDetailOpen((v) => !v)}
          onToggleNotifications={() => setShowNotifications((o) => !o)}
          query={query}
          searchRef={searchRef}
          showNotifications={showNotifications}
          theme={theme}
          unreadCount={unread}
          user={user}
        />

        {showNotifications && (
          <div className="notification-popover">
            <div className="popover-heading">
              <div>
                <strong>Notifications</strong>
              </div>
              <button
                aria-label="Close notifications"
                className="icon-button small"
                onClick={() => setShowNotifications(false)}
                type="button"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
            {notes.length === 0 ? (
              <div
                style={{
                  padding: "20px 14px",
                  color: "var(--text-3)",
                  fontSize: "var(--fs-sm)",
                  textAlign: "center",
                }}
              >
                No new notifications
              </div>
            ) : (
              notes.slice(0, 3).map((note) => (
                <div
                  className={`notification ${note.read ? "" : "unread"}`}
                  key={note.id}
                >
                  <span className={`notification-icon ${note.tone}`}>
                    <Icon name={note.icon} size={17} />
                  </span>
                  <div>
                    <strong>{note.title}</strong>
                    <p>{note.body}</p>
                    <small>{note.when}</small>
                  </div>
                </div>
              ))
            )}
            <button
              className="view-all"
              onClick={() => selectView("Notifications")}
              type="button"
            >
              View all notifications <Icon name="arrow" size={16} />
            </button>
          </div>
        )}

        <section className="content">
          <Breadcrumbs
            items={[
              { label: "Home", view: "Discover" },
              ...(activeView !== "Discover" ? [{ label: activeView }] : []),
            ]}
            onNavigate={selectView}
          />
          <div className="view-enter-animation" key={activeView}>
            <div className="intro-row">
              <div>
                {activeView === "Discover" && (
                  <span className="greeting">
                    Good morning, {user.name.split(" ")[0]}
                  </span>
                )}
                <h1>{viewTitle}</h1>
                <p>{viewCopy}</p>
              </div>
            </div>
            {renderCurrentView()}
          </div>
        </section>
      </main>

      {selected && (
        <DetailDrawer
          comment={comment}
          detailTab={detailTab}
          following={following.includes(selected.id)}
          onClose={() => setDetailOpen(false)}
          onCommentChange={setComment}
          onDownload={async () => {
            const vNum = selectedVersions[0]?.number ?? 1
            try {
              const url = await api.getPresignedDownloadUrl(selected.id, vNum)
              flash("Secure tokenized S3 download verified (valid 5 min)")
              console.log("[OpenShelf Secure Download URL]:", url)
            } catch {
              flash("Downloading resource from secure storage")
            }
          }}
          onHelpfulFeedback={(feedbackId) => {
            setFeedback((all) => ({
              ...all,
              [selected.id]: (all[selected.id] ?? []).map((f) =>
                f.id === feedbackId ? { ...f, helpful: f.helpful + 1 } : f,
              ),
            }))
          }}
          onOpenCollect={() => setModal("collect")}
          onOpenReader={() => openReader(selected.id)}
          onOpenReport={() => setModal("report")}
          onOpenVersions={() => setModal("versions")}
          onRate={rate}
          onReplyFeedback={handleReplyFeedback}
          onSelectDetailTab={setDetailTab}
          onSelectTag={(tag) => {
            setQuery(tag)
            setActiveView("Discover")
          }}
          onStartUploadRevision={() => startUpload(selected.id)}
          onSubmitFeedback={submitFeedback}
          onToggleFollow={() => toggleFollow(selected.id)}
          onToggleSave={() => toggleSave(selected.id)}
          open={detailOpen}
          saved={saved.includes(selected.id)}
          selected={selected}
          selectedFeedback={selectedFeedback}
          selectedVersions={selectedVersions}
          userRating={myRatings[selected.id] ?? 0}
        />
      )}

      <MobileBottomNav
        activeView={activeView}
        onSelectView={selectView}
        onStartUpload={() => startUpload()}
      />

      {modal === "versions" && selected && (
        <VersionHistoryModal
          onClose={() => setModal(null)}
          onDownloadVersion={async (v) => {
            try {
              const url = await api.getPresignedDownloadUrl(selected.id, v)
              flash(`Downloading version ${v} from secure S3 (valid 5 min)`)
              console.log("[OpenShelf Secure Download URL]:", url)
            } catch {
              flash(`Downloading version ${v} from secure S3`)
            }
          }}
          selected={selected}
          selectedVersions={selectedVersions}
        />
      )}

      {modal === "report" && selected && (
        <ReportModal
          onClose={() => setModal(null)}
          onSubmitReport={async (reason, details) => {
            const rateCheck = checkClientRateLimit("report", 3000)
            if (!rateCheck.allowed) {
              flash(
                `Please wait ${rateCheck.remainingSeconds}s before submitting a report`,
              )
              return
            }
            try {
              await api.submitReport(selected.id, reason, details)
              setItems((list) =>
                list.map((item) =>
                  item.id === selected.id
                    ? { ...item, status: "reported", reportReason: reason }
                    : item,
                ),
              )
              setModal(null)
              flash("Report sent securely to community moderators")
            } catch (err: any) {
              flash(err.message || "Failed to submit report")
            }
          }}
        />
      )}

      {modal === "collect" && selected && (
        <CollectModal
          collections={collections}
          onClose={() => {
            setModal(null)
            flash("Collections updated")
          }}
          onOpenNewCollection={() => setModal("newCollection")}
          onToggleCollectionResource={(collectionId, resourceId) => {
            setCollections((list) =>
              list.map((c) =>
                c.id === collectionId
                  ? {
                      ...c,
                      ids: c.ids.includes(resourceId)
                        ? c.ids.filter((i) => i !== resourceId)
                        : [...c.ids, resourceId],
                    }
                  : c,
              ),
            )
          }}
          selected={selected}
        />
      )}

      {modal === "newCollection" && (
        <NewCollectionModal
          onClose={() => setModal(null)}
          onCreateCollection={(name, description) => {
            const tones = [
              "cobalt",
              "violet",
              "forest",
              "tangerine",
              "sky",
              "rose",
            ]
            setCollections((list) => [
              ...list,
              {
                id: Date.now(),
                name,
                description: description || "A personal collection.",
                ids: selected ? [selected.id] : [],
                tone: tones[list.length % tones.length],
              },
            ])
            setModal(null)
            flash("Collection created")
          }}
          selected={selected}
        />
      )}

      {modal === "reader" && selected && (
        <ResourceReaderModal
          onClose={() => setModal(null)}
          selected={selected}
          selectedVersions={selectedVersions}
        />
      )}

      {upload && (
        <UploadModal
          draft={draft}
          draftParent={draftParent}
          onClose={closeUpload}
          onDraftChange={setDraft}
          onStepChange={setUploadStep}
          onSubmit={submitUpload}
          uploadStep={uploadStep}
          versions={versions}
        />
      )}

      <Toast message={toast} />
    </div>
  )
}

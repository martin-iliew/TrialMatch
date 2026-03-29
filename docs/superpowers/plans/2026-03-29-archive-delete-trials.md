# Archive & Delete Trial Projects — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let sponsors archive non-draft trials (soft, terminal) and hard-delete draft trials, with a two-tab projects list (Active / Archived).

**Architecture:** Two new server actions (`archiveProject`, `deleteProject`) added to the existing `src/features/projects/actions.ts`. `getProjectsForSponsor` gains a `tab` parameter to filter by archived vs active. The projects list page reads `?tab=archived` from search params to switch tabs. A new `ArchiveDeleteActions` client component on the detail page renders the appropriate destructive button based on project status.

**Tech Stack:** Next.js App Router, Server Actions, Supabase, react-hook-form not needed (no form), sonner toasts, shadcn Button.

---

### Task 1: Add `archiveProject` and `deleteProject` server actions

**Files:**
- Modify: `src/features/projects/actions.ts`

- [ ] **Step 1: Add `archiveProject` to `src/features/projects/actions.ts`**

Append after `deleteRequirement`:

```ts
export async function archiveProject(projectId: string) {
  if (!projectId) return { error: "Invalid project ID" }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  const { data: project } = await supabase
    .from("trial_projects")
    .select("id, status")
    .eq("id", projectId)
    .eq("organization_id", profile?.organization_id ?? "")
    .single()

  if (!project) return { error: "Project not found" }
  if (project.status === "draft") return { error: "Draft projects cannot be archived — delete them instead" }
  if (project.status === "archived") return { error: "Project is already archived" }

  const { error } = await supabase
    .from("trial_projects")
    .update({ status: "archived" })
    .eq("id", projectId)

  if (error) return { error: error.message }
  revalidatePath("/sponsor/projects")
  return { error: null }
}
```

- [ ] **Step 2: Add `deleteProject` to `src/features/projects/actions.ts`**

Append directly after `archiveProject`:

```ts
export async function deleteProject(projectId: string) {
  if (!projectId) return { error: "Invalid project ID" }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  const { data: project } = await supabase
    .from("trial_projects")
    .select("id, status")
    .eq("id", projectId)
    .eq("organization_id", profile?.organization_id ?? "")
    .single()

  if (!project) return { error: "Project not found" }
  if (project.status !== "draft") return { error: "Only draft projects can be deleted" }

  const { error } = await supabase
    .from("trial_projects")
    .delete()
    .eq("id", projectId)

  if (error) return { error: error.message }
  revalidatePath("/sponsor/projects")
  return { error: null }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/projects/actions.ts
git commit -m "feat(projects): add archiveProject and deleteProject server actions"
```

---

### Task 2: Update `getProjectsForSponsor` to accept a tab filter

**Files:**
- Modify: `src/features/projects/queries.ts`

- [ ] **Step 1: Add `tab` parameter to `getProjectsForSponsor`**

Change the function signature and query from:

```ts
export async function getProjectsForSponsor(userId: string) {
```

to:

```ts
export async function getProjectsForSponsor(userId: string, tab: "active" | "archived" = "active") {
```

Then update the Supabase query block to filter by status. Replace:

```ts
  const { data: projects, error } = await supabase
    .from("trial_projects")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false })
```

with:

```ts
  const { data: projects, error } = await supabase
    .from("trial_projects")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .neq("status", tab === "active" ? "archived" : "not_archived")
    .eq("status", tab === "archived" ? "archived" : undefined as never)
    .order("created_at", { ascending: false })
```

Wait — that chained approach is awkward. Use a ternary on the filter instead. Replace the single query with:

```ts
  const baseQuery = supabase
    .from("trial_projects")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false })

  const { data: projects, error } = await (
    tab === "archived"
      ? baseQuery.eq("status", "archived")
      : baseQuery.neq("status", "archived")
  )
```

- [ ] **Step 2: Commit**

```bash
git add src/features/projects/queries.ts
git commit -m "feat(projects): filter getProjectsForSponsor by active/archived tab"
```

---

### Task 3: Add tabs to the projects list page

**Files:**
- Modify: `src/app/(sponsor)/sponsor/projects/page.tsx`

- [ ] **Step 1: Accept `searchParams` and read the active tab**

Update the page signature and data fetch:

```tsx
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProjectsForSponsor } from "@/features/projects/queries"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heading5, Body, BodySmall } from "@/components/ui/typography"
import { cn } from "@/lib/utils"

const statusColors: Record<string, string> = {
  draft: "bg-surface-level-2 text-secondary",
  active: "bg-surface-status-info text-icon-status-info",
  paused: "bg-surface-status-warning text-icon-status-warning",
  completed: "bg-surface-status-success text-icon-status-success",
  archived: "bg-surface-level-2 text-tertiary",
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab: tabParam } = await searchParams
  const tab = tabParam === "archived" ? "archived" : "active"

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: projects } = await getProjectsForSponsor(user.id, tab)

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Heading5>Trial Projects</Heading5>
        <Link href="/sponsor/projects/new">
          <Button>New Trial Project</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-primary">
        {(["active", "archived"] as const).map((t) => (
          <Link
            key={t}
            href={t === "active" ? "/sponsor/projects" : "/sponsor/projects?tab=archived"}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-body-small font-medium capitalize transition-colors",
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-secondary hover:text-primary"
            )}
          >
            {t === "active" ? "Active" : "Archived"}
          </Link>
        ))}
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-primary p-12 text-center">
          <Body className="text-secondary">
            {tab === "archived" ? "No archived projects" : "No projects yet"}
          </Body>
          {tab === "active" && (
            <BodySmall className="mt-1 text-tertiary">
              Create your first trial project to start matching with clinics.
            </BodySmall>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const area = project.therapeutic_areas as { name: string } | null
            return (
              <Link
                key={project.id}
                href={`/sponsor/projects/${project.id}`}
                className="block rounded-2xl border border-primary p-4 transition-colors hover:bg-subtle"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Body className="font-semibold">{project.title}</Body>
                    <div className="mt-1 flex items-center gap-2">
                      {area && (
                        <BodySmall className="text-secondary">{area.name}</BodySmall>
                      )}
                      {project.phase && (
                        <BodySmall className="text-secondary">Phase {project.phase}</BodySmall>
                      )}
                      {project.geographic_preference && (
                        <BodySmall className="text-secondary">
                          {project.geographic_preference}
                        </BodySmall>
                      )}
                    </div>
                  </div>
                  <Badge className={statusColors[project.status] ?? ""}>{project.status}</Badge>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/(sponsor)/sponsor/projects/page.tsx"
git commit -m "feat(projects): add Active/Archived tabs to projects list"
```

---

### Task 4: Create `ArchiveDeleteActions` client component

**Files:**
- Create: `src/app/(sponsor)/sponsor/projects/[id]/components/ArchiveDeleteActions.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { archiveProject, deleteProject } from "@/features/projects/actions"

export default function ArchiveDeleteActions({
  projectId,
  status,
}: {
  projectId: string
  status: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (status === "archived") return null

  async function handleArchive() {
    setLoading(true)
    const result = await archiveProject(projectId)
    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }
    toast.success("Project archived")
    router.push("/sponsor/projects")
  }

  async function handleDelete() {
    if (!window.confirm("Delete this draft? This cannot be undone.")) return
    setLoading(true)
    const result = await deleteProject(projectId)
    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }
    toast.success("Project deleted")
    router.push("/sponsor/projects")
  }

  return (
    <>
      {status === "draft" ? (
        <Button
          variant="outline"
          disabled={loading}
          onClick={handleDelete}
          className="border-icon-status-danger text-icon-status-danger hover:bg-surface-status-danger"
        >
          {loading ? "Deleting…" : "Delete"}
        </Button>
      ) : (
        <Button
          variant="outline"
          disabled={loading}
          onClick={handleArchive}
          className="border-primary text-secondary hover:bg-subtle"
        >
          {loading ? "Archiving…" : "Archive"}
        </Button>
      )}
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/(sponsor)/sponsor/projects/[id]/components/ArchiveDeleteActions.tsx"
git commit -m "feat(projects): add ArchiveDeleteActions client component"
```

---

### Task 5: Wire `ArchiveDeleteActions` into the project detail page

**Files:**
- Modify: `src/app/(sponsor)/sponsor/projects/[id]/page.tsx`

- [ ] **Step 1: Import and add to the action bar**

Add import at the top of the file (after `RunMatchButton` import):

```tsx
import ArchiveDeleteActions from "./components/ArchiveDeleteActions"
```

Then update the action bar at the bottom (the `div` with `className="mt-8 flex gap-3"`):

```tsx
      <div className="mt-8 flex gap-3">
        <RunMatchButton projectId={id} hasMatches={project.status === "active"} />
        {project.status === "active" && (
          <Link href={`/sponsor/projects/${id}/matches`}>
            <Button variant="outline">View Match Results</Button>
          </Link>
        )}
        <ArchiveDeleteActions projectId={id} status={project.status} />
      </div>
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/(sponsor)/sponsor/projects/[id]/page.tsx"
git commit -m "feat(projects): wire archive/delete actions into project detail page"
```

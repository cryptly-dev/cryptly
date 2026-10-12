<script lang="ts">
  import { GitBranch, SlidersHorizontal, Trash, Users } from "lucide-svelte";
  import type { Project } from "$lib/projects/projects.api";
  import ProjectTopbar from "$lib/projects/ui/ProjectTopbar.svelte";
  import { auth } from "$lib/stores/auth.svelte";
  import SettingsLayout from "$lib/ui/SettingsLayout.svelte";
  import DangerSection from "./DangerSection.svelte";
  import GeneralSection from "./GeneralSection.svelte";
  import GithubSection from "./GithubSection.svelte";
  import MembersSection from "./MembersSection.svelte";

  let { project }: { project: Project } = $props();

  const sections = [
    { id: "general", title: "General", icon: SlidersHorizontal },
    { id: "members", title: "Members", icon: Users },
    { id: "github", title: "GitHub sync", icon: GitBranch },
    { id: "danger", title: "Danger zone", icon: Trash },
  ];

  // The server enforces roles; this only hides actions the user can't take.
  const isAdmin = $derived(
    project.members.find((member) => member.id === auth.userData?.id)?.role ===
      "admin",
  );
</script>

<ProjectTopbar
  projectId={project.id}
  projectName={project.name}
  tab="settings"
/>
<SettingsLayout {sections}>
  <GeneralSection {project} {isAdmin} />
  <MembersSection {project} {isAdmin} />
  <GithubSection {project} {isAdmin} />
  <DangerSection {project} {isAdmin} />
</SettingsLayout>

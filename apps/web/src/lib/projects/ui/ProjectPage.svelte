<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { createPatch } from 'diff';
  import { onDestroy, onMount, tick } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';
  import {
    ArrowDownUp,
    ArrowLeft,
    Check,
    ChevronRight,
    CornerDownLeft,
    Copy,
    Crown,
    Eye,
    EyeOff,
    ExternalLink,
    Github,
    GripVertical,
    Info,
    Link,
    LogOut,
    Minus,
    Pencil,
    Plus,
    Search,
    Shield,
    Sparkles,
    Trash2,
    UserPlus,
    Users,
    Wand2,
    X
  } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';
  import {
    IntegrationsApi,
    type Integration,
    type Installation,
    type Repository
  } from '$lib/api/integrations.api';
  import { AsymmetricCrypto } from '$lib/auth/asymmetric-crypto';
  import {
    DEFAULT_PROJECT_SETTINGS,
    normalizeProjectSettings,
    type ProjectRevealOn,
    type ProjectSettings as ProjectSettingsType
  } from '$lib/auth/domain/project-settings';
  import { keystore } from '$lib/auth/keystore';
  import { SymmetricCrypto } from '$lib/auth/symmetric-crypto';
  import { UserApi } from '$lib/auth/user.api';
  import {
    ProjectsApi,
    type EncryptedVersion,
    type Project,
    type ProjectSearchResponse,
    type SuggestedUser
  } from '$lib/projects/projects.api';
  import {
    InvitationsApi,
    type Invitation,
    type InvitationListItem,
    type PersonalInvitationListItem
  } from '$lib/invitations/invitations.api';
  import {
    parseValueRangesFromString,
    type ParsedSecret
  } from '$lib/secrets/monaco/parser';
  import BulbIcon from '$lib/shared/ui/BulbIcon.svelte';
  import BracketsIcon from '$lib/shared/ui/BracketsIcon.svelte';
  import DiffEditor from './DiffEditor.svelte';
  import GripLoader from '$lib/shared/ui/GripLoader.svelte';
  import HistoryIcon from '$lib/shared/ui/HistoryIcon.svelte';
  import SlidersIcon from '$lib/shared/ui/SlidersIcon.svelte';
  import YearHeatmap from './YearHeatmap.svelte';
  import { publicEnv } from '$lib/shared/env/public-env';
  import { accountLoadErrorMessage, auth, loadUserData, logout } from '$lib/stores/auth.svelte';
  import { keyAuth } from '$lib/stores/key.svelte';
  import ProjectUnsavedNavGuard from '$lib/projects/ui/ProjectUnsavedNavGuard.svelte';
import SecretsEditorPage from '$lib/secrets/ui/SecretsEditorPage.svelte';
  import { getCompactRelativeTime } from '$lib/utils';

  let { projectId }: { projectId: string } = $props();

  type TabType = 'editor' | 'history' | 'members' | 'integrations' | 'settings';
  const ACTIVE_TAB_STORAGE_KEY = 'cryptly.project.activeTab';

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'editor', label: 'Editor', icon: BracketsIcon },
    { id: 'history', label: 'History', icon: HistoryIcon },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'integrations', label: 'GitHub secrets', icon: Github },
    { id: 'settings', label: 'Settings', icon: SlidersIcon }
  ];

  let projects = $state<Project[] | null>(null);
  let activeProject = $state<Project | null>(null);
  let displayedProjectId = $state('');
  let pendingProjectId = $state<string | null>(null);
  let loading = $state(true);
  let loadError = $state<string | null>(null);
  let searchQuery = $state('');
  let searchableProjects = $state<SearchableProject[]>([]);
  let searchableProjectsLoading = $state(false);
  let activeTab = $state<TabType>(readPersistedActiveTab());
  let showUserMenu = $state(false);
  let editingDisplayName = $state(false);
  let displayNameInput = $state('');
  let savingDisplayName = $state(false);
  let showCreateDialog = $state(false);
  let newProjectName = $state('');
  let creatingProject = $state(false);
  let createRevealOn = $state<ProjectRevealOn>(DEFAULT_PROJECT_SETTINGS.revealOn);
  let settingsDraft = $state<ProjectSettingsType>(DEFAULT_PROJECT_SETTINGS);
  let savingSettings = $state(false);
  let showRenameForm = $state(false);
  let renameProjectName = $state('');
  let renamingProject = $state(false);
  let revealEditing = $state(false);
  let showDeleteConfirm = $state(false);
  let showAddPeopleDialog = $state(false);
  let showIntegrationDialog = $state(false);
  let selectedInstallationEntityId = $state('');
  let integrationRepoSearch = $state('');
  let connectingIntegration = $state(false);
  let connectingIntegrationRepoId = $state<number | null>(null);
  let disconnectingIntegrationId = $state<string | null>(null);
  let installingGithubApp = $state(false);
  let addPeopleStep = $state<'type' | 'suggested-user' | 'role' | 'done'>('type');
  let addPeopleType = $state<'invite-link' | 'suggested-user' | null>(null);
  let selectedSuggestedUser = $state<SuggestedUser | null>(null);
  let suggestedUsers = $state<SuggestedUser[]>([]);
  let suggestedUsersLoading = $state(false);
  let invitePassphrase = $state('');
  let inviteCopiedField = $state<'link' | 'code' | null>(null);
  let creatingInvitation = $state(false);
  let lastCreatedInvitation = $state<Invitation | null>(null);
  let pendingLinkInvitations = $state<InvitationListItem[]>([]);
  let pendingPersonalInvitations = $state<PersonalInvitationListItem[]>([]);
  let updatingMember = $state(false);
  let historyLoading = $state(false);
  let historyLocked = $state(false);
  let historyLoadMessage = $state<string | null>(null);
  let historyVersions = $state<HistoryVersion[]>([]);
  let selectedHistoryId = $state<string | null>(null);
  let historyQuery = $state('');
  let historyMode = $state<'added' | 'removed' | 'changed' | 'anywhere' | null>(null);
  let historySuggestionsOpen = $state(false);
  let historySuggestionIndex = $state(0);
  let historyTimeRange = $state<'all' | '24h' | '7d' | '30d'>('all');
  let selectedHistoryDay = $state<string | null>(null);
  let selectedHistoryAuthorId = $state<string | null>(null);
  let installations = $state<Installation[]>([]);
  let integrations = $state<Integration[]>([]);
  let integrationsLoading = $state(false);
  let allRepositories = $state<RepoWithInstallation[]>([]);
  let suggestionsLoading = $state(false);
  let acceptingRepoId = $state<number | null>(null);
  let dismissedRepoIds = $state<number[]>([]);
  let lastLoadKey = '';
  let loadSeq = 0;
  let switchTimer: ReturnType<typeof setTimeout> | null = null;
  let createInput: HTMLInputElement | undefined = $state();
  let historySearchInput: HTMLInputElement | undefined = $state();
  let selectedMemberId = $state<string | null>(null);
  let tabBar: HTMLDivElement | undefined = $state();
  let tabUnderline = $state({ left: 0, width: 0, ready: false });
  const tabElements = new Map<TabType, HTMLElement>();

  interface RepoWithInstallation extends Repository {
    installationEntityId: string;
  }

  interface SearchableProject {
    id: string;
    name: string;
    decryptedContent: string;
  }

  interface HistoryVersion extends EncryptedVersion {
    content?: string;
    patchContent: string;
    revealedPatchContent: string;
    additions: number;
    deletions: number;
  }

  const DEFAULT_AVATAR =
    'https://lh3.googleusercontent.com/a/ACg8ocLTdCSYO1ZsGrEcdHjKzsoi-ZM1fFd8TqoezaiIQXAe3AUwcQ=s96-c';
  const SYSTEM_AUTHOR_AVATAR =
    'https://api.dicebear.com/9.x/bottts-neutral/svg?scale=80&backgroundColor=546e7a,757575,6d4c41&seed=Avery';

  function isTabType(value: string | null): value is TabType {
    return value === 'editor' || value === 'history' || value === 'members' || value === 'integrations' || value === 'settings';
  }

  function readPersistedActiveTab(): TabType {
    if (!browser) return 'editor';
    const value = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
    return isTabType(value) ? value : 'editor';
  }

  function persistActiveTab(tab: TabType) {
    if (!browser) return;
    localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, tab);
  }

  function setActiveTab(tab: TabType) {
    activeTab = tab;
    persistActiveTab(tab);
  }

  const revealOptions: {
    key: ProjectRevealOn;
    label: string;
    description: string;
    icon: typeof Eye;
  }[] = [
    { key: 'always', label: 'Always', description: 'Values stay visible in the editor', icon: Eye },
    { key: 'hover', label: 'Hover', description: 'Values stay masked until hover or click', icon: Eye },
    { key: 'never', label: 'Never', description: 'Values stay masked and copy without revealing', icon: EyeOff }
  ];

  const roleMeta = {
    read: {
      label: 'Read',
      description: 'View secrets, project name, and integrations.',
      icon: Eye
    },
    write: {
      label: 'Write',
      description: 'Read access plus create, edit, and delete secrets.',
      icon: Pencil
    },
    admin: {
      label: 'Admin',
      description: 'Full control — integrations, members, and project settings.',
      icon: Crown
    }
  } as const;

  const historySearchSuggestions = [
    {
      mode: 'added',
      label: 'was added',
      icon: Plus,
      chipClass: 'bg-emerald-500/15 text-emerald-400',
      verbClass: 'text-emerald-400'
    },
    {
      mode: 'removed',
      label: 'was removed',
      icon: Minus,
      chipClass: 'bg-rose-500/15 text-rose-400',
      verbClass: 'text-rose-400'
    },
    {
      mode: 'changed',
      label: 'was added or removed',
      icon: ArrowDownUp,
      chipClass: 'bg-neutral-800 text-neutral-300',
      verbClass: ''
    },
    {
      mode: 'anywhere',
      label: 'appears anywhere',
      icon: Sparkles,
      chipClass: 'bg-neutral-800 text-neutral-300',
      verbClass: ''
    }
  ] as const;

  const currentRole = $derived(
    activeProject?.members.find((member) => member.id === auth.userData?.id)?.role ?? 'read'
  );
  const isAdmin = $derived(currentRole === 'admin');
  const isSwitching = $derived(pendingProjectId !== null);
  const revealMeta = $derived.by(() => {
    const revealOn = normalizeProjectSettings(activeProject?.settings).revealOn;
    if (revealOn === 'always') {
      return {
        label: 'Always',
        description: 'Values are visible by default'
      };
    }
    if (revealOn === 'never') {
      return {
        label: 'Never',
        description: 'Values stay masked until copied'
      };
    }
    return {
      label: 'Hover',
      description: 'Values stay masked until hover or click'
    };
  });

  const uniqueProjects = $derived.by(() => {
    if (!projects) return projects;
    const seen = new Set<string>();
    return projects.filter((project) => {
      if (seen.has(project.id)) return false;
      seen.add(project.id);
      return true;
    });
  });

  const filteredProjects = $derived.by(() => {
    if (!uniqueProjects) return uniqueProjects;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return uniqueProjects;
    const contentMatches = new Set(
      searchableProjects
        .filter(
          (project) =>
            project.name.toLowerCase().includes(q) || project.decryptedContent.toLowerCase().includes(q)
        )
        .map((project) => project.id)
    );
    return uniqueProjects.filter(
      (project) => project.name.toLowerCase().includes(q) || contentMatches.has(project.id)
    );
  });

  const searchSnippets = $derived.by(() => {
    const q = searchQuery.trim().toLowerCase();
    const snippets = new Map<string, string>();
    if (!q) return snippets;
    for (const project of searchableProjects) {
      const haystack = project.decryptedContent.toLowerCase();
      const index = haystack.indexOf(q);
      if (index < 0) continue;
      const start = Math.max(0, index - 24);
      const end = Math.min(project.decryptedContent.length, index + q.length + 36);
      snippets.set(project.id, project.decryptedContent.slice(start, end).replace(/\s+/g, ' ').trim());
    }
    return snippets;
  });

  const suggestedProjects = $derived.by(() => {
    if (!allRepositories.length) return [];
    const dismissedSet = new Set(dismissedRepoIds);
    const projectNames = new Set((projects ?? []).map((project) => normalizeName(project.name)));
    return allRepositories
      .filter((repo) => !dismissedSet.has(repo.id) && !projectNames.has(normalizeName(repo.name)))
      .sort((a, b) => b.id - a.id)
      .slice(0, 2);
  });

  const suggestedIntegrations = $derived.by(() => {
    const projectTokens = tokenizeName(activeProject?.name ?? '');
    if (projectTokens.length === 0) return [];
    const connectedRepoIds = new Set(integrations.map((integration) => integration.githubRepositoryId));
    return allRepositories
      .map((repo) => ({ repo, score: connectedRepoIds.has(repo.id) ? 0 : scoreSuggestion(repo.name, projectTokens) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.repo);
  });

  const historyAuthors = $derived.by(() => {
    const counts = new Map<string, { id: string; displayName: string; avatarUrl: string; count: number }>();
    for (const version of historyVersions) {
      const id = version.author?.id ?? 'system';
      const current = counts.get(id);
      if (current) {
        current.count += 1;
      } else {
        counts.set(id, {
          id,
          displayName: version.author?.displayName || 'System',
          avatarUrl: version.author?.avatarUrl || DEFAULT_AVATAR,
          count: 1
        });
      }
    }
    return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 3);
  });
  const historyRevealOn = $derived(normalizeProjectSettings(activeProject?.settings).revealOn);

  const filteredHistory = $derived.by(() => {
    const now = Date.now();
    const trimmed = historyQuery.trim().toLowerCase();
    const rangeMs =
      historyTimeRange === '24h'
        ? 24 * 60 * 60 * 1000
        : historyTimeRange === '7d'
          ? 7 * 24 * 60 * 60 * 1000
          : historyTimeRange === '30d'
            ? 30 * 24 * 60 * 60 * 1000
            : null;
    return historyVersions.filter((version) => {
      const created = new Date(version.createdAt);
      if (rangeMs !== null && now - created.getTime() > rangeMs) return false;
      if (selectedHistoryAuthorId && version.author?.id !== selectedHistoryAuthorId) return false;
      if (selectedHistoryDay && isoDayKey(version.createdAt) !== selectedHistoryDay) return false;
      if (!trimmed) return true;
      const searchablePatch =
        historyRevealOn === 'always' ? version.revealedPatchContent : version.patchContent;
      const haystack = [
        version.author?.displayName ?? '',
        version.author?.email ?? '',
        searchablePatch
      ]
        .join('\n')
        .toLowerCase();
      if (historyMode === 'added') {
        return searchablePatch
          .split('\n')
          .some((line) => line.startsWith('+') && line.toLowerCase().includes(trimmed));
      }
      if (historyMode === 'removed') {
        return searchablePatch
          .split('\n')
          .some((line) => line.startsWith('-') && line.toLowerCase().includes(trimmed));
      }
      if (historyMode === 'changed') {
        return searchablePatch
          .split('\n')
          .some(
            (line) =>
              (line.startsWith('+') || line.startsWith('-')) &&
              line.toLowerCase().includes(trimmed)
          );
      }
      return haystack.includes(trimmed);
    });
  });

  const selectedHistory = $derived.by(
    () => historyVersions.find((version) => version.id === selectedHistoryId) ?? filteredHistory[0] ?? null
  );

  const maxHistoryVolume = $derived.by(() => {
    let max = 1;
    for (const version of filteredHistory) {
      max = Math.max(max, version.additions + version.deletions);
    }
    return max;
  });

  const selectedMember = $derived.by(
    () => activeProject?.members.find((member) => member.id === selectedMemberId) ?? null
  );

  const repositoriesForSelectedInstallation = $derived.by(() => {
    const q = integrationRepoSearch.trim().toLowerCase();
    const connectedRepoIds = new Set(integrations.map((integration) => integration.githubRepositoryId));
    return allRepositories.filter((repo) => {
      if (connectedRepoIds.has(repo.id)) return false;
      if (repo.installationEntityId !== selectedInstallationEntityId) return false;
      if (!q) return true;
      return `${repo.owner}/${repo.name}`.toLowerCase().includes(q);
    });
  });

  const inviteUrl = $derived(
    lastCreatedInvitation
      ? `${publicEnv.appUrl.replace(/\/$/, '')}/invite/${lastCreatedInvitation.id}`
      : ''
  );

  function normalizeName(name: string): string {
    return tokenizeName(name).join(' ');
  }

  function tokenizeName(name: string): string[] {
    return name
      .toLowerCase()
      .split(/[.\-_\s]+/)
      .filter((token) => token.length > 0);
  }

  function scoreSuggestion(repoName: string, projectTokens: string[]): number {
    const repoTokens = tokenizeName(repoName);
    return projectTokens.filter((projectToken) =>
      repoTokens.some(
        (repoToken) => repoToken.includes(projectToken) || projectToken.includes(repoToken)
      )
    ).length;
  }

  function isoDayKey(value: string): string {
    return new Date(value).toISOString().slice(0, 10);
  }

  function formatFullDate(value: string): string {
    return new Date(value).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatDayLabel(value: string): string {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  function cleanPatchContent(patch: string): string {
    return patch
      .split('\n')
      .filter((line) => {
        if (
          line.startsWith('---') ||
          line.startsWith('+++') ||
          line.startsWith('@@') ||
          line.startsWith('Index:') ||
          line.startsWith('\\')
        ) {
          return false;
        }
        return /^[+\-\s]/.test(line);
      })
      .join('\n');
  }

  function maskLineByRanges(lineText: string, lineNumber: number, parsedSecrets: ParsedSecret[]): string {
    let output = lineText;
    const ranges = parsedSecrets
      .map((secret) => secret.range)
      .filter((range) => lineNumber >= range.startLine && lineNumber <= range.endLine)
      .sort((a, b) => b.startCol - a.startCol);

    for (const range of ranges) {
      const startCol = lineNumber === range.startLine ? range.startCol : 1;
      const endCol = lineNumber === range.endLine ? range.endCol : lineText.length + 1;
      const start = Math.max(0, startCol - 1);
      const end = Math.max(start, Math.min(lineText.length, endCol - 1));
      const masked = output.slice(start, end).replace(/[^\t ]/g, '•');
      output = `${output.slice(0, start)}${masked}${output.slice(end)}`;
    }

    return output;
  }

  function cleanMaskedPatchContent(
    patch: string,
    oldContent: string,
    newContent: string,
    shouldMask: boolean
  ): string {
    if (!shouldMask) return cleanPatchContent(patch);

    const oldSecrets = parseValueRangesFromString(oldContent);
    const newSecrets = parseValueRangesFromString(newContent);
    const maskedLines: string[] = [];
    let oldLine = 0;
    let newLine = 0;

    for (const line of patch.split('\n')) {
      if (line.startsWith('@@')) {
        const match = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
        if (match) {
          oldLine = Number(match[1]);
          newLine = Number(match[2]);
        }
        continue;
      }
      if (
        line.startsWith('---') ||
        line.startsWith('+++') ||
        line.startsWith('Index:') ||
        line.startsWith('\\')
      ) {
        continue;
      }
      if (line.startsWith('+')) {
        maskedLines.push(`+${maskLineByRanges(line.slice(1), newLine, newSecrets)}`);
        newLine += 1;
        continue;
      }
      if (line.startsWith('-')) {
        maskedLines.push(`-${maskLineByRanges(line.slice(1), oldLine, oldSecrets)}`);
        oldLine += 1;
        continue;
      }
      if (line.startsWith(' ')) {
        maskedLines.push(` ${maskLineByRanges(line.slice(1), newLine, newSecrets)}`);
        oldLine += 1;
        newLine += 1;
      }
    }

    return maskedLines.join('\n');
  }

  function maskDocumentText(content: string, shouldMask: boolean): string {
    if (!shouldMask) return content;
    const parsedSecrets = parseValueRangesFromString(content);
    return content
      .split('\n')
      .map((line, index) => maskLineByRanges(line, index + 1, parsedSecrets))
      .join('\n');
  }

  function statsFromPatch(patch: string) {
    let additions = 0;
    let deletions = 0;
    for (const line of patch.split('\n')) {
      if (line.startsWith('+')) additions += 1;
      if (line.startsWith('-')) deletions += 1;
    }
    return { additions, deletions };
  }

  function revealIndex(value: ProjectRevealOn): number {
    return value === 'always' ? 0 : value === 'hover' ? 1 : 2;
  }

  function generateInviteCode(length = 16): string {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ123456789';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => chars[byte % chars.length]).join('');
  }

  function dialogContentTransition(_node: Element, { duration = 200 }: { duration?: number } = {}) {
    return {
      duration,
      easing: cubicOut,
      css: (t: number) => `
        opacity: ${t};
        scale: ${0.95 + t * 0.05};
      `
    };
  }

  function updateTabUnderline() {
    if (!tabBar) return;
    const activeElement = tabElements.get(activeTab);
    if (!activeElement) return;

    const activeRect = activeElement.getBoundingClientRect();
    const barRect = tabBar.getBoundingClientRect();
    tabUnderline = {
      left: activeRect.left - barRect.left + 8,
      width: Math.max(0, activeRect.width - 16),
      ready: true
    };
  }

  function trackTab(node: HTMLElement, tabId: TabType) {
    tabElements.set(tabId, node);
    requestAnimationFrame(updateTabUnderline);

    return {
      update(nextTabId: TabType) {
        tabElements.delete(tabId);
        tabId = nextTabId;
        tabElements.set(tabId, node);
        requestAnimationFrame(updateTabUnderline);
      },
      destroy() {
        tabElements.delete(tabId);
        requestAnimationFrame(updateTabUnderline);
      }
    };
  }

  function resetAddPeopleDialog() {
    addPeopleStep = 'type';
    addPeopleType = null;
    selectedSuggestedUser = null;
    invitePassphrase = '';
    inviteCopiedField = null;
    creatingInvitation = false;
    lastCreatedInvitation = null;
  }

  function closeAddPeopleDialog() {
    showAddPeopleDialog = false;
    setTimeout(resetAddPeopleDialog, 200);
  }

  function closeMemberDialog() {
    selectedMemberId = null;
  }

  function closeIntegrationDialog() {
    showIntegrationDialog = false;
    selectedInstallationEntityId = '';
    integrationRepoSearch = '';
  }

  function closeCreateDialog() {
    if (!creatingProject) {
      showCreateDialog = false;
    }
  }

  function clearHistorySearch() {
    historyQuery = '';
    historyMode = null;
    historySuggestionsOpen = false;
    historySuggestionIndex = 0;
  }

  function applyHistoryMode(mode: typeof historyMode) {
    historyMode = mode;
    historySuggestionsOpen = false;
    historySuggestionIndex = 0;
    tick().then(() => {
      document.querySelector<HTMLInputElement>('[data-history-search-input]')?.focus();
    });
  }

  function onProjectKeydown(event: KeyboardEvent) {
    if (activeTab !== 'history' || historyVersions.length === 0) return;

    const target = event.target as HTMLElement | null;
    const typingInInput =
      target &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

    const trimmed = historyQuery.trim();
    const searchInput = document.querySelector<HTMLInputElement>('[data-history-search-input]');

    if (event.key === '/' && !typingInInput) {
      event.preventDefault();
      searchInput?.focus();
      if (trimmed && !historyMode) historySuggestionsOpen = true;
      return;
    }

    if (target === searchInput) {
      const showSuggestions = historySuggestionsOpen && trimmed.length > 0 && !historyMode;
      if (showSuggestions) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          historySuggestionIndex = (historySuggestionIndex + 1) % historySearchSuggestions.length;
          return;
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          historySuggestionIndex =
            (historySuggestionIndex - 1 + historySearchSuggestions.length) %
            historySearchSuggestions.length;
          return;
        }
        if (event.key === 'Enter') {
          event.preventDefault();
          applyHistoryMode(historySearchSuggestions[historySuggestionIndex]!.mode);
          return;
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          historySuggestionsOpen = false;
          return;
        }
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        clearHistorySearch();
        searchInput?.blur();
      }
      return;
    }

    if (typingInInput || filteredHistory.length === 0) return;
    if (
      (event.key === 'j' || event.key === 'ArrowDown' || event.key === 'k' || event.key === 'ArrowUp') &&
      !event.metaKey &&
      !event.ctrlKey
    ) {
      event.preventDefault();
      if (document.activeElement instanceof HTMLElement && document.activeElement.tagName === 'BUTTON') {
        document.activeElement.blur();
      }
      const currentIndex = filteredHistory.findIndex((version) => version.id === selectedHistoryId);
      const delta = event.key === 'j' || event.key === 'ArrowDown' ? 1 : -1;
      const nextIndex =
        currentIndex < 0
          ? 0
          : Math.max(0, Math.min(filteredHistory.length - 1, currentIndex + delta));
      selectedHistoryId = filteredHistory[nextIndex]?.id ?? selectedHistoryId;
    }
  }

  async function getUnlockedProjectKey(project: Project): Promise<CryptoKey | null> {
    const userId = auth.userData?.id;
    let projectKey = await keystore.getProjectKey(project.id);
    if (projectKey) return projectKey;

    const masterKey = await keystore.getMasterKey();
    const encryptedKey = userId ? project.encryptedSecretsKeys?.[userId] : undefined;
    if (!masterKey || !encryptedKey) return null;

    const projectKeyB64 = await AsymmetricCrypto.decryptWithKey(encryptedKey, masterKey);
    projectKey = await SymmetricCrypto.importAesKey(projectKeyB64);
    await keystore.setProjectKey(project.id, projectKey);
    return projectKey;
  }

  async function getUnlockedSearchProjectKey(project: ProjectSearchResponse): Promise<CryptoKey | null> {
    const userId = auth.userData?.id;
    let projectKey = await keystore.getProjectKey(project.id);
    if (projectKey) return projectKey;

    const masterKey = await keystore.getMasterKey();
    const encryptedKey = userId ? project.encryptedSecretsKeys?.[userId] : undefined;
    if (!masterKey || !encryptedKey) return null;

    const projectKeyB64 = await AsymmetricCrypto.decryptWithKey(encryptedKey, masterKey);
    projectKey = await SymmetricCrypto.importAesKey(projectKeyB64);
    await keystore.setProjectKey(project.id, projectKey);
    return projectKey;
  }

  async function loadSearchableProjects() {
    const jwt = auth.jwtToken;
    if (!jwt || searchableProjectsLoading || searchableProjects.length > 0) return;
    searchableProjectsLoading = true;
    try {
      const results = await ProjectsApi.searchProjects(jwt);
      searchableProjects = await Promise.all(
        results.map(async (project) => {
          try {
            const projectKey = await getUnlockedSearchProjectKey(project);
            if (!projectKey) return { id: project.id, name: project.name, decryptedContent: '' };
            const decryptedContent = await SymmetricCrypto.decryptWithKey(
              project.encryptedSecrets,
              projectKey
            );
            return { id: project.id, name: project.name, decryptedContent };
          } catch {
            return { id: project.id, name: project.name, decryptedContent: '' };
          }
        })
      );
    } catch {
      searchableProjects = [];
    } finally {
      searchableProjectsLoading = false;
    }
  }

  $effect(() => {
    if (searchQuery.trim()) void loadSearchableProjects();
  });

  const MIN_SWITCH_MS = 500;

  function clearSwitchTimer() {
    if (switchTimer) {
      clearTimeout(switchTimer);
      switchTimer = null;
    }
  }

  onDestroy(() => {
    clearSwitchTimer();
  });

  onMount(() => {
    updateTabUnderline();
    window.addEventListener('resize', updateTabUnderline);
    window.addEventListener('keydown', onProjectKeydown);

    return () => {
      window.removeEventListener('resize', updateTabUnderline);
      window.removeEventListener('keydown', onProjectKeydown);
    };
  });

  function applyLoadedProject(project: Project, jwt: string, targetProjectId: string, seq: number) {
    if (seq !== loadSeq) return;
    activeProject = project;
    displayedProjectId = targetProjectId;
    pendingProjectId = null;
    loading = false;
    settingsDraft = normalizeProjectSettings(project.settings);
    renameProjectName = project.name;
    void loadHistory(jwt, project);
    void loadIntegrations(jwt, project.id);
    void loadPendingInvitations(jwt, project);
  }

  async function loadPendingInvitations(jwt: string, project: Project) {
    const uid = auth.userData?.id;
    const role = uid ? project.members?.find((m) => m.id === uid)?.role : undefined;
    if (role !== 'admin') {
      pendingLinkInvitations = [];
      pendingPersonalInvitations = [];
      return;
    }
    try {
      const [link, personal] = await Promise.all([
        InvitationsApi.getProjectInvitations(jwt, project.id),
        InvitationsApi.getProjectPersonalInvitations(jwt, project.id)
      ]);
      pendingLinkInvitations = link;
      pendingPersonalInvitations = personal;
    } catch {
      pendingLinkInvitations = [];
      pendingPersonalInvitations = [];
    }
  }

  async function revokePendingLinkInvitation(invitationId: string) {
    const jwt = auth.jwtToken;
    if (!jwt || !activeProject) return;
    try {
      await InvitationsApi.deleteInvitation(jwt, invitationId);
      pendingLinkInvitations = pendingLinkInvitations.filter((i) => i.id !== invitationId);
    } catch {
      toast.error('Failed to revoke invitation');
    }
  }

  async function revokePendingPersonalInvitation(invitationId: string) {
    const jwt = auth.jwtToken;
    if (!jwt || !activeProject) return;
    try {
      await InvitationsApi.deletePersonalInvitation(jwt, invitationId);
      pendingPersonalInvitations = pendingPersonalInvitations.filter((i) => i.id !== invitationId);
    } catch {
      toast.error('Failed to revoke invitation');
    }
  }

  async function loadShell(targetProjectId = projectId) {
    const seq = ++loadSeq;
    clearSwitchTimer();
    const jwt = auth.jwtToken;
    if (!jwt) {
      void goto('/app/login');
      return;
    }

    const switching = Boolean(activeProject && targetProjectId !== displayedProjectId);
    const startedAt = Date.now();
    if (switching) {
      pendingProjectId = targetProjectId;
    } else {
      loading = true;
      pendingProjectId = null;
    }
    loadError = null;
    const ok = await loadUserData();
    if (!ok) {
      if (!auth.jwtToken) return;
      if (seq === loadSeq) {
        loadError = accountLoadErrorMessage();
        loading = false;
        pendingProjectId = null;
      }
      return;
    }
    const activeJwt = auth.jwtToken;
    if (!activeJwt) {
      void goto('/app/login');
      return;
    }
    displayNameInput = auth.userData?.displayName ?? '';

    try {
      const list = await ProjectsApi.getProjects(activeJwt);
      if (seq !== loadSeq) return;
      projects = list;
      if (list.length === 0) {
        void goto('/app/project', { replaceState: true });
        return;
      }

      const found = list.find((project) => project.id === targetProjectId);
      if (!found) {
        void goto(`/app/project/${list[0]!.id}`, { replaceState: true });
        return;
      }

      void loadSuggestions(activeJwt);
      if (switching) {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, MIN_SWITCH_MS - elapsed);
        switchTimer = setTimeout(() => {
          switchTimer = null;
          applyLoadedProject(found, activeJwt, targetProjectId, seq);
        }, remaining);
      } else {
        applyLoadedProject(found, activeJwt, targetProjectId, seq);
      }
    } catch (error) {
      if (seq !== loadSeq) return;
      if (switching) {
        pendingProjectId = null;
        toast.error(error instanceof Error ? error.message : 'Failed to load project');
      } else {
        loadError = error instanceof Error ? error.message : 'Failed to load projects';
        loading = false;
      }
    }
  }

  async function loadHistory(jwt: string, project: Project) {
    historyLoading = true;
    historyLocked = false;
    historyLoadMessage = null;
    try {
      const versions = await ProjectsApi.getProjectVersions(jwt, project.id);
      const userId = auth.userData?.id;
      const encryptedKey = userId ? project.encryptedSecretsKeys?.[userId] : undefined;
      if (!encryptedKey) {
        historyVersions = [];
        historyLoadMessage = 'You do not have a secrets key for this project.';
        return;
      }

      const projectKey = await getUnlockedProjectKey(project);
      if (!projectKey) {
        historyVersions = [];
        historyLocked = true;
        historyLoadMessage = 'Unlock your safe to view encrypted history.';
        return;
      }
      const decryptedVersions = await Promise.all(
        versions.map(async (version) => {
          let content = '';
          try {
            content = projectKey
              ? await SymmetricCrypto.decryptWithKey(version.encryptedSecrets, projectKey)
              : '';
          } catch {
            content = '';
          }
          return {
            ...version,
            content
          };
        })
      );

      const chronologicalVersions = [...decryptedVersions].reverse();
      const patches: HistoryVersion[] = [];
      const firstVersion = chronologicalVersions[0];
      if (firstVersion) {
        const revealedInitialPatch = firstVersion.content
          .split('\n')
          .map((line) => `+${line}`)
          .join('\n');
        const initialPatch = maskDocumentText(firstVersion.content, true)
          .split('\n')
          .map((line) => `+${line}`)
          .join('\n');
        const stats = statsFromPatch(initialPatch);
        patches.push({
          ...firstVersion,
          id: `initial_${firstVersion.id}`,
          author: {
            id: 'system',
            avatarUrl: SYSTEM_AUTHOR_AVATAR,
            displayName: 'System',
            role: 'read'
          },
          patchContent: initialPatch,
          revealedPatchContent: revealedInitialPatch,
          additions: stats.additions,
          deletions: stats.deletions
        });
      }

      for (let i = 0; i < chronologicalVersions.length - 1; i += 1) {
        const oldVersion = chronologicalVersions[i]!;
        const newVersion = chronologicalVersions[i + 1]!;
        const rawPatch = createPatch(`version_${i + 1}_to_${i + 2}`, oldVersion.content, newVersion.content);
        const revealedPatchContent = cleanPatchContent(rawPatch);
        const patchContent = cleanMaskedPatchContent(
          rawPatch,
          oldVersion.content,
          newVersion.content,
          true
        );
        const stats = statsFromPatch(patchContent);
        patches.push({
          ...newVersion,
          patchContent,
          revealedPatchContent,
          additions: stats.additions,
          deletions: stats.deletions
        });
      }

      historyVersions = patches.reverse();
      selectedHistoryId = historyVersions[0]?.id ?? null;
    } catch {
      historyVersions = [];
      historyLoadMessage = 'Could not load project history. Check your connection and try again.';
    } finally {
      historyLoading = false;
    }
  }

  async function loadSuggestions(jwt: string) {
    suggestionsLoading = true;
    try {
      const available = await IntegrationsApi.getInstallationAvailableForUser(jwt);
      installations = available;
      if (available.length === 0) {
        allRepositories = [];
        return;
      }
      const repos = await Promise.all(
        available.map(async (installation) => {
          const repositories = await IntegrationsApi.getRepositories(jwt, installation.id);
          return repositories.map((repo) => ({
            ...repo,
            installationEntityId: installation.id
          }));
        })
      );
      allRepositories = repos.flat();
    } catch {
      allRepositories = [];
    } finally {
      suggestionsLoading = false;
    }
  }

  async function loadIntegrations(jwt: string, targetProjectId: string) {
    integrationsLoading = true;
    try {
      integrations = await IntegrationsApi.getIntegrationsForProject(jwt, targetProjectId);
    } catch {
      integrations = [];
    } finally {
      integrationsLoading = false;
    }
  }

  $effect(() => {
    const key = `${auth.jwtToken ?? ''}:${projectId}`;
    if (key === lastLoadKey) return;
    lastLoadKey = key;
    void loadShell(projectId);
  });

  $effect(() => {
    if (!historyLocked || !keyAuth.hasMasterKey || !auth.jwtToken || !activeProject) return;
    void loadHistory(auth.jwtToken, activeProject);
  });

  $effect(() => {
    if (!showCreateDialog) return;
    createRevealOn = normalizeProjectSettings(
      auth.userData?.projectCreationDefaults ?? DEFAULT_PROJECT_SETTINGS
    ).revealOn;
    void tick().then(() => createInput?.focus());
  });

  $effect(() => {
    activeTab;
    persistActiveTab(activeTab);
    void tick().then(updateTabUnderline);
  });

  $effect(() => {
    if (activeTab !== 'history' || historyLoading || historyVersions.length === 0) return;
    void tick().then(() => historySearchInput?.focus());
  });

  async function saveDisplayName() {
    const jwt = auth.jwtToken;
    const trimmed = displayNameInput.trim();
    if (!jwt || !trimmed || savingDisplayName) return;
    savingDisplayName = true;
    try {
      await UserApi.updateMe(jwt, { displayName: trimmed });
      await loadUserData();
      editingDisplayName = false;
    } catch {
      toast.error('Failed to update display name');
    } finally {
      savingDisplayName = false;
    }
  }

  async function createProject() {
    const jwt = auth.jwtToken;
    const user = auth.userData;
    const trimmed = newProjectName.trim();
    if (!jwt || !trimmed || creatingProject) return;
    if (!user?.publicKey) {
      toast.error('Finish passphrase setup first');
      return;
    }

    creatingProject = true;
    try {
      const settings = normalizeProjectSettings({ revealOn: createRevealOn });
      const projectKey = await SymmetricCrypto.generateProjectKey();
      const content = `# Define your secrets below. Example:\nAPI_KEY="your-value-here"\nDATABASE_URL="postgres://..."`;
      const contentEncrypted = await SymmetricCrypto.encrypt(content, projectKey);
      const projectKeyEncrypted = await AsymmetricCrypto.encrypt(projectKey, user.publicKey);

      const created = await ProjectsApi.createProject(jwt, {
        name: trimmed,
        encryptedSecrets: contentEncrypted,
        encryptedSecretsKeys: { [user.id]: projectKeyEncrypted },
        settings
      });

      await UserApi.updateMe(jwt, { projectCreationDefaults: settings });
      newProjectName = '';
      showCreateDialog = false;
      await goto(`/app/project/${created.id}`, { replaceState: true });
      lastLoadKey = '';
      await loadShell(created.id);
    } catch {
      toast.error('Could not create project');
    } finally {
      creatingProject = false;
    }
  }

  async function acceptSuggestion(repo: RepoWithInstallation) {
    const jwt = auth.jwtToken;
    const user = auth.userData;
    if (!jwt || !user?.publicKey || acceptingRepoId !== null) return;
    acceptingRepoId = repo.id;
    try {
      const settings = normalizeProjectSettings(
        user.projectCreationDefaults ?? DEFAULT_PROJECT_SETTINGS
      );
      const projectKey = await SymmetricCrypto.generateProjectKey();
      const content = `# Define your secrets below. Example:\nAPI_KEY="your-value-here"\nDATABASE_URL="postgres://..."`;
      const contentEncrypted = await SymmetricCrypto.encrypt(content, projectKey);
      const projectKeyEncrypted = await AsymmetricCrypto.encrypt(projectKey, user.publicKey);
      const created = await ProjectsApi.createProject(jwt, {
        name: repo.name,
        encryptedSecrets: contentEncrypted,
        encryptedSecretsKeys: { [user.id]: projectKeyEncrypted },
        settings
      });
      await IntegrationsApi.createIntegration(jwt, {
        projectId: created.id,
        repositoryId: repo.id,
        installationEntityId: repo.installationEntityId
      });
      await goto(`/app/project/${created.id}`, { replaceState: true });
      lastLoadKey = '';
      await loadShell(created.id);
    } catch {
      toast.error('Could not create project from repository');
    } finally {
      acceptingRepoId = null;
    }
  }

  async function saveSettings() {
    const jwt = auth.jwtToken;
    if (!jwt || !activeProject || savingSettings) return;
    savingSettings = true;
    try {
      const updated = await ProjectsApi.updateProject(jwt, activeProject.id, {
        settings: settingsDraft
      });
      activeProject = updated;
      projects = projects?.map((project) => (project.id === updated.id ? updated : project)) ?? null;
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      savingSettings = false;
    }
  }

  async function renameProject() {
    const jwt = auth.jwtToken;
    const trimmed = renameProjectName.trim();
    if (!jwt || !activeProject || !trimmed || trimmed === activeProject.name || renamingProject) return;
    renamingProject = true;
    try {
      const updated = await ProjectsApi.updateProject(jwt, activeProject.id, { name: trimmed });
      activeProject = updated;
      projects = projects?.map((project) => (project.id === updated.id ? updated : project)) ?? null;
      showRenameForm = false;
      toast.success('Project renamed');
    } catch {
      toast.error('Failed to rename project');
    } finally {
      renamingProject = false;
    }
  }

  async function saveRevealSettings() {
    await saveSettings();
    revealEditing = false;
  }

  async function connectRepository(repo: RepoWithInstallation) {
    const jwt = auth.jwtToken;
    if (!jwt || !activeProject || connectingIntegration) return;
    connectingIntegration = true;
    connectingIntegrationRepoId = repo.id;
    try {
      const integration = await IntegrationsApi.createIntegration(jwt, {
        projectId: activeProject.id,
        repositoryId: repo.id,
        installationEntityId: repo.installationEntityId
      });
      integrations = [...integrations.filter((item) => item.id !== integration.id), integration];
      closeIntegrationDialog();
      await loadIntegrations(jwt, activeProject.id);
      const installation = installations.find((item) => item.id === repo.installationEntityId);
      activeProject = {
        ...activeProject,
        integrations: {
          githubInstallationId:
            installation?.githubInstallationId ?? activeProject.integrations?.githubInstallationId
        }
      };
      toast.success('Repository connected');
    } catch {
      toast.error('Failed to connect repository');
    } finally {
      connectingIntegration = false;
      connectingIntegrationRepoId = null;
    }
  }

  async function disconnectRepository(integration: Integration) {
    const jwt = auth.jwtToken;
    if (!jwt || disconnectingIntegrationId) return;
    disconnectingIntegrationId = integration.id;
    try {
      await IntegrationsApi.deleteIntegration(jwt, integration.id);
      integrations = integrations.filter((item) => item.id !== integration.id);
      toast.success('Repository disconnected');
      if (activeProject) {
        void loadIntegrations(jwt, activeProject.id);
      }
    } catch {
      toast.error('Failed to disconnect repository');
    } finally {
      disconnectingIntegrationId = null;
    }
  }

  async function installGithubApp() {
    if (!activeProject || installingGithubApp) return;
    const jwt = auth.jwtToken;
    installingGithubApp = true;
    try {
      if (publicEnv.githubLocalMock && jwt) {
        const { githubInstallationId } = await IntegrationsApi.bootstrapLocalGithubMock(jwt);
        window.location.href = `${publicEnv.appUrl.replace(/\/$/, '')}/app/callbacks/integrations/github?installation_id=${githubInstallationId}&state=${encodeURIComponent(`"projectId=${activeProject.id}"`)}`;
        return;
      }
      window.location.href = `https://github.com/apps/cryptly-dev/installations/new?state="projectId=${activeProject.id}"`;
    } catch {
      installingGithubApp = false;
      toast.error('Failed to start GitHub installation');
    }
  }

  function chooseInstallation(installationId: string) {
    selectedInstallationEntityId = installationId;
    integrationRepoSearch = '';
  }

  async function loadSuggestedUsers() {
    const jwt = auth.jwtToken;
    if (!jwt || !activeProject || suggestedUsersLoading) return;
    suggestedUsersLoading = true;
    try {
      suggestedUsers = await ProjectsApi.getSuggestedUsers(jwt, activeProject.id);
    } catch {
      suggestedUsers = [];
      toast.error('Failed to load suggested users');
    } finally {
      suggestedUsersLoading = false;
    }
  }

  async function createInviteLink(role: 'read' | 'write' | 'admin') {
    const jwt = auth.jwtToken;
    const project = activeProject;
    if (!jwt || !project || creatingInvitation) return;

    creatingInvitation = true;
    try {
      const projectKey = await getUnlockedProjectKey(project);
      if (!projectKey) {
        toast.error('Unlock this browser before creating invitations');
        return;
      }

      const keyPair = await AsymmetricCrypto.generateKeyPair();
      const passphrase = invitePassphrase || generateInviteCode();
      const passphraseKey = await SymmetricCrypto.deriveBase64KeyFromPassphrase(passphrase);
      const encryptedPrivateKey = await SymmetricCrypto.encrypt(keyPair.privateKey, passphraseKey);
      const exportedProjectKey = await SymmetricCrypto.exportAesKey(projectKey);
      const encryptedProjectKey = await AsymmetricCrypto.encrypt(exportedProjectKey, keyPair.publicKey);
      const invitation = await InvitationsApi.createInvitation(jwt, {
        projectId: project.id,
        temporaryPublicKey: keyPair.publicKey,
        temporaryPrivateKey: encryptedPrivateKey,
        temporarySecretsKey: encryptedProjectKey,
        role
      });

      invitePassphrase = passphrase;
      lastCreatedInvitation = invitation;
      addPeopleStep = 'done';
    } catch {
      toast.error('Failed to create invitation');
    } finally {
      creatingInvitation = false;
    }
  }

  async function createSuggestedInvitation(role: 'read' | 'write' | 'admin') {
    const jwt = auth.jwtToken;
    const project = activeProject;
    const user = selectedSuggestedUser;
    if (!jwt || !project || !user?.publicKey || creatingInvitation) return;

    creatingInvitation = true;
    try {
      const projectKey = await getUnlockedProjectKey(project);
      if (!projectKey) {
        toast.error('Unlock this browser before creating invitations');
        return;
      }
      const exportedProjectKey = await SymmetricCrypto.exportAesKey(projectKey);
      const encryptedProjectKey = await AsymmetricCrypto.encrypt(exportedProjectKey, user.publicKey);
      await ProjectsApi.addEncryptedSecretsKey(jwt, project.id, user.id, encryptedProjectKey);
      await InvitationsApi.createPersonalInvitation(jwt, project.id, {
        invitedUserId: user.id,
        role
      });
      addPeopleStep = 'done';
    } catch {
      toast.error('Failed to send invitation');
    } finally {
      creatingInvitation = false;
    }
  }

  async function updateSelectedMemberRole(role: 'read' | 'write' | 'admin') {
    const jwt = auth.jwtToken;
    if (!jwt || !activeProject || !selectedMember || updatingMember) return;
    updatingMember = true;
    try {
      await ProjectsApi.updateMemberRole(jwt, {
        projectId: activeProject.id,
        memberId: selectedMember.id,
        role
      });
      activeProject = {
        ...activeProject,
        members: activeProject.members.map((member) =>
          member.id === selectedMember.id ? { ...member, role } : member
        )
      };
      projects = projects?.map((project) => (project.id === activeProject?.id ? activeProject : project)) ?? null;
      toast.success('Member role updated');
    } catch {
      toast.error('Failed to update member role');
    } finally {
      updatingMember = false;
    }
  }

  async function removeSelectedMember() {
    const jwt = auth.jwtToken;
    if (!jwt || !activeProject || !selectedMember || updatingMember) return;
    updatingMember = true;
    try {
      await ProjectsApi.removeMember(jwt, {
        projectId: activeProject.id,
        memberId: selectedMember.id
      });
      activeProject = {
        ...activeProject,
        members: activeProject.members.filter((member) => member.id !== selectedMember.id)
      };
      projects = projects?.map((project) => (project.id === activeProject?.id ? activeProject : project)) ?? null;
      selectedMemberId = null;
      toast.success('Member removed');
    } catch {
      toast.error('Failed to remove member');
    } finally {
      updatingMember = false;
    }
  }

  async function deleteActiveProject() {
    const jwt = auth.jwtToken;
    if (!jwt || !activeProject) return;
    try {
      await ProjectsApi.deleteProject(jwt, activeProject.id);
      const remaining = projects?.filter((project) => project.id !== activeProject?.id) ?? [];
      projects = remaining;
      showDeleteConfirm = false;
      const nextProject = remaining[0];
      await goto(nextProject ? `/app/project/${nextProject.id}` : '/app/project', { replaceState: true });
      if (nextProject) {
        lastLoadKey = '';
        await loadShell(nextProject.id);
      }
    } catch {
      toast.error('Failed to delete project');
    }
  }

  async function leaveActiveProject() {
    const jwt = auth.jwtToken;
    const userId = auth.userData?.id;
    if (!jwt || !activeProject || !userId) return;
    try {
      const leavingProjectId = activeProject.id;
      await ProjectsApi.removeMember(jwt, {
        projectId: leavingProjectId,
        memberId: userId
      });
      const remaining = projects?.filter((project) => project.id !== leavingProjectId) ?? [];
      projects = remaining;
      showDeleteConfirm = false;
      toast.success('Left project');
      const nextProject = remaining[0];
      await goto(nextProject ? `/app/project/${nextProject.id}` : '/app/project', { replaceState: true });
      if (nextProject) {
        lastLoadKey = '';
        await loadShell(nextProject.id);
      }
    } catch {
      toast.error('Failed to leave project');
    }
  }

  async function copyInviteField(field: 'link' | 'code', value: string) {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    inviteCopiedField = field;
    setTimeout(() => {
      if (inviteCopiedField === field) inviteCopiedField = null;
    }, 2000);
  }

  function displayMemberName(member: Project['members'][number]) {
    return member.id === auth.userData?.id ? 'You' : member.displayName || member.email || member.id;
  }

  function displayInitial(member: Project['members'][number]) {
    return (member.displayName || member.email || 'U').charAt(0).toUpperCase();
  }

  function onMobileProjectChange(event: Event) {
    const value = (event.currentTarget as HTMLSelectElement).value;
    if (value === '__add_project__') {
      showCreateDialog = true;
      return;
    }
    if (value && value !== displayedProjectId) {
      void goto(`/app/project/${value}`);
    }
  }
</script>

<div class="flex h-screen w-full bg-background text-foreground">
  <ProjectUnsavedNavGuard />
  <aside class="hidden h-full w-72 shrink-0 flex-col border-r border-border/50 bg-card/40 backdrop-blur-sm md:flex">
    <div class="flex h-14 shrink-0 items-center gap-2 border-b border-border/50 px-3">
      <a href="/" class="shrink-0 text-lg font-semibold tracking-tight transition hover:opacity-80">Cryptly</a>
      <div class="relative min-w-0 flex-1">
        <Search class="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          bind:value={searchQuery}
          placeholder="Search…"
          autocomplete="off"
          class="h-8 w-full rounded-md border border-border/50 bg-muted/50 pl-8 pr-2 text-[13px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <button
        type="button"
        aria-label="Add project"
        title="Add project"
        class="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-neutral-800 hover:text-foreground"
        onclick={() => {
          showCreateDialog = true;
        }}
      >
        <Plus class="size-4" />
      </button>
    </div>

    <div class="relative flex-1 overflow-y-auto overflow-x-hidden pt-2">
      {#if loading && !projects}
        <div class="flex h-32 items-center justify-center">
          <GripLoader color="#DDA15E" class="size-8" />
        </div>
      {:else if loadError && !projects}
        <div class="px-4 py-3 text-sm">
          <p class="text-destructive">{loadError}</p>
          <button
            type="button"
            class="mt-3 h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground"
            onclick={() => void loadShell(projectId)}
          >
            Retry
          </button>
        </div>
      {:else if filteredProjects && filteredProjects.length > 0}
        <nav>
          {#each filteredProjects as project, index (project.id)}
            {@const isDisplayed = project.id === displayedProjectId}
            {@const isPending = project.id === pendingProjectId}
            <a
              href={`/app/project/${project.id}`}
              class={`project-row-enter group relative flex items-center justify-between gap-2 overflow-hidden px-3 py-2 text-sm transition-colors ${
                isDisplayed
                  ? 'bg-neutral-900 text-foreground'
                  : isPending
                    ? 'bg-neutral-900/60 text-foreground'
                    : 'text-muted-foreground/55 hover:bg-neutral-900/60 hover:text-foreground'
              }`}
              style={`animation-delay: ${50 + index * 30}ms`}
            >
              {#if isDisplayed}
                <span class="absolute left-0 top-0 h-full w-[2px] bg-[#DDA15E]"></span>
              {/if}
              <span
                class={`relative z-[2] block min-w-0 flex-1 truncate text-[14px] ${
                  isDisplayed ? 'font-medium [text-shadow:0_0_0.4px_currentColor]' : 'font-normal'
                }`}
              >
                {project.name}
                {#if searchSnippets.has(project.id)}
                  <span class="mt-0.5 block truncate text-[11px] font-normal text-muted-foreground/60">
                    {searchSnippets.get(project.id)}
                  </span>
                {/if}
              </span>
              <span class="relative z-[2] flex shrink-0 items-center gap-1.5">
                <span
                  class={`text-[12px] tabular-nums transition-opacity ${
                    isPending ? 'opacity-0' : 'group-hover:opacity-0'
                  } ${isDisplayed ? 'text-foreground/60' : 'text-muted-foreground/40'}`}
                  title={new Date(project.updatedAt).toLocaleString()}
                >
                  {getCompactRelativeTime(project.updatedAt)}
                </span>
              </span>
              <span
                class={`absolute right-2 top-1/2 z-[3] flex h-3.5 w-3.5 -translate-y-1/2 items-center justify-center transition-opacity ${
                  isPending ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                {#if isPending}
                  <span class="absolute inset-0" transition:fade={{ duration: 150 }}>
                    <GripLoader color="#DDA15E" />
                  </span>
                {:else}
                  <span class="absolute inset-0" transition:fade={{ duration: 180 }}>
                    <GripVertical class="h-3.5 w-3.5 text-muted-foreground/60" />
                  </span>
                {/if}
              </span>
            </a>
          {/each}
        </nav>
      {:else}
        <div class="px-4 py-3 text-sm text-muted-foreground">No projects yet</div>
      {/if}
      {#if searchQuery.trim() && searchableProjectsLoading}
        <div class="px-4 py-2 text-xs text-muted-foreground">Searching encrypted project contents…</div>
      {/if}
    </div>

    {#if installations.length > 0 && suggestedProjects.length > 0 && !loading}
      <div class="border-t border-border/50 px-2 py-2">
        <div class="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground">
          <Wand2 class="size-3.5" />
          <span>Suggested</span>
          {#if suggestionsLoading}
            <span class="size-3 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></span>
          {/if}
          <div class="group/info relative ml-auto">
            <Info class="size-3 cursor-help" />
            <div
              class="absolute bottom-full right-0 z-50 mb-1.5 w-48 rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground opacity-0 shadow-md transition-opacity group-hover/info:opacity-100"
            >
              We are checking repositories you've recently created on GitHub that don't have a
              matching Cryptly project
            </div>
          </div>
        </div>
        <div class="space-y-0.5">
          {#each suggestedProjects as repo (repo.id)}
            <div
              class="group relative flex items-center justify-between rounded-md px-3 py-2.5 text-sm text-muted-foreground/60 transition hover:bg-neutral-800/50 hover:text-muted-foreground"
            >
              <button
                type="button"
                disabled={acceptingRepoId !== null}
                aria-label={`Create project from ${repo.name}`}
                class="absolute inset-0 rounded-md disabled:cursor-not-allowed"
                onclick={() => void acceptSuggestion(repo)}
              ></button>
              <div class="pointer-events-none flex min-w-0 flex-1 items-center gap-2">
                {#if acceptingRepoId === repo.id}
                  <span class="size-3 shrink-0 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></span>
                {:else}
                  <Plus class="size-3 shrink-0 opacity-50" />
                {/if}
                <span class="truncate text-[13px]">{repo.name}</span>
              </div>
              <button
                type="button"
                aria-label={`Dismiss ${repo.name}`}
                class="relative z-10 opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                onclick={(event) => {
                  event.stopPropagation();
                  dismissedRepoIds = [...dismissedRepoIds, repo.id];
                }}
              >
                <X class="size-3" />
              </button>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <div class="border-t border-border/50 p-3">
      <div class="relative">
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-neutral-800"
          onclick={() => {
            showUserMenu = !showUserMenu;
          }}
        >
          {#if auth.userData?.avatarUrl}
            <img
              src={auth.userData.avatarUrl}
              alt={auth.userData.displayName || 'User'}
              class="size-8 rounded-full object-cover"
            />
          {:else}
            <div class="flex size-8 items-center justify-center rounded-full bg-muted">
              <Users class="size-4 text-muted-foreground" />
            </div>
          {/if}
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">{auth.userData?.displayName || auth.userData?.email || 'User'}</p>
            {#if auth.userData?.email && auth.userData?.displayName}
              <p class="truncate text-xs text-muted-foreground">{auth.userData.email}</p>
            {/if}
          </div>
          <ChevronRight class="size-4 text-muted-foreground" />
        </button>

        {#if showUserMenu}
          <div
            class="absolute bottom-full left-full z-20 mb-2 ml-2 w-64 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-xl"
          >
            {#if editingDisplayName}
              <div class="p-2">
                <label for="display-name-input" class="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Display Name
                </label>
                <div class="flex gap-1.5">
                  <input
                    id="display-name-input"
                    bind:value={displayNameInput}
                    maxlength="200"
                    disabled={savingDisplayName}
                    class="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-primary/60"
                    onkeydown={(event) => {
                      if (event.key === 'Enter') void saveDisplayName();
                      if (event.key === 'Escape') editingDisplayName = false;
                    }}
                  />
                  <button
                    type="button"
                    disabled={savingDisplayName}
                    class="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-50"
                    onclick={() => void saveDisplayName()}
                  >
                    <Check class="size-3.5" />
                  </button>
                  <button
                    type="button"
                    class="flex size-8 items-center justify-center rounded-md hover:bg-secondary"
                    onclick={() => {
                      displayNameInput = auth.userData?.displayName ?? '';
                      editingDisplayName = false;
                    }}
                  >
                    <X class="size-3.5" />
                  </button>
                </div>
              </div>
            {:else}
              <button
                type="button"
                class="flex w-full items-center rounded-sm px-2 py-2 text-sm hover:bg-secondary"
                onclick={() => {
                  editingDisplayName = true;
                }}
              >
                <Pencil class="mr-2 size-4" />
                Edit display name
              </button>
            {/if}
            <div class="my-1 h-px bg-border"></div>
            <button
              type="button"
              class="flex w-full items-center rounded-sm px-2 py-2 text-sm text-destructive hover:bg-secondary"
              onclick={() => void logout()}
            >
              <LogOut class="mr-2 size-4" />
              Log out
            </button>
          </div>
        {/if}
      </div>
    </div>
  </aside>

  <main class="flex h-full min-w-0 flex-1 flex-col">
    <div class="flex shrink-0 flex-col border-b border-border/50 bg-card/20 backdrop-blur-sm md:hidden">
      <div class="flex items-center gap-2 px-3 py-2">
        <a href="/" class="shrink-0 text-lg font-semibold tracking-tight transition hover:opacity-80">Cryptly</a>
        <div class="relative min-w-0 flex-1">
          <select
            aria-label="Select project"
            value={displayedProjectId}
            class="h-9 w-full appearance-none truncate rounded-md border border-border/50 bg-neutral-800 px-3 pr-8 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            onchange={onMobileProjectChange}
          >
            {#each uniqueProjects ?? [] as project (project.id)}
              <option value={project.id}>{project.name}</option>
            {/each}
            <option value="__add_project__">Add new project</option>
          </select>
          <ChevronRight class="pointer-events-none absolute right-2.5 top-1/2 size-4 rotate-90 -translate-y-1/2 text-muted-foreground" />
        </div>
        <button
          type="button"
          aria-label="Add project"
          title="Add project"
          class="flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-neutral-800 hover:text-foreground"
          onclick={() => {
            showCreateDialog = true;
          }}
        >
          <Plus class="size-4" />
        </button>
        <button
          type="button"
          aria-label="User menu"
          class="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground"
          onclick={() => {
            showUserMenu = !showUserMenu;
          }}
        >
          {#if auth.userData?.avatarUrl}
            <img
              src={auth.userData.avatarUrl}
              alt={auth.userData.displayName || 'User'}
              class="size-8 rounded-full object-cover"
            />
          {:else}
            <Users class="size-4" />
          {/if}
        </button>
      </div>
      {#if showUserMenu}
        <div class="mx-3 mb-2 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-xl">
          {#if editingDisplayName}
            <div class="p-2">
              <label for="mobile-display-name-input" class="mb-1.5 block text-xs font-medium text-muted-foreground">
                Display Name
              </label>
              <div class="flex gap-1.5">
                <input
                  id="mobile-display-name-input"
                  bind:value={displayNameInput}
                  maxlength="200"
                  disabled={savingDisplayName}
                  class="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-primary/60"
                  onkeydown={(event) => {
                    if (event.key === 'Enter') void saveDisplayName();
                    if (event.key === 'Escape') editingDisplayName = false;
                  }}
                />
                <button
                  type="button"
                  disabled={savingDisplayName}
                  class="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-50"
                  onclick={() => void saveDisplayName()}
                >
                  <Check class="size-3.5" />
                </button>
                <button
                  type="button"
                  class="flex size-8 items-center justify-center rounded-md hover:bg-secondary"
                  onclick={() => {
                    displayNameInput = auth.userData?.displayName ?? '';
                    editingDisplayName = false;
                  }}
                >
                  <X class="size-3.5" />
                </button>
              </div>
            </div>
          {:else}
            <button
              type="button"
              class="flex w-full items-center rounded-sm px-2 py-2 text-sm hover:bg-secondary"
              onclick={() => {
                editingDisplayName = true;
              }}
            >
              <Pencil class="mr-2 size-4" />
              Edit display name
            </button>
          {/if}
          <div class="my-1 h-px bg-border"></div>
          <button
            type="button"
            class="flex w-full items-center rounded-sm px-2 py-2 text-sm text-destructive hover:bg-secondary"
            onclick={() => void logout()}
          >
            <LogOut class="mr-2 size-4" />
            Log out
          </button>
        </div>
      {/if}

      <div class="relative overflow-hidden">
        <div class="hide-scrollbar flex items-stretch gap-0 overflow-x-auto px-3">
          {#each tabs as tab (tab.id)}
            {@const Icon = tab.icon}
            <button
              type="button"
              class={`relative flex shrink-0 items-center gap-1.5 px-3 py-2 text-sm font-medium transition ${
                activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground'
              }`}
              onclick={() => {
                setActiveTab(tab.id);
              }}
            >
              <Icon class="size-4" />
              <span>{tab.label}</span>
              {#if activeTab === tab.id}
                <span class="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-[#DDA15E]"></span>
              {/if}
            </button>
          {/each}
        </div>
        <div class="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent"></div>
      </div>
    </div>

    <div class="hidden h-14 shrink-0 items-center justify-between overflow-visible border-b border-border/50 bg-card/20 px-3 backdrop-blur-sm md:flex">
      <div bind:this={tabBar} class="relative flex h-full items-stretch gap-0">
        {#each tabs as tab (tab.id)}
          {@const Icon = tab.icon}
          <button
            type="button"
            use:trackTab={tab.id}
            class={`relative flex h-full items-center gap-2 px-3 text-sm font-medium transition ${
              activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
            onclick={() => {
              setActiveTab(tab.id);
            }}
          >
            <Icon class="size-4" />
            <span>{tab.label}</span>
          </button>
        {/each}
        {#if tabUnderline.ready}
          <span
            class="tab-sliding-underline absolute bottom-[-1px] h-[2px] rounded-full bg-[#DDA15E]"
            style={`left: ${tabUnderline.left}px; width: ${tabUnderline.width}px;`}
          ></span>
        {/if}
      </div>
    </div>

    <div
      class={`min-h-0 flex-1 overflow-hidden transition-opacity duration-300 ease-in-out ${
        isSwitching ? 'pointer-events-none opacity-60' : 'opacity-100'
      }`}
    >
      {#if loading && !activeProject}
        <div class="flex h-full items-center justify-center">
          <GripLoader color="#DDA15E" class="size-12" />
        </div>
      {:else if loadError && !activeProject}
        <section class="flex h-full items-center justify-center bg-background p-6">
          <div class="max-w-sm text-center">
            <h2 class="text-base font-semibold text-foreground">We couldn't finish loading</h2>
            <p class="mt-2 text-sm text-muted-foreground">{loadError}</p>
            <div class="mt-5 flex justify-center gap-2">
              <button
                type="button"
                class="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                onclick={() => void loadShell(projectId)}
              >
                Retry
              </button>
              <button
                type="button"
                class="h-9 rounded-md border border-border px-4 text-sm text-muted-foreground hover:text-foreground"
                onclick={() => void logout()}
              >
                Log out
              </button>
            </div>
          </div>
        </section>
      {:else if activeTab === 'editor'}
        <SecretsEditorPage
          projectId={displayedProjectId}
          projectName={activeProject?.name ?? ''}
          onSaved={() => {
            const jwt = auth.jwtToken;
            if (jwt && activeProject) void loadHistory(jwt, activeProject);
          }}
          onConnectIntegrations={() => setActiveTab('integrations')}
        />
      {:else if activeTab === 'history'}
        <section class="flex h-full flex-col bg-background md:flex-row">
          {#if historyLoading}
            <div class="flex h-full flex-1 items-center justify-center text-sm text-muted-foreground">
              Loading history...
            </div>
          {:else if historyLocked}
            <div class="flex h-full flex-1 items-center justify-center text-center text-sm text-muted-foreground">
              <div class="max-w-sm px-6">
                <p class="font-medium text-foreground">Unlock your safe to view history</p>
                <p class="mt-1">{historyLoadMessage}</p>
                <p class="mt-3 text-xs text-muted-foreground/70">
                  Your account session is still active. Enter your Cryptly passphrase in the unlock dialog to continue.
                </p>
              </div>
            </div>
          {:else if historyLoadMessage}
            <div class="flex h-full flex-1 items-center justify-center text-center text-sm text-muted-foreground">
              <div class="max-w-sm px-6">
                <p>{historyLoadMessage}</p>
                <button
                  type="button"
                  class="mt-4 h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                  onclick={() => {
                    const jwt = auth.jwtToken;
                    if (jwt && activeProject) void loadHistory(jwt, activeProject);
                  }}
                >
                  Retry
                </button>
              </div>
            </div>
          {:else if historyVersions.length === 0}
            <div class="flex h-full flex-1 items-center justify-center text-center text-sm text-muted-foreground">
              <div>
                <p>No history available yet.</p>
                <p class="mt-1">Make changes to see version history.</p>
              </div>
            </div>
          {:else}
            <div class="flex h-[42%] w-full shrink-0 flex-col border-b border-border/50 bg-[#0a0a0a] md:h-auto md:w-[560px] md:border-b-0 md:border-r">
              <div class="relative border-b border-border/50 bg-neutral-900">
                <div class="relative flex h-10 items-center">
                  {#if historyMode}
                    {@const activeSuggestion = historySearchSuggestions.find((item) => item.mode === historyMode)}
                    <button
                      type="button"
                      class={`ml-2 flex h-6 shrink-0 items-center gap-1 rounded-md px-1.5 text-[11px] font-medium transition-all hover:brightness-110 ${activeSuggestion?.chipClass ?? 'bg-neutral-800 text-neutral-300'}`}
                      title="Change mode"
                      onclick={() => {
                        historyMode = null;
                        if (historyQuery.trim()) historySuggestionsOpen = true;
                      }}
                    >
                      {#if activeSuggestion}
                        {@const ActiveModeIcon = activeSuggestion.icon}
                        <ActiveModeIcon class="size-3" />
                      {/if}
                      <span class="capitalize">{historyMode}</span>
                      <X class="size-2.5 opacity-60" />
                    </button>
                  {:else}
                    <Search class="ml-3 size-3.5 shrink-0 text-muted-foreground" />
                  {/if}
                  <input
                    bind:this={historySearchInput}
                    bind:value={historyQuery}
                    data-history-search-input
                    aria-label="Search edits — author, email, diff content…"
                    placeholder={historyMode ? 'Refine your search…' : 'Search edits — author, email, diff content…'}
                    class="h-full min-w-0 flex-1 border-0 bg-transparent pl-2.5 pr-10 font-mono text-sm outline-none placeholder:text-muted-foreground/60"
                    oninput={() => {
                      historySuggestionIndex = 0;
                      if (historyQuery.trim().length === 0) {
                        historyMode = null;
                        historySuggestionsOpen = false;
                      } else if (!historyMode) {
                        historySuggestionsOpen = true;
                      }
                    }}
                    onfocus={() => {
                      if (historyQuery.trim() && !historyMode) historySuggestionsOpen = true;
                    }}
                  />
                  <div class="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                    {#if historyQuery || historyMode}
                      <button
                        type="button"
                        class="rounded-sm p-1 hover:bg-neutral-800"
                        aria-label="Clear search"
                        onclick={clearHistorySearch}
                      >
                        <X class="size-3" />
                      </button>
                    {:else}
                      <span class="rounded border border-border/60 bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-400">/</span>
                    {/if}
                  </div>
                </div>
                {#if historyQuery.trim() && historySuggestionsOpen && !historyMode}
                  <div class="absolute left-0 right-0 top-full z-40 border-x border-b border-border/70 bg-neutral-950/95 shadow-2xl shadow-black/50 backdrop-blur-md">
                    <div class="border-b border-border/50 bg-black/40 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                      What do you mean by <span class="font-mono normal-case text-foreground">"{historyQuery.trim()}"</span>?
                    </div>
                    {#each historySearchSuggestions as suggestion, index (suggestion.mode)}
                      {@const SuggestionIcon = suggestion.icon}
                      {@const isHighlighted = index === historySuggestionIndex}
                      <button
                        type="button"
                        class={`flex w-full items-center gap-3 px-3 py-1.5 text-left transition-colors ${
                          isHighlighted ? 'bg-neutral-800/80' : 'hover:bg-neutral-900/60'
                        }`}
                        onmouseenter={() => (historySuggestionIndex = index)}
                        onclick={() => applyHistoryMode(suggestion.mode)}
                      >
                        <span class={`flex size-5 shrink-0 items-center justify-center rounded-md ${suggestion.chipClass}`}>
                          <SuggestionIcon class="size-3" />
                        </span>
                        <span class="min-w-0 flex-1 text-sm">
                          <span class="font-mono text-foreground">"{historyQuery.trim()}"</span>
                          <span class="text-muted-foreground">
                            {#if suggestion.mode === 'added'}
                              was <span class="font-medium text-emerald-400">added</span>
                            {:else if suggestion.mode === 'removed'}
                              was <span class="font-medium text-rose-400">removed</span>
                            {:else}
                              {suggestion.label}
                            {/if}
                          </span>
                        </span>
                        {#if isHighlighted}
                          <span class="rounded border border-border/60 bg-neutral-800 px-1 text-[10px] text-neutral-300">
                            <CornerDownLeft class="size-2.5" />
                          </span>
                        {/if}
                      </button>
                    {/each}
                    <div class="flex items-center justify-between border-t border-border/50 bg-black/40 px-3 py-1.5 text-[10px] text-muted-foreground">
                      <div class="flex items-center gap-2">
                        <span class="flex items-center gap-1">
                          <span class="rounded border border-border/60 bg-neutral-800 px-1 text-neutral-300">↑</span>
                          <span class="rounded border border-border/60 bg-neutral-800 px-1 text-neutral-300">↓</span>
                          <span>navigate</span>
                        </span>
                        <span class="flex items-center gap-1">
                          <span class="rounded border border-border/60 bg-neutral-800 px-1 text-neutral-300">↵</span>
                          <span>apply</span>
                        </span>
                        <span class="flex items-center gap-1">
                          <span class="rounded border border-border/60 bg-neutral-800 px-1 text-neutral-300">esc</span>
                          <span>dismiss</span>
                        </span>
                      </div>
                    </div>
                  </div>
                {/if}
              </div>

              <div class="flex items-center gap-3 border-b border-border/50 px-3 py-2">
                <div class="flex shrink-0 items-center gap-1.5">
                  {#if selectedHistoryDay}
                    <button
                      type="button"
                      class="rounded-full border border-primary/40 bg-primary/15 px-2.5 py-0.5 text-[11px] text-primary"
                      onclick={() => (selectedHistoryDay = null)}
                    >
                      {formatDayLabel(selectedHistoryDay)}
                      <X class="ml-0.5 inline size-2.5" />
                    </button>
                  {/if}
                  {#each [
                    { key: 'all', label: 'All' },
                    { key: '24h', label: '-24h' },
                    { key: '7d', label: '-7d' },
                    { key: '30d', label: '-30d' }
                  ] as range}
                    <button
                      type="button"
                      class={`rounded-full border px-2.5 py-0.5 text-[11px] transition-colors ${
                        historyTimeRange === range.key
                          ? 'border-primary/40 bg-primary/15 text-primary'
                          : 'border-border/60 bg-neutral-900 text-muted-foreground hover:border-border hover:text-foreground'
                      }`}
                      onclick={() => (historyTimeRange = range.key as typeof historyTimeRange)}
                    >
                      {range.label}
                    </button>
                  {/each}
                </div>

                <div class="ml-auto flex min-w-0 items-center gap-1.5 overflow-hidden">
                  {#each historyAuthors as author (author.id)}
                    <button
                      type="button"
                      class={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] transition-colors ${
                        selectedHistoryAuthorId === author.id
                          ? 'border-primary/40 bg-primary/15 text-primary'
                          : 'border-border/60 bg-neutral-900 text-muted-foreground hover:border-border hover:text-foreground'
                      }`}
                      onclick={() => {
                        selectedHistoryAuthorId =
                          selectedHistoryAuthorId === author.id ? null : author.id;
                      }}
                    >
                      <span class="inline-block max-w-[72px] truncate align-bottom">{author.displayName.split(' ')[0]}</span>
                      <span class="opacity-60"> ({author.count})</span>
                    </button>
                  {/each}
                </div>
              </div>

              <div class="flex-1 overflow-y-auto">
                {#if filteredHistory.length === 0}
                  <div class="px-4 py-12 text-center text-sm text-muted-foreground">No results</div>
                {:else}
                  {#each filteredHistory as version (version.id)}
                    {@const isSelected = selectedHistory?.id === version.id}
                    {@const volume = version.additions + version.deletions}
                    {@const addRatio = version.additions / Math.max(volume, 1)}
                    {@const barWidthPct = (volume / maxHistoryVolume) * 100}
                    <button
                      type="button"
                      class={`flex w-full items-center gap-3 border-l-2 px-3 py-2 text-left transition-colors focus:outline-none ${
                        isSelected
                          ? 'border-[#DDA15E] bg-neutral-900'
                          : 'border-transparent hover:bg-neutral-900/60'
                      }`}
                      onclick={() => {
                        selectedHistoryId = version.id;
                      }}
                    >
                      <img src={version.author?.avatarUrl || DEFAULT_AVATAR} alt="" class="size-5 shrink-0 rounded-full object-cover" />
                      <span class={`min-w-0 flex-1 truncate text-sm ${isSelected ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                        {version.author?.displayName || 'System'}
                        {#if version.author?.id === auth.userData?.id}
                          <span class="ml-1 text-[11px] text-primary/70">· you</span>
                        {/if}
                      </span>
                      <span class="flex shrink-0 items-center gap-2">
                        <span class="font-mono text-[11px] tabular-nums">
                          <span class="text-emerald-400">+{version.additions}</span>
                          <span class="text-rose-400"> -{version.deletions}</span>
                        </span>
                        <span class="flex h-1 w-[80px] overflow-hidden rounded-full bg-neutral-800/60">
                          <span class="h-full bg-emerald-500/80" style={`width: ${barWidthPct * addRatio}%`}></span>
                          <span class="h-full bg-rose-500/80" style={`width: ${barWidthPct * (1 - addRatio)}%`}></span>
                        </span>
                        <span class="w-10 text-right text-[11px] tabular-nums text-muted-foreground" title={formatFullDate(version.createdAt)}>
                          {getCompactRelativeTime(version.createdAt)}
                        </span>
                      </span>
                    </button>
                  {/each}
                {/if}
              </div>

              <div class="hidden border-t border-border/50 bg-card/20 px-4 pb-3 pt-3 md:block">
                <YearHeatmap
                  patches={historyVersions}
                  selectedDayKey={selectedHistoryDay}
                  onDayClick={(key) => (selectedHistoryDay = key)}
                />
              </div>

              <div class="hidden items-center justify-between gap-3 border-t border-border/50 bg-black/60 px-3 py-2 text-[11px] text-muted-foreground md:flex">
                <div class="flex items-center gap-3">
                  <span class="flex items-center gap-1">
                    <span class="rounded border border-border/60 bg-neutral-800 px-1">↑</span>
                    <span class="rounded border border-border/60 bg-neutral-800 px-1">↓</span>
                    <span class="text-muted-foreground/50">·</span>
                    <span class="rounded border border-border/60 bg-neutral-800 px-1">j</span>
                    <span class="rounded border border-border/60 bg-neutral-800 px-1">k</span>
                    <span class="ml-1">navigate</span>
                  </span>
                  <span class="flex items-center gap-1">
                    <span class="rounded border border-border/60 bg-neutral-800 px-1">/</span>
                    <span class="ml-1">search</span>
                  </span>
                </div>
                <span class="tabular-nums">{filteredHistory.length}/{historyVersions.length}</span>
              </div>
            </div>

            <div class="flex min-h-0 min-w-0 flex-1 flex-col">
              {#if selectedHistory}
                <div class="flex items-center gap-3 border-b border-border/50 bg-neutral-950/60 px-4 py-2.5">
                  <img src={selectedHistory.author?.avatarUrl || DEFAULT_AVATAR} alt="" class="size-7 shrink-0 rounded-full object-cover" />
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5 text-sm">
                      <span class="truncate font-medium text-foreground">{selectedHistory.author?.displayName || 'System'}</span>
                      {#if selectedHistory.author?.id === auth.userData?.id}
                        <span class="text-[11px] text-primary/70">· you</span>
                      {/if}
                      <span class="text-[12px] text-muted-foreground/60">edited</span>
                      <span class="text-[12px] tabular-nums text-muted-foreground" title={formatFullDate(selectedHistory.createdAt)}>
                        {getCompactRelativeTime(selectedHistory.createdAt)}
                      </span>
                    </div>
                    <div class="mt-0.5 text-[11px] text-muted-foreground/70">{formatFullDate(selectedHistory.createdAt)}</div>
                  </div>
                  <div class="flex shrink-0 items-center gap-2">
                    <span class="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] tabular-nums text-emerald-400">
                      <Plus class="size-3" />
                      {selectedHistory.additions}
                    </span>
                    <span class="flex items-center gap-1 rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 font-mono text-[11px] tabular-nums text-rose-400">
                      <Minus class="size-3" />
                      {selectedHistory.deletions}
                    </span>
                  </div>
                </div>
                <div
                  class="min-h-0 flex-1 bg-black"
                  role="region"
                  aria-label="History diff"
                >
                  {#key selectedHistory.id}
                    <DiffEditor
                      value={selectedHistory.patchContent}
                      revealedValue={selectedHistory.revealedPatchContent}
                      revealOn={historyRevealOn}
                    />
                  {/key}
                </div>
              {:else}
                <div class="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Pick an entry to view its changes
                </div>
              {/if}
            </div>
          {/if}
        </section>
      {:else if activeTab === 'members'}
        <section class="flex h-full justify-center overflow-y-auto bg-background p-4 md:p-6">
          <div class="w-full max-w-xl space-y-6">
            <div class="flex items-center justify-between gap-4">
              <div>
                <h2 class="mb-1 text-lg font-semibold">Members</h2>
                <p class="text-sm text-muted-foreground">
                  Manage who has access to <span class="font-medium text-foreground">{activeProject?.name}</span>
                </p>
              </div>
              {#if isAdmin}
                <button
                  type="button"
                  class="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                  onclick={() => {
                    showAddPeopleDialog = true;
                  }}
                >
                  <UserPlus class="mr-2 size-4" />
                  Add people
                </button>
              {/if}
            </div>
            {#if isAdmin && (pendingLinkInvitations.length > 0 || pendingPersonalInvitations.length > 0)}
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <Link class="size-4 text-muted-foreground" />
                  <h3 class="text-sm font-medium">Pending invitations</h3>
                </div>
                <div class="divide-y divide-border/50 overflow-hidden rounded-lg border border-border/50 bg-neutral-800/20">
                  {#each pendingLinkInvitations as inv (inv.id)}
                    <div class="flex items-center justify-between gap-3 px-4 py-3">
                      <div class="min-w-0">
                        <p class="truncate text-sm font-medium">Invite link</p>
                        <p class="text-xs capitalize text-muted-foreground">{inv.role}</p>
                      </div>
                      <button
                        type="button"
                        class="text-xs font-medium text-destructive hover:underline"
                        onclick={() => void revokePendingLinkInvitation(inv.id)}
                      >
                        Revoke
                      </button>
                    </div>
                  {/each}
                  {#each pendingPersonalInvitations as pinv (pinv.id)}
                    <div class="flex items-center justify-between gap-3 px-4 py-3">
                      <div class="min-w-0">
                        <p class="truncate text-sm font-medium">
                          {pinv.invitedUser.displayName || pinv.invitedUser.email || pinv.invitedUser.id}
                        </p>
                        <p class="text-xs capitalize text-muted-foreground">{pinv.role} · personal</p>
                      </div>
                      <button
                        type="button"
                        class="text-xs font-medium text-destructive hover:underline"
                        onclick={() => void revokePendingPersonalInvitation(pinv.id)}
                      >
                        Revoke
                      </button>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <Users class="size-4 text-muted-foreground" />
                <h3 class="text-sm font-medium">Members</h3>
              </div>
              <div class="divide-y divide-border/50 overflow-hidden rounded-lg border border-border/50 bg-neutral-800/20">
              {#each activeProject?.members ?? [] as member (member.id)}
                {@const meta = roleMeta[member.role as keyof typeof roleMeta] ?? roleMeta.read}
                {@const RoleIcon = meta.icon}
                <button
                  type="button"
                  class="group flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-neutral-800/40"
                  onclick={() => (selectedMemberId = member.id)}
                >
                  {#if member.avatarUrl}
                    <img src={member.avatarUrl} alt={member.displayName} class="size-8 rounded-full object-cover" />
                  {:else}
                    <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                      {displayInitial(member)}
                    </div>
                  {/if}
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium">{displayMemberName(member)}</p>
                    <p class="inline-flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <RoleIcon class="size-3" />
                      {meta.label}
                    </p>
                  </div>
                  <ChevronRight class="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              {/each}
              </div>
            </div>
          </div>
        </section>
      {:else if activeTab === 'integrations'}
        <section class="flex h-full justify-center overflow-y-auto bg-background p-4 md:p-6">
          <div class="w-full max-w-xl space-y-6">
            <div>
              <h2 class="mb-1 text-lg font-semibold">Sync externally</h2>
              <p class="text-sm text-muted-foreground">
                Integrate your <span class="font-medium text-foreground">{activeProject?.name}</span> secrets with Github Actions.
              </p>
            </div>
            <div class="space-y-3">
              {#if integrations.length > 0}
                <div class="divide-y divide-border/50 overflow-hidden rounded-lg border border-border/50 bg-neutral-800/20">
                  {#each integrations as integration (integration.id)}
                    {@const repoHref =
                      integration.repositoryData?.owner && integration.repositoryData?.name
                        ? `https://github.com/${integration.repositoryData.owner}/${integration.repositoryData.name}`
                        : null}
                    <div class="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-neutral-800/40">
                      <div class="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                        {#if integration.repositoryData?.avatarUrl}
                          <img
                            src={integration.repositoryData.avatarUrl}
                            alt={integration.repositoryData.owner}
                            class="size-8 rounded-full object-cover"
                          />
                        {:else}
                          <Github class="size-4" />
                        {/if}
                      </div>
                      <div class="min-w-0 flex-1">
                        <div class="truncate text-sm font-medium">
                          {integration.repositoryData?.name ?? `Repository ${integration.githubRepositoryId}`}
                        </div>
                        <div class="truncate text-xs text-muted-foreground">
                          {integration.repositoryData?.owner ?? 'GitHub'}
                        </div>
                      </div>
                      <div class="flex items-center gap-1">
                        {#if repoHref}
                          <a
                            href={repoHref}
                            target="_blank"
                            rel="noreferrer"
                            class="inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-2 text-sm text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                          >
                            <ExternalLink class="size-4" />
                            <span>Open</span>
                          </a>
                        {/if}
                        {#if isAdmin}
                          <button
                            type="button"
                            aria-label="Remove connection"
                            title="Remove connection?"
                            disabled={disconnectingIntegrationId !== null}
                            class="group/disconnect inline-flex size-8 items-center justify-center rounded-md text-green-600 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                            onclick={(event) => {
                              event.stopPropagation();
                              void disconnectRepository(integration);
                            }}
                          >
                            {#if disconnectingIntegrationId === integration.id}
                              <span class="size-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current"></span>
                            {:else}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                class="size-4 group-hover/disconnect:hidden"
                              >
                                <path d="M10 13.229C10.1416 13.4609 10.3097 13.6804 10.5042 13.8828C11.7117 15.1395 13.5522 15.336 14.9576 14.4722C15.218 14.3121 15.4634 14.1157 15.6872 13.8828L18.9266 10.5114C20.3578 9.02184 20.3578 6.60676 18.9266 5.11718C17.4953 3.6276 15.1748 3.62761 13.7435 5.11718L13.03 5.85978" />
                                <path d="M10.9703 18.14L10.2565 18.8828C8.82526 20.3724 6.50471 20.3724 5.07345 18.8828C3.64218 17.3932 3.64218 14.9782 5.07345 13.4886L8.31287 10.1172C9.74413 8.62761 12.0647 8.6276 13.4959 10.1172C13.6904 10.3195 13.8584 10.539 14 10.7708" />
                              </svg>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                class="hidden size-4 group-hover/disconnect:block"
                              >
                                <path d="M10 13.229C10.1416 13.4609 10.3097 13.6804 10.5042 13.8828C11.7117 15.1395 13.5522 15.336 14.9576 14.4722C15.218 14.3121 15.4634 14.1157 15.6872 13.8828L18.9266 10.5114C20.3578 9.02184 20.3578 6.60676 18.9266 5.11718C17.4953 3.6276 15.1748 3.62761 13.7435 5.11718L13.03 5.85978" />
                                <path d="M10.9703 18.14L10.2565 18.8828C8.82526 20.3724 6.50471 20.3724 5.07345 18.8828C3.64218 17.3932 3.64218 14.9782 5.07345 13.4886L8.31287 10.1172C9.74413 8.62761 12.0647 8.6276 13.4959 10.1172C13.6904 10.3195 13.8584 10.539 14 10.7708" />
                                <path d="M21.0001 16H18.9212M16.0001 21L16.0001 18.9211" />
                                <path d="M3.00009 8H5.07898M8.00009 3L8.00009 5.07889" />
                              </svg>
                            {/if}
                          </button>
                        {:else}
                          <span class="inline-flex size-8 items-center justify-center text-green-600">
                            <Link class="size-4" />
                          </span>
                        {/if}
                      </div>
                    </div>
                  {/each}
                </div>
              {:else if integrationsLoading}
                <div class="flex items-center gap-2 text-sm text-muted-foreground">
                  <span class="size-3 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></span>
                  Loading repositories...
                </div>
              {/if}
              {#if isAdmin}
                <button
                  type="button"
                  class="inline-flex h-8 w-fit items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-white/90"
                  onclick={() => {
                    showIntegrationDialog = true;
                  }}
                >
                  <Plus class="size-4" />
                  {integrations.length > 0 ? 'Connect another repository' : 'Connect repository'}
                </button>
              {:else if !integrationsLoading && integrations.length === 0}
                <div class="flex items-center justify-center rounded-lg border border-dashed border-border/50 bg-neutral-800/20 py-8">
                  <span class="text-sm text-muted-foreground">No repositories connected yet</span>
                </div>
              {/if}
            </div>
            {#if !integrationsLoading && integrations.length === 0 && suggestedIntegrations.length > 0}
              <div class="space-y-3">
                <div class="flex items-center gap-2 text-sm font-medium">
                  <Wand2 class="size-4 text-muted-foreground" />
                  <span>Suggested</span>
                </div>
                <p class="text-xs text-muted-foreground">
                  We found these repositories on your GitHub account based on your Cryptly project name.
                </p>
                <div class="space-y-1">
                  {#each suggestedIntegrations as repo (repo.id)}
                    <button
                      type="button"
                      disabled={connectingIntegration}
                      class="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                      onclick={() => void connectRepository(repo)}
                    >
                      <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs">
                        <Github class="size-3.5" />
                      </span>
                      <span class="min-w-0 flex-1 truncate text-sm">
                        <span class="text-muted-foreground">{repo.owner}/</span><span class="font-medium">{repo.name}</span>
                      </span>
                      {#if connectingIntegrationRepoId === repo.id}
                        <span class="size-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></span>
                      {:else}
                        <ArrowLeft class="size-3.5 rotate-180 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                      {/if}
                    </button>
                  {/each}
                </div>
              </div>
            {/if}
            {#if integrations.length > 0}
              <div class="flex items-center gap-3 rounded-lg border border-border/50 bg-neutral-800/30 px-4 py-3">
                <BulbIcon class="size-4 shrink-0 text-amber-500" />
                <p class="text-xs leading-relaxed text-muted-foreground">
                  Hit
                  <span
                    class="mx-0.5 inline-flex items-center justify-center rounded-md border bg-secondary/50 px-2 py-0.5 align-middle text-[11px] font-medium text-foreground"
                  >
                    Push
                  </span>
                  in the
                  <span
                    class="inline-flex items-center gap-1 rounded bg-secondary/50 px-1.5 py-0.5 align-middle text-[11px] font-medium text-foreground"
                  >
                    <BracketsIcon class="size-3" />
                    Editor
                  </span>
                  to sync your secrets with <Github class="inline size-3.5 align-text-bottom text-muted-foreground" /> GitHub Actions.
                </p>
              </div>
            {/if}
          </div>
        </section>
      {:else if activeTab === 'settings'}
        <section class="flex h-full justify-center overflow-y-auto bg-background p-4 md:p-6">
          <div class="w-full max-w-xl space-y-6">
            <div>
              <h2 class="mb-1 text-lg font-semibold">Settings</h2>
              <p class="text-sm text-muted-foreground">
                Manage settings for <span class="font-medium text-foreground">{activeProject?.name}</span>
              </p>
            </div>

            <div class="space-y-3 overflow-hidden">
              <div class="flex items-center gap-2">
                <Pencil class="size-4 text-muted-foreground" />
                <h3 class="text-sm font-medium">Rename project</h3>
              </div>
              {#if showRenameForm}
                <div class="flex gap-2 rounded-lg border border-border/50 bg-neutral-800/20 p-3">
                  <input
                    bind:value={renameProjectName}
                    placeholder="Project name"
                    class="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none"
                    onkeydown={(event) => {
                      if (event.key === 'Enter') void renameProject();
                      if (event.key === 'Escape') showRenameForm = false;
                    }}
                  />
                  <button type="button" class="h-9 rounded-md bg-white px-3 text-sm font-semibold text-neutral-900" onclick={() => void renameProject()}>
                    {renamingProject ? 'Saving…' : 'Save'}
                  </button>
                  <button type="button" class="h-9 rounded-md px-3 text-sm hover:bg-neutral-800" onclick={() => (showRenameForm = false)}>
                    Cancel
                  </button>
                </div>
              {:else}
                <div class="overflow-hidden rounded-lg border border-border/50 bg-neutral-800/20">
                  <div class="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-neutral-800/40">
                    <div class="min-w-0 flex-1">
                      <div class="truncate text-sm font-medium">{activeProject?.name}</div>
                    </div>
                    {#if isAdmin}
                      <button
                        type="button"
                        class="h-8 px-2 text-sm text-muted-foreground transition hover:text-foreground"
                        onclick={() => {
                          renameProjectName = activeProject?.name ?? '';
                          showRenameForm = true;
                        }}
                      >
                        Rename
                      </button>
                    {/if}
                  </div>
                </div>
              {/if}
            </div>

            <div class="space-y-3 overflow-hidden">
              <div class="flex items-center gap-2">
                <Shield class="size-4 text-muted-foreground" />
                <h3 class="text-sm font-medium">Reveal on</h3>
              </div>
              {#if revealEditing}
                <div class="space-y-3 rounded-lg border border-border/50 bg-neutral-800/20 p-3">
                  <select
                    bind:value={settingsDraft.revealOn}
                    class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none"
                  >
                    <option value="hover">Hover</option>
                    <option value="always">Always</option>
                    <option value="never">Never</option>
                  </select>
                  <div class="flex justify-end gap-2">
                    <button type="button" class="h-8 rounded-md px-3 text-sm hover:bg-neutral-800" onclick={() => (revealEditing = false)}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={savingSettings}
                      class="h-8 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
                      onclick={() => void saveRevealSettings()}
                    >
                      {savingSettings ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              {:else}
                <div class="overflow-hidden rounded-lg border border-border/50 bg-neutral-800/20">
                  <div class="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-neutral-800/40">
                    <Shield class="size-4 shrink-0 text-muted-foreground" />
                    <div class="min-w-0 flex-1">
                      <div class="truncate text-sm font-medium">{revealMeta.label}</div>
                      <div class="truncate text-xs text-muted-foreground">{revealMeta.description}</div>
                    </div>
                    {#if isAdmin}
                      <button type="button" class="h-8 px-2 text-sm text-muted-foreground transition hover:text-foreground" onclick={() => (revealEditing = true)}>
                        Edit
                      </button>
                    {/if}
                  </div>
                </div>
              {/if}
            </div>

            <div class="space-y-3 overflow-hidden">
              <div class="flex items-center gap-2">
                <Trash2 class="size-4 text-muted-foreground" />
                <h3 class="text-sm font-medium">Danger zone</h3>
              </div>
              {#if showDeleteConfirm}
                <div class="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                  <div class="mb-3 text-sm font-medium text-destructive">
                    {isAdmin ? 'Are you sure you want to delete this project?' : 'Are you sure you want to leave this project?'}
                  </div>
                  <div class="mb-4 text-sm text-muted-foreground">
                    {isAdmin
                      ? "This action cannot be undone. This will permanently delete the project and remove all members' access."
                      : 'You will lose access to this project until an admin invites you again.'}
                  </div>
                  <div class="flex gap-2">
                    <button
                      type="button"
                      class="rounded-md bg-destructive px-3 py-2 text-sm text-destructive-foreground"
                      onclick={() => void (isAdmin ? deleteActiveProject() : leaveActiveProject())}
                    >
                      {isAdmin ? 'Delete project' : 'Leave project'}
                    </button>
                    <button type="button" class="rounded-md px-3 py-2 text-sm hover:bg-neutral-800" onclick={() => (showDeleteConfirm = false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              {:else}
                <div class="overflow-hidden rounded-lg border border-border/50 bg-neutral-800/20">
                  <div class="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-neutral-800/40">
                    <div class="min-w-0 flex-1">
                      <div class="truncate text-sm font-medium">{isAdmin ? 'Delete project' : 'Leave project'}</div>
                      <div class="text-xs text-muted-foreground">
                        {isAdmin ? 'Permanently delete this project for all members' : 'Remove yourself from this project'}
                      </div>
                    </div>
                    <button
                      type="button"
                      class="h-8 px-2 text-sm text-destructive transition hover:bg-destructive/10 hover:text-destructive"
                      onclick={() => (showDeleteConfirm = true)}
                    >
                      {isAdmin ? 'Delete' : 'Leave'}
                    </button>
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </section>
      {/if}
    </div>
  </main>
</div>

{#if selectedMember}
  <button
    type="button"
    aria-label="Close member dialog"
    class="cryptly-dialog-overlay fixed inset-0 z-50 bg-black/80 backdrop-blur-[2px]"
    transition:fade={{ duration: 200 }}
    onpointerdown={closeMemberDialog}
    onclick={closeMemberDialog}
  ></button>
  <div
    role="dialog"
    aria-modal="true"
    class="cryptly-dialog-content fixed left-1/2 top-[15vh] z-50 grid max-h-[85vh] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 gap-4 overflow-y-auto rounded-lg border bg-background p-6 shadow-lg sm:max-w-sm"
    transition:dialogContentTransition={{ duration: 200 }}
  >
    <button
      type="button"
      aria-label="Close"
      class="absolute right-4 top-4 rounded-xs opacity-70 transition-opacity hover:opacity-100"
      onpointerdown={closeMemberDialog}
      onclick={closeMemberDialog}
    >
      <X class="size-4" />
    </button>

    <div class="flex flex-col items-center gap-4">
      <div class="flex size-16 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-medium">
        {#if selectedMember.avatarUrl}
          <img src={selectedMember.avatarUrl} alt={selectedMember.displayName} class="size-16 rounded-full object-cover" />
        {:else}
          <span class="text-2xl">{displayInitial(selectedMember)}</span>
        {/if}
      </div>

      <h2 class="text-lg font-semibold leading-none">
        {displayMemberName(selectedMember)}
      </h2>
      <p class="sr-only">Member details</p>

      {#if selectedMember.id !== auth.userData?.id && isAdmin}
        <div class="w-full space-y-4">
          <div class="space-y-2">
            <span class="text-xs font-medium text-muted-foreground">Role</span>
            <div class="grid grid-cols-3 gap-2">
              {#each Object.entries(roleMeta) as [role, meta] (role)}
                {@const RoleChoiceIcon = meta.icon}
                <button
                  type="button"
                  class={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all ${
                    selectedMember.role === role
                      ? 'border-primary bg-primary/10'
                      : 'border-border/50 bg-neutral-800/50 hover:border-primary/30 hover:bg-neutral-800'
                  }`}
                  disabled={updatingMember}
                  onclick={() => void updateSelectedMemberRole(role as 'read' | 'write' | 'admin')}
                >
                  <RoleChoiceIcon class="size-4 text-primary" />
                  <span class="text-xs font-medium">{meta.label}</span>
                </button>
              {/each}
            </div>
          </div>

          <div class="space-y-2">
            <span class="text-xs font-medium text-muted-foreground">Actions</span>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={updatingMember}
                class="inline-flex h-9 items-center justify-center rounded-md border border-border px-3 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
                onclick={() => void removeSelectedMember()}
              >
                <Trash2 class="mr-2 size-4" />
                Remove
              </button>
            </div>
          </div>
        </div>
      {:else}
        {@const modalRole = roleMeta[selectedMember.role as keyof typeof roleMeta] ?? roleMeta.read}
        <div class="rounded bg-muted px-3 py-1.5 text-xs capitalize text-muted-foreground">
          {modalRole.label}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  :global(.cryptly-dialog-content) {
    transform-origin: top center;
  }

  .project-row-enter {
    animation: cryptly-project-row-in 420ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  .tab-sliding-underline {
    transition:
      left 360ms cubic-bezier(0.22, 1, 0.36, 1),
      width 360ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 160ms ease;
    will-change: left, width;
  }

  @keyframes cryptly-project-row-in {
    from {
      opacity: 0;
      transform: translateX(-8px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

</style>

{#if showAddPeopleDialog}
  <button
    type="button"
    aria-label="Close add people dialog"
    class="cryptly-dialog-overlay fixed inset-0 z-50 bg-black/80 backdrop-blur-[2px]"
    transition:fade={{ duration: 200 }}
    onpointerdown={closeAddPeopleDialog}
    onclick={closeAddPeopleDialog}
  ></button>
  <div
    role="dialog"
    aria-modal="true"
    class="cryptly-dialog-content fixed left-1/2 top-[15vh] z-50 grid max-h-[85vh] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 gap-4 overflow-y-auto rounded-lg border bg-background p-6 shadow-lg sm:max-w-md"
    transition:dialogContentTransition={{ duration: 200 }}
  >
    {#if addPeopleStep !== 'type' && addPeopleStep !== 'done'}
      <button
        type="button"
        aria-label="Back"
        class="absolute left-4 top-4 rounded-sm p-1 opacity-70 transition-opacity hover:opacity-100"
        onclick={() => {
          if (addPeopleStep === 'role' && addPeopleType === 'suggested-user') {
            addPeopleStep = 'suggested-user';
          } else {
            addPeopleStep = 'type';
            addPeopleType = null;
            invitePassphrase = '';
            selectedSuggestedUser = null;
          }
        }}
      >
        <ArrowLeft class="size-4" />
      </button>
    {/if}
    <button
      type="button"
      aria-label="Close"
      class="absolute right-4 top-4 rounded-xs opacity-70 transition-opacity hover:opacity-100"
      onpointerdown={closeAddPeopleDialog}
      onclick={closeAddPeopleDialog}
    >
      <X class="size-4" />
    </button>

    {#if addPeopleStep !== 'done'}
      <div class="flex flex-col items-center gap-3 pt-1">
        <h2 class="text-center text-lg font-semibold">
          {addPeopleStep === 'type' ? 'Add people' : addPeopleStep === 'suggested-user' ? 'Choose a person' : 'Choose role'}
        </h2>
        <div class="flex items-center gap-1.5">
          {#each [1, 2, 3] as step}
            <span
              class={`h-1.5 rounded-full transition-all ${
                step <= (addPeopleStep === 'type' ? 1 : addPeopleStep === 'role' && addPeopleType === 'suggested-user' ? 3 : 2) ? 'w-5 bg-primary' : 'w-1.5 bg-muted'
              }`}
            ></span>
          {/each}
        </div>
        <p class="sr-only">Step {addPeopleStep === 'type' ? 1 : addPeopleStep === 'role' && addPeopleType === 'suggested-user' ? 3 : 2} of 3</p>
      </div>
    {/if}

    {#if addPeopleStep === 'type'}
      <div class="grid grid-cols-3 gap-3 pt-2">
        <button
          type="button"
          class="flex flex-col items-center gap-2 rounded-lg border border-border/50 bg-neutral-800/50 p-5 text-center transition-all hover:border-primary/30 hover:bg-neutral-800"
          onclick={() => {
            addPeopleType = 'invite-link';
            invitePassphrase = generateInviteCode();
            addPeopleStep = 'role';
          }}
        >
          <div class="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <Link class="size-5 text-primary" />
          </div>
          <div class="text-sm font-medium">Invite link</div>
        </button>
        <button
          type="button"
          class="flex flex-col items-center gap-2 rounded-lg border border-border/50 bg-neutral-800/50 p-5 text-center transition-all hover:border-primary/30 hover:bg-neutral-800"
          onclick={() => {
            addPeopleType = 'suggested-user';
            selectedSuggestedUser = null;
            addPeopleStep = 'suggested-user';
            void loadSuggestedUsers();
          }}
        >
          <div class="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <UserPlus class="size-5 text-primary" />
          </div>
          <div class="text-sm font-medium">Suggested</div>
        </button>
        <button
          type="button"
          disabled
          class="relative flex cursor-not-allowed flex-col items-center gap-2 rounded-lg border border-border/50 bg-neutral-800/30 p-5 text-center opacity-50"
        >
          <div class="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <Users class="size-5 text-primary" />
          </div>
          <div class="text-sm font-medium">Team</div>
          <span class="absolute right-2 top-2 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">Soon</span>
        </button>
      </div>
    {:else if addPeopleStep === 'suggested-user'}
      <div class="space-y-4 pt-2">
        {#if suggestedUsersLoading && suggestedUsers.length === 0}
          <div class="py-8 text-center text-sm text-muted-foreground">Loading...</div>
        {:else if suggestedUsers.length === 0}
          <div class="py-8 text-center text-sm text-muted-foreground">No suggested users found.</div>
        {:else}
          <div class="max-h-64 space-y-2 overflow-y-auto">
            {#each suggestedUsers as user (user.id)}
              <button
                type="button"
                disabled={!user.publicKey}
                class="flex w-full items-center gap-3 rounded-lg border border-border/50 bg-neutral-800/50 p-3 text-left transition-all hover:border-primary/30 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                onclick={() => {
                  selectedSuggestedUser = user;
                  addPeopleStep = 'role';
                }}
              >
                <div class="flex size-8 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-medium">
                  {#if user.avatarUrl}
                    <img src={user.avatarUrl} alt={user.displayName} class="size-8 rounded-full object-cover" />
                  {:else}
                    {user.displayName.charAt(0).toUpperCase()}
                  {/if}
                </div>
                <div class="text-sm font-medium">{user.displayName}</div>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {:else if addPeopleStep === 'role'}
      <div class="grid grid-cols-3 gap-3 pt-2">
        {#each Object.entries(roleMeta) as [role, meta] (role)}
          {@const InviteRoleIcon = meta.icon}
          <button
            type="button"
            disabled={creatingInvitation}
            class="flex flex-col items-center gap-2 rounded-lg border border-border/50 bg-neutral-800/50 p-5 text-center transition-all hover:border-primary/30 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            onclick={() => {
              if (addPeopleType === 'invite-link') {
                void createInviteLink(role as 'read' | 'write' | 'admin');
              } else {
                void createSuggestedInvitation(role as 'read' | 'write' | 'admin');
              }
            }}
          >
            <div class="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <InviteRoleIcon class="size-5 text-primary" />
            </div>
            <div class="text-sm font-medium">{meta.label}</div>
          </button>
        {/each}
      </div>
    {:else}
      <div class="space-y-4">
        <div class="text-center">
          <h2 class="text-lg font-semibold">{addPeopleType === 'invite-link' ? 'Invite ready' : 'Invitation sent'}</h2>
          <p class="mt-2 text-sm text-muted-foreground">
            {addPeopleType === 'invite-link'
              ? 'The invited person needs both the link and the code to join.'
              : `${selectedSuggestedUser?.displayName ?? 'The selected person'} has been invited to the project.`}
          </p>
        </div>
        {#if addPeopleType === 'invite-link'}
          <div class="space-y-3">
          <div class="space-y-1.5">
            <label for="invite-link" class="text-xs font-medium text-muted-foreground">Invite link</label>
            <div class="flex overflow-hidden rounded-md border border-input bg-background">
              <input id="invite-link" value={inviteUrl} readonly class="min-w-0 flex-1 truncate bg-transparent px-3 py-2 font-mono text-sm outline-none" />
              <button type="button" class="flex size-9 items-center justify-center hover:bg-secondary" onclick={() => void copyInviteField('link', inviteUrl)}>
                {#if inviteCopiedField === 'link'}<Check class="size-4 text-green-500" />{:else}<Copy class="size-4" />{/if}
              </button>
            </div>
          </div>
          <div class="space-y-1.5">
            <label for="invite-code" class="text-xs font-medium text-muted-foreground">Invitation code</label>
            <div class="flex overflow-hidden rounded-md border border-input bg-background">
              <input id="invite-code" value={invitePassphrase} readonly class="min-w-0 flex-1 truncate bg-transparent px-3 py-2 font-mono text-sm outline-none" />
              <button type="button" class="flex size-9 items-center justify-center hover:bg-secondary" onclick={() => void copyInviteField('code', invitePassphrase)}>
                {#if inviteCopiedField === 'code'}<Check class="size-4 text-green-500" />{:else}<Copy class="size-4" />{/if}
              </button>
            </div>
          </div>
          <p class="text-center text-xs text-muted-foreground">You won't be able to see the code again after closing this dialog.</p>
        </div>
        {/if}
        <button type="button" class="h-10 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" onclick={closeAddPeopleDialog}>
          Done
        </button>
      </div>
    {/if}
  </div>
{/if}

{#if showIntegrationDialog}
  <button
    type="button"
    aria-label="Close GitHub dialog"
    class="cryptly-dialog-overlay fixed inset-0 z-50 bg-black/80 backdrop-blur-[2px]"
    transition:fade={{ duration: 200 }}
    onpointerdown={closeIntegrationDialog}
    onclick={closeIntegrationDialog}
  ></button>
  <div
    role="dialog"
    aria-modal="true"
    class="cryptly-dialog-content fixed left-1/2 top-[15vh] z-50 grid max-h-[85vh] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 gap-4 overflow-y-auto rounded-lg border bg-background p-6 shadow-lg sm:max-w-md"
    transition:dialogContentTransition={{ duration: 200 }}
  >
    {#if selectedInstallationEntityId}
      <button
        type="button"
        aria-label="Back"
        class="absolute left-4 top-4 rounded-sm p-1 opacity-70 transition-opacity hover:opacity-100"
        onclick={() => {
          selectedInstallationEntityId = '';
          integrationRepoSearch = '';
        }}
      >
        <ArrowLeft class="size-4" />
      </button>
    {/if}
    <button
      type="button"
      aria-label="Close"
      class="absolute right-4 top-4 rounded-xs opacity-70 transition-opacity hover:opacity-100"
      onpointerdown={closeIntegrationDialog}
      onclick={closeIntegrationDialog}
    >
      <X class="size-4" />
    </button>

    <div class="flex flex-col items-center gap-3 pt-1">
      <h2 class="text-center text-lg font-semibold">{selectedInstallationEntityId ? 'Choose repository' : 'Choose installation'}</h2>
      <div class="flex items-center gap-1.5">
        <span class="h-1.5 w-5 rounded-full bg-primary"></span>
        <span class={`h-1.5 rounded-full transition-all ${selectedInstallationEntityId ? 'w-5 bg-primary' : 'w-1.5 bg-muted'}`}></span>
      </div>
      <p class="sr-only">Step {selectedInstallationEntityId ? 2 : 1} of 2</p>
    </div>

    {#if !selectedInstallationEntityId}
      <div class="space-y-2 pt-2">
        {#if installations.length === 0}
          <div class="space-y-3 py-8 text-center">
            <div class="text-sm text-muted-foreground">No GitHub installations found.</div>
            <button
              type="button"
              disabled={installingGithubApp}
              class="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
              onclick={() => void installGithubApp()}
            >
              <Plus class="size-4" />
              {installingGithubApp ? 'Opening…' : 'Install GitHub App'}
            </button>
          </div>
        {:else}
          <div class="max-h-64 space-y-2 overflow-y-auto">
            {#each installations as installation (installation.id)}
              <button
                type="button"
                class="flex w-full items-center gap-3 rounded-lg border border-border/50 bg-neutral-800/50 p-3 text-left transition-all hover:border-primary/30 hover:bg-neutral-800"
                onclick={() => chooseInstallation(installation.id)}
              >
                <div class="flex size-8 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-medium">
                  {#if installation.liveData?.avatar}
                    <img src={installation.liveData.avatar} alt={installation.liveData.owner} class="size-8 rounded-full object-cover" />
                  {:else}
                    <Github class="size-4" />
                  {/if}
                </div>
                <div class="text-sm font-medium">
                  {installation.liveData?.owner ?? `Installation ${installation.githubInstallationId}`}
                </div>
              </button>
            {/each}
          </div>
          <button
            type="button"
            disabled={installingGithubApp}
            class="flex w-full items-center gap-3 rounded-lg border border-dashed border-border/50 bg-neutral-800/30 p-3 text-left text-muted-foreground transition-all hover:border-primary/30 hover:bg-neutral-800 disabled:opacity-50"
            onclick={() => void installGithubApp()}
          >
            <div class="flex size-8 items-center justify-center rounded-full bg-primary/10">
              <Plus class="size-4 text-primary" />
            </div>
            <div class="text-sm font-medium">{installingGithubApp ? 'Opening…' : 'Add new installation'}</div>
          </button>
        {/if}
      </div>
    {:else}
      <div class="min-w-0 space-y-2 pt-2">
        {#if suggestionsLoading}
          <div class="flex flex-col items-center justify-center gap-3 py-8">
            <span class="size-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></span>
            <div class="text-sm text-muted-foreground">Loading repositories...</div>
          </div>
        {:else}
          <input
            bind:value={integrationRepoSearch}
            placeholder="Search repositories..."
            autocomplete="off"
            class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary/60"
          />
          <div class="max-h-64 space-y-1 overflow-y-auto">
            {#each repositoriesForSelectedInstallation as repo (repo.id)}
              <button
                type="button"
                disabled={connectingIntegration}
                class="flex w-full min-w-0 items-center gap-2.5 rounded-lg border border-border/50 bg-neutral-800/50 px-2.5 py-2 text-left transition-all hover:border-primary/30 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                onclick={() => void connectRepository(repo)}
              >
                <div class="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-medium">
                  {#if repo.avatarUrl}
                    <img src={repo.avatarUrl} alt={repo.owner} class="size-6 rounded-full object-cover" />
                  {:else}
                    <Github class="size-3.5" />
                  {/if}
                </div>
                <div class="truncate text-sm font-medium">{repo.owner}/{repo.name}</div>
              </button>
            {:else}
              <div class="py-4 text-center text-sm text-muted-foreground">No repositories found.</div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}

{#if showCreateDialog}
  <button
    type="button"
    aria-label="Close create project dialog"
    class="cryptly-dialog-overlay fixed inset-0 z-50 bg-black/80 backdrop-blur-[2px]"
    transition:fade={{ duration: 200 }}
    onpointerdown={closeCreateDialog}
    onclick={closeCreateDialog}
  ></button>
  <form
    class="cryptly-dialog-content fixed left-1/2 top-[15vh] z-50 grid max-h-[85vh] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 gap-4 overflow-y-auto rounded-lg border bg-background p-6 shadow-lg sm:max-w-md"
    transition:dialogContentTransition={{ duration: 200 }}
    onsubmit={(event) => {
      event.preventDefault();
      void createProject();
    }}
  >
    {#if !creatingProject}
      <button
        type="button"
        aria-label="Close"
        class="absolute right-4 top-4 rounded-xs opacity-70 transition-opacity hover:opacity-100"
        onpointerdown={closeCreateDialog}
        onclick={closeCreateDialog}
      >
        <X class="size-4" />
      </button>
    {/if}

    <div>
      <h2 class="text-lg font-semibold">Add a new project</h2>
      <p class="mt-2 text-sm text-muted-foreground">
        Name your project and choose how secrets should reveal in the editor. We'll remember this for next time.
      </p>
    </div>

    <div class="grid gap-2">
      <label for="new-project-name" class="text-sm font-medium">Project name</label>
      <input
        bind:this={createInput}
        id="new-project-name"
        type="text"
        bind:value={newProjectName}
        autocomplete="off"
        disabled={creatingProject}
        class="h-10 w-full rounded-md border border-input bg-background px-3 text-base outline-none transition focus:border-primary/60 sm:text-sm"
        required
      />
    </div>

    <div class="grid gap-2">
      <span class="text-sm font-medium">Reveal on</span>
      <div
        class={`flex flex-col gap-3 rounded-lg border border-border/50 bg-neutral-800/20 p-4 ${creatingProject ? 'opacity-60' : ''}`}
        data-slot="project-reveal-on-picker"
      >
        <div class="grid grid-cols-3 gap-2">
          {#each revealOptions as option, index (option.key)}
            {@const RevealIcon = option.icon}
            {@const activeReveal = index === revealIndex(createRevealOn)}
            <button
              type="button"
              disabled={creatingProject}
              aria-pressed={activeReveal}
              aria-label={option.label}
              class={`flex h-10 items-center justify-center rounded-md transition-all disabled:cursor-not-allowed ${
                activeReveal ? 'text-primary' : 'text-muted-foreground/60 hover:text-muted-foreground'
              }`}
              onclick={() => (createRevealOn = option.key)}
            >
              <RevealIcon class={`size-5 transition-transform ${activeReveal ? 'scale-110' : ''}`} />
            </button>
          {/each}
        </div>

        <div class="relative h-8 select-none">
          <div class="absolute inset-x-2 top-1/2 h-1 -translate-y-1/2 rounded-full bg-neutral-700/70"></div>
          <div
            class="absolute left-2 top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary transition-all duration-200"
            style={`width: calc(((100% - 1rem) / 2) * ${revealIndex(createRevealOn)})`}
          ></div>
          <div class="absolute inset-x-2 top-0 grid h-full grid-cols-3">
            {#each revealOptions as option, index (option.key)}
              {@const activeDot = index === revealIndex(createRevealOn)}
              {@const behindDot = index < revealIndex(createRevealOn)}
              <button
                type="button"
                disabled={creatingProject}
                aria-label={`Select ${option.label}`}
                class="relative flex items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed"
                style={`justify-self: ${index === 0 ? 'start' : index === revealOptions.length - 1 ? 'end' : 'center'}`}
                onclick={() => (createRevealOn = option.key)}
              >
                <span
                  class={`relative z-10 block rounded-full transition-all duration-200 ${
                    activeDot
                      ? 'size-4 bg-primary ring-4 ring-primary/20'
                      : behindDot
                        ? 'size-3 bg-primary'
                        : 'size-3 bg-neutral-600'
                  }`}
                ></span>
              </button>
            {/each}
          </div>
        </div>

        <div class="flex flex-col gap-0.5 text-center">
          {#each revealOptions as option (option.key)}
            {#if option.key === createRevealOn}
              <span class="text-sm font-semibold text-foreground">{option.label}</span>
              <span class="text-xs text-muted-foreground">{option.description}</span>
            {/if}
          {/each}
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-2 pt-2">
      <button
        type="submit"
        disabled={!newProjectName.trim() || creatingProject}
        class="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {creatingProject ? 'Creating…' : 'Create project'}
      </button>
    </div>
  </form>
{/if}

<script lang="ts">
  import AcceptInvitationPage from '$lib/invitations/ui/AcceptInvitationPage.svelte';

  let { data } = $props();
</script>

<AcceptInvitationPage inviteId={data.inviteId} />

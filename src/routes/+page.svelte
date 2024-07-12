<script lang="ts">
	import { superActions } from '$lib/client.js';

	export let data;

	$: taskApi = superActions(data.taskActions);
</script>

<h1>Welcome to your library project</h1>
<p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

{#await taskApi.getTasks()}
	<p>Loading tasks...</p>
{:then tasks}
	<ul>
		{#each tasks as task}
			<li>
				<pre>{JSON.stringify(task, null, 2)}</pre>
			</li>
		{/each}
	</ul>
{/await}

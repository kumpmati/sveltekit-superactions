<script lang="ts">
	import { onMount } from 'svelte';
	import { createApi } from '$lib/v2/client.js';
	import type { API } from './api/+server.js';

	const client = createApi<API>('/v2/api');

	onMount(async () => {
		console.log(await client.createTodo('moi'));
	});
</script>

<h1>Moi</h1>

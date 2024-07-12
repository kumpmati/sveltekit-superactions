<script lang="ts">
	import { superActions } from '$lib/client.js';
	import { onMount } from 'svelte';

	export let data: PageData;

	let text: string;

	$: todoAPI = superActions(data.todoActions);
	let todos = [];

	const getData = () => {
		todoAPI.getTodos().then((d) => (todos = d));
	};

	onMount(() => getData());
</script>

<h1>Welcome to your library project</h1>
<p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<ul>
	{#each todos as todo}
		<li>
			<p>{todo.text}</p>
			<input
				type="checkbox"
				checked={todo.done}
				on:click={() =>
					todoAPI.editTodo({ id: todo.id, payload: { done: !todo.done } }).then(() => getData())}
			/>

			<button on:click={() => todoAPI.deleteTodo(todo.id).then(() => getData())}>x</button>
		</li>
	{/each}
</ul>

<input type="text" required bind:value={text} />
<button on:click={() => todoAPI.createTodo({ text, done: false }).then(() => getData())}>
	Create TODO
</button>

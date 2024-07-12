<script lang="ts">
	import { superActions } from '$lib/client.js';
	import { onMount } from 'svelte';
	import type { Todo } from '$lib/server/tasks.js';
	import type { PageData } from './$types.js';

	export let data: PageData;

	let text: string;

	$: todoAPI = superActions(data.todoAPI);
	let todos: Todo[] = [];

	const getData = () => {
		todoAPI.getTodos().then((d) => (todos = d));
	};

	onMount(() => {
		getData();
	});
</script>

<h1>SvelteKit Superactions TODO App</h1>

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
	Add TODO
</button>

<br />

<button on:click={() => todoAPI.shouldFail()}> Fail </button>
<button on:click={() => todoAPI.shouldRedirect()}> Redirect </button>

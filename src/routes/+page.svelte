<script lang="ts">
	import { superActions } from '$lib/client.js';
	import { onMount } from 'svelte';
	import type { Todo } from './api/tasks.js';
	import type { API } from './api/+server.js';
	import type { SpreadAPI } from './api/spread/+server.js';
	import type { NestedAPI } from './api/nested/+server.js';

	let text: string;

	const nested = superActions<NestedAPI>('/api/nested');
	const { greet } = superActions<SpreadAPI>('/api/spread');
	const todoAPI = superActions<API>('/api');

	let todos: Todo[] = [];

	const getData = () => {
		todoAPI.getTodos().then((d) => (todos = d));
	};

	onMount(async () => {
		console.log('second.foo', await nested.second.foo(5));
		console.log('second.third.bar', await nested.second.third.bar());
		console.log('utils.beanify', await nested.utils.beanify('man'));
		getData();
	});
</script>

<h1>SvelteKit Superactions TODO App</h1>

<button on:click={() => greet('World').then((d) => alert(d.greeting))}>Greet</button>

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
<button on:click={() => todoAPI.shouldRedirect(undefined, { followRedirects: true })}>
	Redirect
</button>

<button
	on:click={() =>
		todoAPI.extraHeaders(undefined, {
			fetch: {
				headers: {
					'x-custom-header': 'hello world'
				}
			}
		})}
>
	Send extra headers
</button>

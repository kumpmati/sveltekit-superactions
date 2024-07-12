# SvelteKit Superactions

Call your SvelteKit server endpoints from your client-side code with full type safety.

**🚧 This library is in an early state, and breaking changes will likely happen. 🚧**

## Why?

While SvelteKit's data fetching patterns are great, but the ease-of-use of React Server Actions doesn't seem to have an equivalent in SvelteKit. The ability to just 'call a function' in the client-side, have it perform logic on the server and return the result to the client is sometimes very useful.

SvelteKit's [form actions](https://kit.svelte.dev/docs/form-actions) are a great fit for many cases, but they can be clunky when you want to call an endpoint without a form element, or when you need to send data that is too complex to be represented in FormData.

This library aims to provide additional tools alongside SvelteKit's server endpoints:

## Features

- [x] Type satefy between server and client
- [x] Automatic JSON conversion (request/response)
- [ ] Support for validation libraries via adapters (TODO)

## Installation

Install Superactions with your favourite package manager:

```bash
# npm, yarn, pnpm, bun, etc
npm i sveltekit-superactions
```

## Usage

A minimal setup requires the following.

In a `+server.ts` file, define the actions that you want to use:

```ts
// src/routes/api/+server.ts
import { superAPI } from 'sveltekit-superactions';
import { db } from '$lib/server/db';
import { deleteTodo, findTodo, type TodoUpdate } from '$lib/server/handlers';

// Always attach the API as a POST handler
export const POST = buildAPI({
	// Make sure the path is the same as where you're attaching the handler.
	// src/routes/api/+server.ts -> path: '/api'
	path: '/api',
	actions: {
		// The first argument is the RequestEvent provided by SvelteKit,
		// and the second argument is the request body decoded as JSON.
		editTodo: async (e, body: TodoUpdate) => {
			// The returned value is automatically serialized as JSON.
			// The client-side function gets its return type directly from the return type of its server action
			return await db.update(body.id, body);
		},

		// You can also just import handlers from other files and group them here.
		deleteTodo,

		// Or give them custom names
		my_handler: findTodo
	}
});
```

```ts
// src/routes/+page.server.ts

import { POST as todoAPI } from './some-route/+server.ts';

export const load = async () => {
	return {
		// To use the actions in the client-side, we must always return them from a server load function.
		// The name of the variable doesn't matter, and you can return as many as you want.
		todoActions: todoAPI.actions
	};
};
```

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { superActions } from 'sveltekit-superactions';

	export let data;

	// To instantiate the client-side actions, call `superActions` with the data returned from the load function
	const api = superActions(data.todoActions);
</script>

{#await api.getTodos()}
	<p>Loading TODOs...</p>
{:then todos}
	<ul>
		{#each todos as todo}
			<li>
				{todo.text}
				<input type="checkbox" checked={todo.checked} />
			</li>
		{/each}
	</ul>
{/await}
```

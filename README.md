<img src="https://raw.githubusercontent.com/kumpmati/superactions-docs/main/public/logo.webp" width="64px" align="center" alt="Superforms logo" /> 
<h1>SvelteKit Superactions</h1>

[![Test](https://github.com/kumpmati/sveltekit-superactions/actions/workflows/test.yml/badge.svg)](https://github.com/kumpmati/sveltekit-superactions/actions/workflows/test.yml)

Call your server code from the client like normal functions.

**🚧 This library is in an early state, and breaking changes will likely happen before a v1.0 release! 🚧**

[Documentation](https://superactions.matsku.dev)

## Why?

While SvelteKit's data fetching patterns are great, but the ease-of-use of React Server Actions doesn't seem to have an equivalent in SvelteKit. The ability to just 'call a function' in the client-side, have it perform logic on the server and return the result to the client is sometimes very useful.

SvelteKit's [form actions](https://kit.svelte.dev/docs/form-actions) are a great fit for many cases, but they can be clunky when you want to call an endpoint without a form element, or when you need to send data that is too complex to be represented in FormData.

This library aims to provide additional tools alongside SvelteKit's API routes:

## Features

- [x] Type satefy between server and client
- [x] Automatic JSON conversion (request/response)
- [x] Schema validation
  - [x] `zod` helper function
  - [x] `joi` helper function

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
import { endpoint } from 'sveltekit-superactions';
import { db } from '$lib/server/db';
import { deleteTodo, findTodo, type TodoUpdate } from '$lib/server/handlers';

// Always attach the endpoint as a POST handler
export const POST = endpoint({
	// Make sure the path is the same as where you're attaching the handler.
	// src/routes/api/+server.ts -> path: '/api'
	path: '/api',
	actions: {
		// e is the RequestEvent provided by SvelteKit,
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

// export the type of the endpoint, so that we get types in the client
export type API = typeof POST;
```

And in any Svelte component import the `superActions` function and the exported types to instantiate the client.

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { superActions } from 'sveltekit-superactions';
	import type { API } from './api/+server.js'; // exported API type

	// give the client the path and API types to instantiate it.
	const api = superActions<API>('/api');
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

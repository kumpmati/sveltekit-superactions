import { endpoint } from '$lib/server.js';
import { createTodo } from './actions.js';

export const POST = endpoint({
	path: '/v2/api',
	actions: { createTodo }
});

export type API = typeof POST;

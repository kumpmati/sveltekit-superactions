import type { ServerAction } from '$lib/types.js';

export const createTodo: ServerAction<string> = async (e, body) => {
	console.log('hello from createTodo', body);
};

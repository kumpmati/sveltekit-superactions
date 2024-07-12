import { superEndpoints } from '$lib/server.js';

export const taskApi = superEndpoints('/api', {
	getTasks: async () => [
		{ id: 1, text: 'Hello world', done: false },
		{ id: 2, text: 'Lorem ipsum', done: true }
	],

	deleteTask: async () => {
		return null;
	}
});

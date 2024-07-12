import { superAPI } from '$lib/server.js';
import { createTodo, deleteTodo, editTodo, getTodos } from '$lib/server/tasks.js';
import { error, redirect } from '@sveltejs/kit';

export const POST = superAPI({
	path: '/api',
	actions: {
		getTodos,
		createTodo,
		editTodo,
		deleteTodo,

		shouldFail: async () => {
			error(500, 'not implemented');
		},

		shouldRedirect: async () => {
			redirect(302, '/other-page');
		}
	}
});

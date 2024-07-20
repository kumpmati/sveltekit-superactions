import { endpoint } from '$lib/server.js';
import { createTodo, deleteTodo, editTodo, editTodoSchema, getTodos, todoSchema } from './tasks.js';
import { joi } from '$lib/validate/joi.js';
import { zod } from '$lib/validate/zod.js';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const POST = endpoint({
	getTodos,
	createTodo: zod(todoSchema.omit({ id: true }), createTodo),
	editTodo: joi(editTodoSchema, editTodo),
	deleteTodo: zod(z.number().int(), deleteTodo),

	shouldFail: async () => {
		error(500, 'not implemented');
	},

	shouldRedirect: async () => {
		redirect(302, '/other-page');
	},

	extraHeaders: async (e) => {
		console.log('headers', Object.fromEntries(e.request.headers));

		return null;
	}
});

export type API = typeof POST;

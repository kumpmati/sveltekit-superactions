import { superEndpoints } from '$lib/server.js';
import { createTodo, deleteTodo, editTodo, getTodos } from '$lib/server/tasks.js';

export const todoAPI = superEndpoints('/api', {
	getTodos,
	createTodo,
	editTodo,
	deleteTodo
});

import type { ServerAction } from '$lib/types.js';
import { error } from '@sveltejs/kit';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Todo = {
	id: number;
	text: string;
	done: boolean;
};

let todos: Todo[] = [];

export const getTodos = async () => {
	await wait(100);
	return todos;
};

export const createTodo = async (body: Omit<Todo, 'id'>) => {
	await wait(100);

	const todo = { id: Math.floor(Math.random() * 100000), ...body };
	todos.push(todo);
	return todo;
};

type EditTodoBody = {
	id: number;
	payload: Partial<Todo>;
};

export const editTodo: ServerAction<EditTodoBody> = async (body) => {
	await wait(100);

	const found = todos.find((t) => t.id === body.id);
	if (!found) error(404, 'todo not found');

	Object.assign(found, body.payload);
	return found;
};

export const deleteTodo = async (id: number) => {
	await wait(100);
	todos = todos.filter((t) => t.id !== id);
};

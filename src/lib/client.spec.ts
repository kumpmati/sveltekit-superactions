import { describe, expect, it } from 'vitest';
import { superAPI } from './server.js';
import { superActions } from './client.js';

const noop = async () => null;

describe('client', () => {
	describe('superActions', () => {
		it('contains all given server endpoints as functions', () => {
			const serverActions = { a: noop, b: noop, c: noop };
			const server = superAPI({ path: '/', actions: serverActions });

			const client = superActions(server.actions);

			expect(Object.keys(client)).toEqual(Object.keys(serverActions));
			Object.values(client).forEach((val) => expect(val).toBeTypeOf('function'));
		});
	});

	describe('default handler', () => {
		it.todo('provides the function argument as body');
		it.todo('calls the correct endpoint');
		it.todo('follows redirects');
		it.todo('throws errors returned from the server');
	});
});

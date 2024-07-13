import { describe, expect, it } from 'vitest';
import { superAPI } from './server.js';
import type { RequestEvent } from '@sveltejs/kit';

const noop = async () => null;

describe('server', () => {
	describe('default handler', () => {
		it('should throw when receiving a non-POST request', async () => {
			const api = superAPI({ path: '/', actions: { a: noop } });

			try {
				await api({
					request: { method: 'GET' } as Request,
					url: new URL('http://localhost:5173/?_sa=a')
				} as RequestEvent);

				expect.fail('should have thrown');
			} catch (err) {
				expect(err).toEqual({ status: 405, body: { message: 'method not allowed' } });
			}
		});

		it('should throw when called without proper url params', async () => {
			const api = superAPI({
				path: '/',
				actions: { a: noop }
			});

			try {
				await api({
					request: { method: 'POST' } as Request,
					url: new URL('http://localhost:5173/') // missing _sa query parameter
				} as RequestEvent);

				expect.fail('should have thrown');
			} catch (err) {
				expect(err).toEqual({ status: 400, body: { message: 'invalid query parameters' } });
			}
		});

		it('should throw when an action is not found', async () => {
			const api = superAPI({
				path: '/',
				actions: { a: noop }
			});

			try {
				await api({
					request: { method: 'POST' } as Request,
					url: new URL('http://localhost:5173/?_sa=b') // non-existing route
				} as RequestEvent);

				expect.fail('should have thrown');
			} catch (err) {
				expect(err).toEqual({ status: 404, body: { message: 'not found' } });
			}
		});

		it.todo('should run the action function');
		it.todo('should give the request body as an argument to the action');
		it.todo('should return the value from the action inside the response');
	});

	describe('output API', () => {
		it('should have the input path in the output', () => {
			const api = superAPI({
				path: '/my-custom-path',
				actions: {}
			});

			expect(api.actions.path).toEqual('/my-custom-path');
		});

		it('should contain all input keys in the output', () => {
			const obj = { a: noop, b: noop, c: noop, d: noop };

			const expectedKeys = Object.keys(obj);

			const api = superAPI({
				path: '/',
				actions: obj
			});

			expect(Object.keys(api.actions.actions)).toEqual(expectedKeys);
		});

		it('should have serializable output', () => {
			const api = superAPI({
				path: '/some-route',
				actions: { a: noop, b: noop }
			});

			const counterExample = { a: noop };

			// Functions can't be serialized to JSON
			expect(JSON.parse(JSON.stringify(counterExample))).not.toEqual(counterExample);

			// API output should have only serializable information.
			expect(JSON.parse(JSON.stringify(api.actions))).toEqual(api.actions);
		});
	});
});

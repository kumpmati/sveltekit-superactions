import { describe, expect, it, vi } from 'vitest';
import { superAPI } from './server.js';
import type { RequestEvent } from '@sveltejs/kit';

const noop = async () => null;

const actionURL = (name: string) => new URL(`http://localhost:5173/?_sa=${name}`);

describe('server', () => {
	describe('default handler', () => {
		it('should throw when receiving a non-POST request', async () => {
			const api = superAPI({ path: '/', actions: { a: noop } });

			try {
				await api({
					request: { method: 'GET' } as Request,
					url: actionURL('a')
				} as RequestEvent);

				expect.fail('should have thrown');
			} catch (err) {
				expect(err).toEqual({ status: 405, body: { message: 'method not allowed' } });
			}
		});

		it('should throw when called without proper url params', async () => {
			const api = superAPI({ path: '/', actions: { a: noop } });

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
					url: actionURL('b') // non-existing route
				} as RequestEvent);

				expect.fail('should have thrown');
			} catch (err) {
				expect(err).toEqual({ status: 404, body: { message: 'not found' } });
			}
		});

		it('should run the action function and return its return value as JSON', async () => {
			const action = vi.fn(async () => 'my value');

			const api = superAPI({ path: '/', actions: { a: action } });

			try {
				const res = await api({
					request: { method: 'POST', json: () => Promise.resolve('test body') } as Request,
					url: actionURL('a')
				} as RequestEvent);

				expect(await res.json()).toEqual('my value');
				expect(action).toHaveBeenCalledOnce();
			} catch (err) {
				expect.fail(err as string);
			}
		});

		it('should give the event and request body as arguments to the action', async () => {
			const expectedBody = { hello: 'world' };

			const action = vi.fn(async (e, body) => {
				expect(e).toBeTruthy();
				expect(body).toEqual(expectedBody);

				return null;
			});

			const api = superAPI({ path: '/', actions: { a: action } });

			await api({
				request: { method: 'POST', json: () => Promise.resolve(expectedBody) } as Request,
				url: actionURL('a')
			} as RequestEvent);

			expect(action).toHaveBeenCalledOnce();
		});

		it('should throw whatever the action throws', async () => {
			const api = superAPI({
				path: '/',
				actions: {
					a: async () => {
						throw new Error('test error');
					}
				}
			});

			expect(
				api({
					request: { method: 'POST', json: () => Promise.resolve({}) } as Request,
					url: actionURL('a')
				} as RequestEvent)
			).rejects.toThrowError('test error');
		});
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

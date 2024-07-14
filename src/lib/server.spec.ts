import createFetchMock from 'vitest-fetch-mock';
import { beforeEach, vi } from 'vitest';

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

import { describe, expect, it } from 'vitest';
import { superAPI } from './server.js';
import type { RequestEvent } from '@sveltejs/kit';
import { parse, stringify } from 'devalue';

const noop = async () => null;

const actionURL = (name: string) => new URL(`http://localhost:5173/?_sa=${name}`);

describe('server', () => {
	beforeEach(() => fetchMocker.resetMocks());

	describe('default handler', () => {
		it('throws when receiving a non-POST request', async () => {
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

		it('throws when called without proper url params', async () => {
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

		it('throws when an action is not found', async () => {
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

		it('runs the action function and returns its return value as a devalue string', async () => {
			const action = vi.fn(async () => ({ foo: 'bar' }));

			const api = superAPI({ path: '/', actions: { a: action } });

			try {
				const res = await api({
					request: {
						method: 'POST',
						text: () => Promise.resolve(stringify('test body'))
					} as Request,
					url: actionURL('a')
				} as RequestEvent);

				// get the result of the mock request and parse its body
				expect(await res.text().then((d) => parse(d))).toEqual({ foo: 'bar' });
				expect(action).toHaveBeenCalledOnce();
			} catch (err) {
				expect.fail(err as string);
			}
		});

		it('gives the event and request body as arguments to the action', async () => {
			const expectedBody = { hello: 'world' };

			const action = vi.fn(async (e, body) => {
				expect(e).toBeTruthy();
				expect(body).toEqual(expectedBody);

				return null;
			});

			const api = superAPI({ path: '/', actions: { a: action } });

			await api({
				request: {
					method: 'POST',
					text: () => Promise.resolve(stringify(expectedBody))
				} as unknown as Request,
				url: actionURL('a')
			} as RequestEvent);

			expect(action).toHaveBeenCalledOnce();
		});

		it('throws whatever the action throws', async () => {
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
					request: { method: 'POST', text: () => Promise.resolve(stringify({})) } as Request,
					url: actionURL('a')
				} as RequestEvent)
			).rejects.toThrowError('test error');
		});
	});

	describe('output API', () => {
		it('has the input path in the output', () => {
			const api = superAPI({
				path: '/my-custom-path',
				actions: {}
			});

			expect(api.actions.path).toEqual('/my-custom-path');
		});

		it('contains all input keys in the output', () => {
			const obj = { a: noop, b: noop, c: noop, d: noop };

			const expectedKeys = Object.keys(obj);

			const api = superAPI({
				path: '/',
				actions: obj
			});

			expect(Object.keys(api.actions.actions)).toEqual(expectedKeys);
		});

		it('has serializable output', () => {
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

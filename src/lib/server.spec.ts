import createFetchMock from 'vitest-fetch-mock';
import { beforeEach, vi } from 'vitest';

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

import { describe, expect, it } from 'vitest';
import { endpoint } from './server.js';
import type { RequestEvent } from '@sveltejs/kit';
import { parse, stringify } from 'devalue';

const noop = async () => null;

const actionURL = (name: string) => new URL(`http://localhost:5173/?_sa=${name}`);

describe('server', () => {
	beforeEach(() => fetchMocker.resetMocks());

	describe('default handler', () => {
		it('throws when receiving a non-POST request', async () => {
			const ep = endpoint({ path: '/', actions: { a: noop } });

			try {
				await ep({
					request: { method: 'GET' } as Request,
					url: actionURL('a')
				} as RequestEvent);

				expect.fail('should have thrown');
			} catch (err) {
				expect(err).toEqual({ status: 405, body: { message: 'method not allowed' } });
			}
		});

		it('throws when called without proper url params', async () => {
			const ep = endpoint({ path: '/', actions: { a: noop } });

			try {
				await ep({
					request: { method: 'POST' } as Request,
					url: new URL('http://localhost:5173/') // missing _sa query parameter
				} as RequestEvent);

				expect.fail('should have thrown');
			} catch (err) {
				expect(err).toEqual({ status: 400, body: { message: 'invalid query parameters' } });
			}
		});

		it('throws when an action is not found', async () => {
			const ep = endpoint({ path: '/', actions: { a: noop } });

			try {
				await ep({
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

			const ep = endpoint({ path: '/', actions: { a: action } });

			try {
				const res = await ep({
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

			const ep = endpoint({ path: '/', actions: { a: action } });

			await ep({
				request: {
					method: 'POST',
					text: () => Promise.resolve(stringify(expectedBody))
				} as unknown as Request,
				url: actionURL('a')
			} as RequestEvent);

			expect(action).toHaveBeenCalledOnce();
		});

		it('throws whatever the action throws', async () => {
			const ep = endpoint({
				path: '/',
				actions: {
					a: async () => {
						throw new Error('test error');
					}
				}
			});

			expect(
				ep({
					request: { method: 'POST', text: () => Promise.resolve(stringify({})) } as Request,
					url: actionURL('a')
				} as RequestEvent)
			).rejects.toThrowError('test error');
		});
	});
});

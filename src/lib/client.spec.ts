import createFetchMock from 'vitest-fetch-mock';
import { beforeEach, vi } from 'vitest';

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

import { describe, expect, it } from 'vitest';
import { endpoint } from './server.js';
import { superActions } from './client.js';
import { parse } from 'devalue';

const noop = async () => null;

describe('client', () => {
	beforeEach(() => fetchMocker.resetMocks());

	describe('superActions', () => {
		it('contains all given actions as functions', () => {
			const actions = { a: noop, b: noop };
			const ep = endpoint({ path: '/', actions: actions });

			const client = superActions(ep.actions);

			expect(Object.keys(client)).toEqual(Object.keys(actions));
			Object.values(client).forEach((val) => expect(val).toBeTypeOf('function'));
		});
	});

	describe('default handler', () => {
		it('encodes the function args as a devalue string in the request body', async () => {
			const api = endpoint({
				path: '/',
				actions: { a: async (e, body: { foo: string }) => body }
			});

			const client = superActions(api.actions);

			client.a({ foo: 'bar' });

			// retrieve the request made by the client call
			const req = fetchMocker.requests()[0];

			expect(parse(await req.text())).toEqual({ foo: 'bar' });
		});

		it.todo('follows redirects without reading the body');
		it.todo('throws errors returned from the server');
	});
});

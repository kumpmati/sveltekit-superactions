import createFetchMock from 'vitest-fetch-mock';
import { beforeEach, vi } from 'vitest';

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

import { describe, expect, it } from 'vitest';
import { superActions } from './client.js';
import { parse } from 'devalue';

describe('client', () => {
	beforeEach(() => fetchMocker.resetMocks());

	describe('superActions', () => {
		it('returns a new proxy that returns a function for each property access', () => {
			const client = superActions('/');

			expect(client.a).toBeTypeOf('function');
			expect(client.b).toBeTypeOf('function');
		});
	});

	describe('default handler', () => {
		it('encodes the function args as a devalue string in the request body', async () => {
			const client = superActions('/');

			client.a({ foo: 'bar' });

			// retrieve the request made by the client call
			const req = fetchMocker.requests()[0];

			expect(parse(await req.text())).toEqual({ foo: 'bar' });
		});

		it.todo('follows redirects without reading the body');
		it.todo('throws errors returned from the server');
	});
});

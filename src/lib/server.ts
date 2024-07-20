import { error, text, type RequestHandler } from '@sveltejs/kit';
import type { ActionMap, Endpoint } from './types.js';
import { parse, stringify } from 'devalue';
import { getEndpointByPath } from './helpers.js';

const createDefaultHandler = <T extends ActionMap>(actions: T): RequestHandler => {
	return async (e) => {
		const { request, url } = e;

		if (request.method !== 'POST') {
			error(405, 'method not allowed');
		}

		const key = url.searchParams.get('_sa');
		if (!key || typeof key !== 'string') {
			error(400, 'invalid query parameters');
		}

		const endpoint = getEndpointByPath(actions, (key ?? '').split('.'));
		if (!endpoint) {
			error(404, 'not found');
		}

		const body = await request.text().then((d) => (d ? parse(d) : null));

		const response = await endpoint(e, body);

		return text(stringify(response));
	};
};

/**
 * Used to build an endpoint that holds one or more action(s),
 * where an action is a function that the client can call like a normal `async` function.
 *
 * It returns a request handler function that can be mounted as a POST handler.
 *
 * @param actions The functions to expose to the client.
 */
export const endpoint = <T extends ActionMap, RH extends RequestHandler = RequestHandler>(
	actions: T
): Endpoint<T, RH> => {
	return createDefaultHandler(actions) as Endpoint<T, RH>;
};

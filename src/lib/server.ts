import { error, json, type RequestHandler } from '@sveltejs/kit';
import { mapKeys } from './helpers.js';
import type { ServerEndpointMap, ServerAPI, ServerOptions } from './types.js';

const createDefaultHandler = <T extends ServerEndpointMap>(
	serverOpts: ServerOptions<T>
): RequestHandler => {
	return async (e) => {
		const { request, url } = e;

		if (request.method !== 'POST') {
			error(405, 'method not allowed');
		}

		const key = url.searchParams.get('_sa');
		if (!key || typeof key !== 'string') {
			error(400, 'invalid query parameters');
		}

		const endpoint = serverOpts.actions[key as keyof T];
		if (!endpoint) {
			error(404, 'not found');
		}

		// Return a null body if no body is found or if the JSON decoding fails
		const body = await request.json().catch(() => null);

		return json(await endpoint(e, body));
	};
};

/**
 * Build the server-side API.
 *
 * @param options
 * @returns
 */
export const superAPI = <T extends ServerEndpointMap, RH extends RequestHandler = RequestHandler>(
	options: ServerOptions<T>
): ServerAPI<T, RH> => {
	const handler = createDefaultHandler(options) as ServerAPI<T, RH>;

	// add the SuperActions metadata to the handler function
	handler.actions = {
		...options,

		// Dirty hack, but it works. This makes types simpler and
		// makes ctrl+click in the client go to the correct place.
		actions: mapKeys(options.actions, () => true) as unknown as T
	};

	return handler;
};

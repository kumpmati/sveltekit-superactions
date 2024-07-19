import { error, text, type RequestHandler } from '@sveltejs/kit';
import { mapKeys } from './helpers.js';
import type { ServerActionMap, ServerAPI, ServerOptions } from './types.js';
import { parse, stringify } from 'devalue';

const createDefaultHandler = <Path extends string, T extends ServerActionMap>(
	serverOpts: ServerOptions<Path, T>
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
 * @param options (Optional) additional configuration
 */
export const endpoint = <
	Path extends string,
	T extends ServerActionMap,
	RH extends RequestHandler = RequestHandler
>(
	options: ServerOptions<Path, T>
): ServerAPI<Path, T, RH> => {
	const handler = createDefaultHandler(options) as ServerAPI<Path, T, RH>;

	// add the SuperActions metadata to the handler function
	handler.actions = {
		...options,

		// Dirty hack, but it works. This makes types simpler and
		// makes ctrl+click in the client go to the correct place.
		actions: mapKeys(options.actions, () => true) as unknown as T
	};

	return handler;
};

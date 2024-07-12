import { error, json } from '@sveltejs/kit';
import { mapKeys } from './helpers.js';
import type { ServerEndpointMap, ServerAPI, Options } from './types.js';

/**
 * Build the server-side API.
 *
 * @param options
 * @returns
 */
export const superAPI = <T extends ServerEndpointMap>(options: Options<T>): ServerAPI<T> => {
	const handler: ServerAPI<T> = async (e) => {
		const { request, url } = e;

		if (request.method !== 'POST') {
			error(405, 'method not allowed');
		}

		const key = url.searchParams.get('_superaction');
		if (!key || typeof key !== 'string') {
			error(400, 'invalid query parameters');
		}

		const endpoint = options.actions[key as keyof T];
		if (!endpoint) {
			error(404, 'not found');
		}

		const body = await request.json().catch(() => null);

		return json(await endpoint(e, body));
	};

	// add the SuperActions metadata to the handler function
	handler.actions = {
		...options,

		// dirty hack: make typescript believe we have the actual functions as
		// values, but make the values booleans to keep this serializable
		actions: mapKeys(options.actions, () => true) as unknown as T
	};

	return handler;
};

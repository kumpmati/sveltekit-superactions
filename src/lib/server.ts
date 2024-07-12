import { error, json, type RequestHandler } from '@sveltejs/kit';
import { mapKeys } from './helpers.js';
import type { ServerEndpointMap, ServerSuperActions } from './types.js';

/**
 * Builds a SuperApi handler and returns the necessary fields to instantiate the api in the client side.
 * @param endpoints
 * @param baseUrl
 * @returns
 */
export const superEndpoints = <T extends ServerEndpointMap>(
	baseUrl: string,
	endpoints: T
): ServerSuperActions<T> => {
	const handler: RequestHandler = async (e) => {
		const { request, url } = e;

		if (request.method !== 'POST') {
			error(405, 'method not allowed');
		}

		const key = url.searchParams.get('_superaction');
		if (!key || typeof key !== 'string') {
			error(400, 'invalid query parameters');
		}

		const endpoint = endpoints[key as keyof T];
		if (!endpoint) {
			error(404, 'not found');
		}

		const body = await request.json().catch(() => null);

		return json(await endpoint(body, e));
	};

	return {
		handler,
		api: {
			baseUrl,

			// dirty hack: make typescript believe we have the actual functions as
			// values, but make the values booleans to keep this serializable
			actions: mapKeys(endpoints, () => true) as unknown as T
		}
	};
};

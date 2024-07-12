import { error, json, type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';
import { mapKeys } from './helpers.js';
import type { ServerEndpointMap, ServerSuperApi } from './types.js';

const querySchema = z.object({
	_superaction: z.string().min(1)
});

/**
 * Builds a SuperApi handler and returns the necessary fields to instantiate the api in the client side.
 * @param endpoints
 * @param baseUrl
 * @returns
 */
export const superEndpoints = <T extends ServerEndpointMap>(
	baseUrl: string,
	endpoints: T
): ServerSuperApi<T> => {
	const handler: RequestHandler = async (e) => {
		const { request, url } = e;

		if (request.method !== 'POST') {
			error(405, 'method not allowed');
		}

		const params = querySchema.safeParse(Object.fromEntries(url.searchParams));
		if (!params.success) {
			error(400, 'invalid query params');
		}

		const endpoint = endpoints[params.data._superaction as keyof T];
		if (!endpoint) {
			error(404, 'not found');
		}

		const body = await request.json().catch(() => null);

		return json(await endpoint(e, body));
	};

	return {
		handler,
		actions: {
			baseUrl,

			// dirty hack: make typescript believe we have the actual functions as
			// values, but make the values booleans to keep this serializable
			endpoints: mapKeys(endpoints, () => true) as unknown as T
		}
	};
};

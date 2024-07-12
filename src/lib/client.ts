// Reexport your entry components here

import { error } from '@sveltejs/kit';
import { mapKeys } from './helpers.js';
import type { ClientSuperApi, ServerEndpointMap, ServerSuperActions } from './types.js';

/**
 * Default handler used to call the SuperActions
 * @param api
 * @param endpoint
 * @param body
 * @returns
 */
const defaultHandler = async <E extends ServerEndpointMap>(
	api: ServerSuperActions<E>['api'],
	endpoint: string,
	body: unknown
) => {
	const url = `${api.baseUrl}?_superaction=${endpoint}`;

	const response = await fetch(url, {
		method: 'POST',
		body: body ? JSON.stringify(body) : undefined
	});

	if (!response.ok) {
		error(response.status, await response.json());
	}

	return await response.json().catch(() => null);
};

/**
 * Creates client-side actions from the given superapi configuration
 * @param api
 * @returns
 */
export const superActions = <E extends ServerEndpointMap>(
	api: ServerSuperActions<E>['api']
): ClientSuperApi<E> => {
	return mapKeys(
		api.actions,
		(key) => (body: unknown) => defaultHandler(api, key as string, body)
	) as unknown as ClientSuperApi<E>;
};

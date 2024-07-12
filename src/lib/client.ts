// Reexport your entry components here

import { error } from '@sveltejs/kit';
import { mapKeys } from './helpers.js';
import type { ClientSuperApi, ServerEndpointMap, ServerSuperApi } from './types.js';

const defaultHandler = async <E extends ServerEndpointMap>(
	api: ServerSuperApi<E>['actions'],
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

	return await response.json();
};

/**
 * Creates client-side actions from the given superapi configuration
 * @param api
 * @returns
 */
export const superActions = <E extends ServerEndpointMap>(
	api: ServerSuperApi<E>['actions']
): ClientSuperApi<E> => {
	return mapKeys(api.endpoints, (key) => {
		const handler = (body: unknown) => defaultHandler(api, key as string, body);
		return handler;
	}) as unknown as ClientSuperApi<E>;
};

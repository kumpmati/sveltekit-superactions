// Reexport your entry components here

import { error } from '@sveltejs/kit';
import { mapKeys } from './helpers.js';
import type { ClientOptions, ClientAPI, ServerEndpointMap, ServerAPI } from './types.js';
import { goto } from '$app/navigation';

/**
 * Default handler used to call the SuperActions
 * @param api
 * @param endpoint
 * @param body
 * @returns
 */
const defaultHandler = async <E extends ServerEndpointMap>(
	api: ServerAPI<E>['actions'],
	opts: ClientOptions,
	endpoint: string,
	body: unknown
) => {
	const url = `${api.path}?_superaction=${endpoint}`;

	const response = await fetch(url, {
		method: 'POST',
		body: body ? JSON.stringify(body) : undefined
	});

	if (!response.ok) {
		error(response.status, await response.json());
	}

	if (response.redirected && opts.followRedirects) {
		goto(response.url);
	}

	return await response.json().catch(() => null);
};

/**
 * Creates action functions for each endpoint provided in the given Superactions API.
 * @param api Superactions API
 * @returns
 */
export const superActions = <E extends ServerEndpointMap>(
	api: ServerAPI<E>['actions'],
	opts: ClientOptions = {}
): ClientAPI<E> => {
	// map each key of the api to a client-side action using the default handler.
	return mapKeys(
		api.actions,
		(key) => (body: unknown) => defaultHandler(api, opts, key as string, body)
	) as unknown as ClientAPI<E>;
};

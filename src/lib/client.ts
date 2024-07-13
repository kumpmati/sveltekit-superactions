// Reexport your entry components here

import { error } from '@sveltejs/kit';
import { mapKeys } from './helpers.js';
import type {
	ClientOptions,
	ClientAPI,
	ServerEndpointMap,
	ServerAPI,
	ClientActionOptions
} from './types.js';
import { goto } from '$app/navigation';

const createDefaultHandler = <E extends ServerEndpointMap>(
	api: ServerAPI<E>['actions'],
	clientOpts: ClientOptions
) => {
	return async (endpoint: string, body: unknown, options?: ClientActionOptions) => {
		const url = `${api.path}?_sa=${endpoint}`;

		const fetchOptions: RequestInit = {
			method: 'POST',
			body: body ? JSON.stringify(body) : undefined
		};

		Object.assign(fetchOptions, options?.fetch);

		const response = await fetch(url, fetchOptions);

		if (!response.ok) {
			error(response.status, await response.json().catch(() => null));
		}

		if (response.redirected && (options?.followRedirects ?? clientOpts.followRedirects)) {
			await goto(response.url);
		}

		return await response.json().catch(() => null);
	};
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
	const handler = createDefaultHandler<E>(api, opts);

	// map each key of the api to a client-side action using the default handler.
	return mapKeys(
		api.actions,
		(key) => (body: unknown, opts?: ClientActionOptions) => handler(key as string, body, opts)
	) as unknown as ClientAPI<E>;
};

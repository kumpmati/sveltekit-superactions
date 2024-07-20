// Reexport your entry components here

import { error } from '@sveltejs/kit';
import type { ClientOptions, ClientActionOptions, InferClientAPI, ServerAPI } from './types.js';
import { goto } from '$app/navigation';
import { parse, stringify } from 'devalue';

const createDefaultHandler = (path: string, clientOpts: ClientOptions) => {
	return async (endpoint: string, body: unknown, options?: ClientActionOptions) => {
		const url = `${path}?_sa=${endpoint}`;

		const fetchOptions: RequestInit = {
			method: 'POST',
			body: body ? stringify(body) : undefined
		};

		// merge user-provided options with default options
		Object.assign(fetchOptions, options?.fetch);

		const response = await fetch(url, fetchOptions);

		if (!response.ok) {
			error(response.status, await response.json().catch(() => null));
		}

		if (response.redirected && (options?.followRedirects ?? clientOpts.followRedirects)) {
			await goto(response.url);
			return null;
		}

		return await response.text().then((d) => (d ? parse(d) : null));
	};
};

/**
 * Creates a client from the given API actions.
 *
 * @param path Relative URL where the endpoint is mounted
 * @param opts (Optional) extra configuration for the client
 */
export const superActions = <T extends ServerAPI>(
	path: string,
	opts: ClientOptions = {}
): InferClientAPI<T> => {
	const handler = createDefaultHandler(path, opts);

	// TODO: support nesting in the API
	return new Proxy({} as Record<string, unknown>, {
		get(_, key) {
			if (typeof key === 'symbol') throw new Error('action name cannot be a symbol');

			return (body: unknown, opts?: ClientActionOptions) => {
				return handler(key, body, opts);
			};
		}
	}) as InferClientAPI<T>;
};

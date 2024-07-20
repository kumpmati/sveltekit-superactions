// Reexport your entry components here

import { error } from '@sveltejs/kit';
import type { ClientOptions, ClientActionOptions, InferClient, Endpoint } from './types.js';
import { goto } from '$app/navigation';
import { parse, stringify } from 'devalue';
import { DeepProxy } from 'proxy-deep';

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
export const superActions = <T extends Endpoint>(
	path: string,
	opts: ClientOptions = {}
): InferClient<T> => {
	const handler = createDefaultHandler(path, opts);

	return new DeepProxy(async function () {} as unknown as InferClient<T>, {
		get(_, key) {
			if (typeof key === 'symbol') throw new Error('action name cannot be a symbol');

			return this.nest();
		},

		apply(target, thisArg, argArray) {
			return handler(this.path.join('.'), argArray[0], argArray?.[1]);
		}
	});
};

import { error, text, type RequestHandler } from '@sveltejs/kit';
import type { ActionMap, Endpoint, EndpointOptions, Middleware } from './types.js';
import { parse, stringify } from 'devalue';
import { getActionByPath } from './helpers.js';

const applyMiddleware = async (
	args: Parameters<Middleware>[0],
	middleware: Middleware[]
): Promise<void> => {
	for (const action of middleware) {
		await action(args);
	}
};

const createDefaultHandler = <T extends ActionMap>(
	actions: T,
	options: EndpointOptions = {}
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

		const action = getActionByPath(actions, (key ?? '').split('.'));
		if (!action) {
			error(404, 'not found');
		}

		const body = await request.text().then((d) => (d ? parse(d) : null));

		if (options?.pre?.length) {
			await applyMiddleware({ action: key, e, body }, options.pre);
		}

		const response = await action(e, body);

		if (options.post?.length) {
			await applyMiddleware({ action: key, e, body }, options.post);
		}

		return text(stringify(response));
	};
};

/**
 * Used to build an endpoint that holds one or more action(s),
 * where an action is a function that the client can call like a normal `async` function.
 *
 * It returns a request handler function that can be mounted as a POST handler.
 *
 * @param actions The functions to expose to the client.
 * @param options (Optional) additional configuration such as middleware.
 */
export const endpoint = <T extends ActionMap>(
	actions: T,
	options: EndpointOptions = {}
): Endpoint<T, RequestHandler> => {
	return createDefaultHandler(actions, options) as Endpoint<T, RequestHandler>;
};

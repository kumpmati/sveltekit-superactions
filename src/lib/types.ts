import type { RequestEvent, RequestHandler } from '@sveltejs/kit';

export type ServerOptions<T extends Record<string, unknown>> = {
	/**
	 * Relative path where the API is mounted. (e.g. `/api`)
	 */
	path: string;

	/**
	 * All the actions you want to expose to the client.
	 */
	actions: T;
};

export type ClientOptions = {
	/**
	 * If the response a redirect, navigate to the new URL (default: false)
	 */
	followRedirects?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ServerAction<Body = any, Res = any> = (e: RequestEvent, body: Body) => Promise<Res>;

export type ServerEndpointMap = Record<string, ServerAction>;

export type ServerAPI<T extends ServerEndpointMap> = RequestHandler & {
	/**
	 * SuperActions metadata. Passed to the `superActions` function as an argument when loading the actions on the client.
	 */
	actions: ServerOptions<T>;
};

export type ClientAction<T extends ServerAction, Body = Parameters<T>[1]> = (
	body: Body extends void ? void : Body
) => ReturnType<T>;

/**
 * Maps server endpoints to client actions
 */
export type ClientAPI<Endpoints extends ServerEndpointMap> = {
	[Key in keyof Endpoints]: ClientAction<Endpoints[Key]>;
};

/**
 * Infers the client-side API type from the given ServerAPI
 */
export type InferClientAPI<T extends ServerAPI<Record<string, ServerAction>>> = ClientAPI<
	T['actions']['actions']
>;

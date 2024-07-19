import type { RequestEvent, RequestHandler } from '@sveltejs/kit';

export type ServerOptions<
	Path extends string = string,
	T extends Record<string, unknown> = Record<string, unknown>
> = {
	/**
	 * Relative path where the API is mounted. (e.g. `/api`)
	 */
	path: Path;

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

/**
 * Extra configuration for the current action call.
 */
export type ClientActionOptions = {
	/**
	 * Extra options to pass to the fetch function.
	 * This will be merged with existing options provided by Superactions.
	 */
	fetch?: RequestInit;

	/**
	 * If the response a redirect, navigate to the new URL (default: undefined).
	 * When defined, this overrides the behaviour set in the client options.
	 */
	followRedirects?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ServerAction<Body = any, Res = any> = (e: RequestEvent, body: Body) => Promise<Res>;

export type ServerActionMap = Record<string, ServerAction>;

export type ServerAPI<
	Path extends string = string,
	T extends ServerActionMap = ServerActionMap,
	RH extends RequestHandler = RequestHandler
> = RH & {
	/**
	 * SuperActions metadata. Passed to the `superActions` function as an argument when loading the actions on the client.
	 */
	actions: ServerOptions<Path, T>;
};

export type ClientAction<T extends ServerAction, Body = Parameters<T>[1]> = (
	body: Body extends void ? void : Body,
	opts?: ClientActionOptions
) => ReturnType<T>;

/**
 * Transforms a map of server actions to a map of client actions
 */
export type ClientAPI<Endpoints extends ServerActionMap> = {
	[Key in keyof Endpoints]: ClientAction<Endpoints[Key]>;
};

/**
 * Infers the client-side API type from the given ServerAPI
 */
export type InferClientAPI<T extends ServerAPI> = ClientAPI<T['actions']['actions']>;

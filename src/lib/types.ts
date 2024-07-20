import type { RequestEvent, RequestHandler } from '@sveltejs/kit';

const superactionsSymbol = Symbol('superactions');

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
export type Action<Body = any, Res = any> = (e: RequestEvent, body: Body) => Promise<Res>;

export type ActionMap = {
	[Key: string]: Action | ActionMap;
};

export type Endpoint<
	T extends ActionMap = ActionMap,
	RH extends RequestHandler = RequestHandler
> = RH & {
	/**
	 * SuperActions server types (does not actually exist as a value).
	 */
	[superactionsSymbol]: T;
};

export type ClientAction<T extends Action, Body = Parameters<T>[1]> = (
	body: Body extends void ? void : Body,
	opts?: ClientActionOptions
) => ReturnType<T>;

/**
 * Transforms a map of server actions to a map of client actions
 */
export type Client<Endpoints extends ActionMap> = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[Key in keyof Endpoints]: Endpoints[Key] extends ActionMap
		? Client<Endpoints[Key]>
		: Endpoints[Key] extends Action
			? ClientAction<Endpoints[Key]>
			: unknown;
};

/**
 * Infers the client-side API type from the given ServerAPI
 */
export type InferClient<T extends Endpoint> = Client<T[typeof superactionsSymbol]>;

import type { RequestEvent, RequestHandler } from '@sveltejs/kit';

declare const superactionsSymbol: unique symbol;

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
	T extends ServerActionMap = ServerActionMap,
	RH extends RequestHandler = RequestHandler
> = RH & {
	/**
	 * SuperActions server types (does not actually exist as a value).
	 */
	[superactionsSymbol]: T;
};

export type ClientAction<T extends ServerAction, Body = Parameters<T>[1]> = (
	body: Body extends void ? void : Body,
	opts?: ClientActionOptions
) => ReturnType<T>;

/**
 * Transforms a map of server actions to a map of client actions
 */
export type ClientAPI<Endpoints extends ServerActionMap> = {
	[Key in keyof Endpoints]: Endpoints[Key] extends ServerAction
		? ClientAction<Endpoints[Key]>
		: unknown;
};

/**
 * Infers the client-side API type from the given ServerAPI
 */
export type InferClientAPI<T extends ServerAPI> = ClientAPI<T[typeof superactionsSymbol]>;

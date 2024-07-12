import type { MaybePromise, RequestEvent, RequestHandler } from '@sveltejs/kit';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ServerAction<Body = any, Res = any> = (
	body: Body,
	e: RequestEvent
) => MaybePromise<Res>;

export type ServerEndpointMap = Record<string, ServerAction>;

export type ServerSuperActions<T extends ServerEndpointMap> = {
	handler: RequestHandler;

	api: {
		// map of available server actions
		actions: T;
		baseUrl: string;
	};
};

export type ClientEndpoint<T extends ServerAction, Body = Parameters<T>[0]> = (
	body: Body extends void ? void : Body
) => ReturnType<T>;

// Removes the RequestEvent argument from each endpoint
export type ClientSuperApi<Endpoints extends ServerEndpointMap> = {
	[Key in keyof Endpoints]: ClientEndpoint<Endpoints[Key]>;
};

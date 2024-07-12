import type { MaybePromise, RequestEvent, RequestHandler } from '@sveltejs/kit';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ServerEndpoint<Body = any, Res = any> = (
	e: RequestEvent,
	body: Body
) => MaybePromise<Res>;

export type ServerEndpointMap = Record<string, ServerEndpoint>;

export type ServerSuperApi<T extends Record<string, unknown>> = {
	handler: RequestHandler;

	actions: {
		// map of endpoints safe to serialize
		endpoints: T;
		baseUrl: string;
	};
};

export type ClientEndpoint<T extends ServerEndpoint> = (
	body: Parameters<T>[1] extends void ? void : Parameters<T>[1]
) => ReturnType<T>;

// Removes the RequestEvent argument from each endpoint
export type ClientSuperApi<Endpoints extends ServerEndpointMap> = {
	[Key in keyof Endpoints]: ClientEndpoint<Endpoints[Key]>;
};

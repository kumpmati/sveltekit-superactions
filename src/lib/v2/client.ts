import type { InferClientAPI, ServerAPI } from '$lib/types.js';

export const createApi = <T extends ServerAPI>(path: T['actions']['path']): InferClientAPI<T> => {
	return new Proxy(
		{},
		{
			get(target, prop, receiver) {
				if (typeof prop === 'symbol') throw new Error('action name cannot be a symbol');

				console.log(target, prop, receiver);

				return () => fetch(`${path}?_sa=${prop}`, { method: 'POST' });
			}
		}
	) as InferClientAPI<T>;
};

import type { Action } from '$lib/types.js';
import { error } from '@sveltejs/kit';
import type { ZodType } from 'zod';

/**
 * Returns a new ServerAction that validates the incoming request body using Zod
 * @param schema Zod schema
 * @param action ServerAction
 * @returns
 */
export const zod = <Body = unknown, Res = unknown>(
	schema: ZodType<Body>,
	action: Action<Body, Res>
): Action<Body, Res> => {
	return async (e, rawBody) => {
		const parsed = schema.safeParse(rawBody);
		if (!parsed.success) {
			error(400, parsed.error);
		}

		return action(e, parsed.data);
	};
};

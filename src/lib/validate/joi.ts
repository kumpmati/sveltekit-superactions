import type { ServerAction } from '$lib/types.js';
import { error } from '@sveltejs/kit';
import type { Schema } from 'joi';

/**
 * Returns a new ServerAction that validates the incoming request body using Joi
 * @param schema Joi schema
 * @param action ServerAction
 * @returns
 */
export const joi = <Body = unknown, Res = unknown>(
	schema: Schema<Body>,
	action: ServerAction<Body, Res>
): ServerAction<Body, Res> => {
	return async (e, rawBody) => {
		const parsed = schema.validate(rawBody);
		if (parsed.error) {
			error(400, parsed.error);
		}

		return action(e, parsed.value);
	};
};

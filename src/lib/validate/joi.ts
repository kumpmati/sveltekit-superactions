import type { Action } from '$lib/types.js';
import { error } from '@sveltejs/kit';
import type { Schema } from 'joi';

/**
 * Returns a new Action that validates the incoming request body using Joi
 * @param schema Joi schema
 * @param action Action
 * @returns
 */
export const joi = <Body = unknown, Res = unknown>(
	schema: Schema<Body>,
	action: Action<Body, Res>
): Action<Body, Res> => {
	return async (e, rawBody) => {
		const parsed = schema.validate(rawBody);
		if (parsed.error) {
			error(400, parsed.error);
		}

		return action(e, parsed.value);
	};
};

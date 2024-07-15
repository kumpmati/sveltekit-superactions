import type { PageServerLoad } from './$types.js';
import { POST as todoAPI } from './api/+server.js';
import { POST as spreadAPI } from './api/spread/+server.js';

export const load = (async () => {
	return {
		todoAPI: todoAPI.actions,
		spreadAPI: spreadAPI.actions
	};
}) satisfies PageServerLoad;

import type { PageServerLoad } from './$types.js';
import { POST as todoAPI } from './api/+server.js';

export const load = (async () => {
	return {
		todoAPI: todoAPI.actions
	};
}) satisfies PageServerLoad;

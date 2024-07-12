import type { PageServerLoad } from './$types.js';
import { todoAPI } from './api/index.js';

export const load = (async () => {
	return {
		todoActions: todoAPI.api
	};
}) satisfies PageServerLoad;

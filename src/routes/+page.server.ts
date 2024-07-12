import type { PageServerLoad } from './$types.js';
import { taskApi } from './api/index.js';

export const load = (async () => {
	return {
		taskActions: taskApi.actions
	};
}) satisfies PageServerLoad;

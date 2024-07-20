import { endpoint } from '$lib/server.js';
import * as actions from './actions.js';

export const POST = endpoint({
	path: '/api/spread',
	actions
});

export type SpreadAPI = typeof POST;

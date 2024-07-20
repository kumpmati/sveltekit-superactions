import { endpoint } from '$lib/server.js';
import * as actions from './actions.js';

export const POST = endpoint(actions);

export type SpreadAPI = typeof POST;

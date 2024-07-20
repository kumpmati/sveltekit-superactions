import { zod } from '$lib/index.js';
import { endpoint } from '$lib/server.js';
import { z } from 'zod';

export const POST = endpoint({
	utils: {
		beanify: async (_, name: string) => 'bean-' + name
	},

	second: {
		foo: zod(z.number(), async (e, num) => 'hello world times ' + num),

		third: {
			bar: async () => 'very nested'
		}
	}
});

export type NestedAPI = typeof POST;

// type A = NestedAPI[typeof superactionsSymbol]['second'];

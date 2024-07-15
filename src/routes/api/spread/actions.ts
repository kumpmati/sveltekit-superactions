import { zod } from '$lib/index.js';
import { z } from 'zod';

export const greet = zod(z.string(), async (e, name) => {
	return { greeting: `Hello, ${name}` };
});

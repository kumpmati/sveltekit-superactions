import type { Action, ActionMap } from './types.js';

/**
 * Helper function that creates a new object with the same keys but different values
 * @param val Original object
 * @param map Function that returns a value for each key
 */
export const mapKeys = <T extends Record<string, unknown>, V>(
	val: T,
	map: (key: keyof T) => V
): Record<keyof T, V> => {
	const obj = {} as Record<keyof T, V>;

	for (const key in val) {
		obj[key] = map(key);
	}

	return obj;
};

/**
 * Returns an arbitrarily nested action from the given endpoint using the given path.
 *
 * @param endpoint Endpoint to traverse
 * @param path Array of properties in the endpoint
 * @returns Action or null if none match the given path
 */
export const getActionByPath = <T extends ActionMap>(
	endpoint: T,
	path: string[]
): Action | null => {
	if (!path.length) return null;

	const part = path[0];

	if (typeof endpoint[part] === 'object') return getActionByPath(endpoint[part], path.slice(1));
	if (typeof endpoint[part] === 'function') return endpoint[part];

	return null;
};

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

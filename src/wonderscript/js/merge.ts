export function merge<K = unknown, V = unknown>(
    ...maps: Map<unknown, unknown>[]
): Map<K, V> {
    const merged = new Map();

    for (let i = 0; i < maps.length; i++) {
        const m = maps[i];
        if (m == null) continue; // ignore nullish values

        for (let entry of m) {
            merged.set(entry[0], entry[1]);
        }
    }

    return merged;
}

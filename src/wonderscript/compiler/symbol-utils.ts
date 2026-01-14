export function isInternable(val: string): boolean {
    return /^[a-zA-Z_$]+[a-zA-Z0-9_$]*$/.test(val);
}

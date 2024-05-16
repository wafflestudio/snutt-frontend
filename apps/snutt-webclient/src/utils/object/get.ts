export function get(obj: unknown, path: (number | string)[]): unknown {
  try {
    if (path.length === 0) return obj;

    if (obj == null || typeof obj !== 'object') return undefined;

    // eslint-disable-next-line
    // @ts-ignore
    return get(obj[path[0]], path.slice(1));
  } catch (err) {
    return undefined;
  }
}

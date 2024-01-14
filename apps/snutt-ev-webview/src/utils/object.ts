export const snakeToCamel = <T>(obj: object): T => {
  if (Array.isArray(obj)) {
    return obj.map((v) => snakeToCamel(v)) as T;
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const camelKey = key.replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''));
      return { ...acc, [camelKey]: snakeToCamel(value) };
    }, {}) as T;
  }

  return obj;
};

export const u = {
  array: (value: unknown): Promise<unknown>[] => {
    if (!Array.isArray(value)) throw new Error();

    return value.map((v) => Promise.resolve(v));
  },

  object: <F extends readonly string[]>(value: unknown, ...fields: F): Promise<Record<F[number], unknown>> => {
    if (typeof value !== 'object' || value === null) throw new Error();

    return Promise.resolve(
      Object.fromEntries(
        fields.map((field) => {
          const valueObject = value as Record<string, unknown>;
          if (!(field in valueObject)) throw new Error();
          return [field, Promise.resolve(valueObject[field])];
        }),
      ) as Record<F[number], unknown>,
    );
  },

  number: (value: unknown): number => {
    if (typeof value !== 'number') throw new Error();

    return value;
  },

  string: (value: unknown): string => {
    if (typeof value !== 'string') throw new Error();

    return value;
  },
};

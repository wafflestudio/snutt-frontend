export type WithInternalId<T> = T & { __id__: string };
export type WithoutInternalId<T> = Omit<T, '__id__'>;

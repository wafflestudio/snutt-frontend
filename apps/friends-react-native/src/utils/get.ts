export const get = (obj: unknown, path: string[]) => {
  try {
    // @ts-expect-error error 가 발생하게 해서 catch 에서 잡습니다.
    return path.reduce((acc, key) => acc[key], obj);
  } catch (err) {
    return undefined;
  }
};

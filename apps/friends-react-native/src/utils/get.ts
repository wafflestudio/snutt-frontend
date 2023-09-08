export const get = (obj: unknown, path: string[]) => {
  try {
    // 의도적으로 ts-ignore을 사용합니다.
    // @ts-ignore
    return path.reduce((acc, key) => acc[key], obj);
  } catch (err) {
    return undefined;
  }
};

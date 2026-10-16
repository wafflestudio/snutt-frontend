import { useEffect, useState } from 'react';

/** value 가 delay(ms) 동안 바뀌지 않으면 그 값을 돌려준다. 그 전에는 이전 값을 돌려준다 (검색어 입력) */
export function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

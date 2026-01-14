import { useState, useCallback } from 'react';

export interface UseExampleReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export function useExample(initialValue = 0): UseExampleReturn {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount((prev) => prev - 1);
  }, []);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  return { count, increment, decrement, reset };
}

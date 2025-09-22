import React, { useState, useEffect } from 'react';

export function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error reading localStorage key “${key}”:`, error.message);
      } else {
        console.error(`An unknown error occurred when reading localStorage key “${key}”:`, error);
      }
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      const valueToStore = typeof storedValue === 'function' ? storedValue(storedValue) : storedValue;
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error setting localStorage key “${key}”:`, error.message);
      } else {
        console.error(`An unknown error occurred when setting localStorage key “${key}”:`, error);
      }
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
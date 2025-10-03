import { useCallback, useState } from 'react';
import { createPersistentStorage } from '../services/persistent-storage';

/**
 * A React hook that combines persistent storage with useState
 * Automatically syncs state with localStorage and provides a setter that persists changes
 *
 * @param key - The localStorage key for persistence
 * @param defaultValue - The default value if nothing is stored
 * @returns [value, setValue] - Similar to useState but with persistence
 */
export function usePersistentState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const persistentStorage = createPersistentStorage(key, defaultValue);
  const [state, setState] = useState<T>(persistentStorage.current);

  const setValue = useCallback((newValue: T) => {
    setState(newValue);
    persistentStorage.current = newValue;
  }, [persistentStorage]);

  return [state, setValue];
}
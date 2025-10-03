/**
 * A value that is stored in localStorage, so that it persists across page reloads.
 */
type PersistentValue<T> = {
    current: T;
}

export function createPersistentStorage<T>(key: string, defaultValue: T): PersistentValue<T> {
  return {
    get current() {
      if (typeof window === 'undefined') {
        return defaultValue;
      }
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    },

    set current(value: T) {
      if (typeof window === 'undefined') {
        return;
      }
      localStorage.setItem(key, JSON.stringify(value));
    },
  };
}
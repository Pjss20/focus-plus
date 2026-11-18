import { useState } from 'react';
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : defaultValue; }
    catch { return defaultValue; }
  });
  const set = (val) => { setValue(val); localStorage.setItem(key, JSON.stringify(val)); };
  return [value, set];
}

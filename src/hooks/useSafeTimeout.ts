import { useEffect, useRef } from 'react';

/**
 * setTimeout que se cancela automáticamente al desmontar el componente.
 * Evita actualizaciones de estado y navegaciones después de desmontar.
 */
export function useSafeTimeout() {
  const timeoutIds = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timeoutIds.current.forEach((id) => window.clearTimeout(id));
      timeoutIds.current = [];
    };
  }, []);

  return (callback: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      timeoutIds.current = timeoutIds.current.filter((timeoutId) => timeoutId !== id);
      callback();
    }, delay);
    timeoutIds.current.push(id);
    return id;
  };
}

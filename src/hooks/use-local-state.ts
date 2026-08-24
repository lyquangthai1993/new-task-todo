import { useCallback, useEffect, useRef, useState } from "react";
import type { Storage } from "../utils/create-storage";

type UseLocalStateResult<T> = [T, (next: T) => void, boolean];

export function useLocalState<T>(
  storage: Storage<T>,
  initialValue: T,
  transformOnLoad?: (loaded: T) => T,
): UseLocalStateResult<T> {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const storageRef = useRef(storage);

  useEffect(() => {
    let isMounted = true;

    storageRef.current.load().then((loaded) => {
      if (!isMounted) return;

      const nextValue = transformOnLoad ? transformOnLoad(loaded) : loaded;
      setValue(nextValue);
      setIsLoading(false);
    });

    // Đồng bộ khi instance khác (widget khác) cùng key save dữ liệu.
    const unsubscribe = storageRef.current.subscribe((next) => {
      if (isMounted) setValue(next);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = useCallback((next: T): void => {
    setValue(next);
    storageRef.current.save(next);
  }, []);

  return [value, persist, isLoading];
}

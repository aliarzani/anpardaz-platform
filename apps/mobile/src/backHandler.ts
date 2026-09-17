import { useRef, useEffect } from "react";

export const _ANP_BACK: Array<() => void> = [];

export function useBackHandler(fn: () => void): void {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    const h = () => ref.current();
    _ANP_BACK.push(h);
    return () => {
      const i = _ANP_BACK.lastIndexOf(h);
      if (i >= 0) _ANP_BACK.splice(i, 1);
    };
  }, []);
}

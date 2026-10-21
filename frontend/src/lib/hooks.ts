import { useEffect, useRef, useState } from "react";

export interface ResourceState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useResource<T>(
  execute: (signal: AbortSignal) => Promise<T>,
  deps: unknown[] = [],
): ResourceState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(0);
  const executeRef = useRef(execute);
  executeRef.current = execute;

  useEffect(() => {
    const id = ++latest.current;
    const controller = new AbortController();
    let mounted = true;
    setLoading(true);
    setError(null);
    executeRef.current(controller.signal)
      .then((result) => {
        if (mounted && id === latest.current) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!(e instanceof DOMException) || e.name !== "AbortError") {
          if (mounted && id === latest.current) {
            setError(e instanceof Error ? e.message : String(e));
            setLoading(false);
          }
        }
      });
    return () => {
      mounted = false;
      controller.abort();
    };
  }, deps);

  return { data, loading, error };
}

export interface MutationState {
  loading: boolean;
  error: string | null;
}

export function useMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (fn: () => Promise<unknown>): Promise<unknown | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      setLoading(false);
      return result;
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
      setLoading(false);
      return null;
    }
  };

  const clear = () => setError(null);
  return { run, loading, error, clear };
}
import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

/**
 * Hook para debounce de valores
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook para throttle de funções
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef<number>(Date.now());

  return useCallback(
    ((...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
};

/**
 * Hook para memoização de cálculos pesados
 */
export const useExpensiveCalculation = <T>(
  calculation: () => T,
  dependencies: React.DependencyList
): T => {
  return useMemo(() => {
    console.log('Recalculando valor caro...');
    return calculation();
  }, dependencies);
};

/**
 * Hook para observar mudanças de tamanho de elemento
 */
export const useResizeObserver = (
  callback: (entry: ResizeObserverEntry) => void
) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      callback(entries[0]);
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [callback]);

  return ref;
};

/**
 * Hook para intersection observer (lazy loading, infinite scroll)
 */
export const useIntersectionObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver((entries) => {
      callback(entries[0]);
    }, options);

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [callback, options]);

  return ref;
};

/**
 * Hook para virtualização de listas grandes
 */
export const useVirtualization = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    ...visibleItems,
    handleScroll
  };
};

/**
 * Utilitários para otimização de re-renders
 */
export const shallowEqual = (obj1: any, obj2: any): boolean => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
};

/**
 * Hook para memoização de objetos
 */
export const useObjectMemo = <T extends Record<string, any>>(
  obj: T,
  deps?: React.DependencyList
): T => {
  return useMemo(() => obj, deps || Object.values(obj));
};

/**
 * Hook para callbacks estáveis
 */
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T
): T => {
  const callbackRef = useRef<T>(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback(
    ((...args: Parameters<T>) => callbackRef.current(...args)) as T,
    []
  );
};

/**
 * Hook para lazy loading de componentes
 */
export const useLazyComponent = <T>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  const [Component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    importFn()
      .then((module) => {
        setComponent(() => module.default);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [importFn]);

  return { Component, loading, error, Fallback: fallback };
};

/**
 * Performance monitoring
 */
export const measurePerformance = (name: string, fn: () => void) => {
  if (process.env.NODE_ENV === 'development') {
    performance.mark(`${name}-start`);
    fn();
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name)[0];
    console.log(`${name} took ${measure.duration}ms`);
  } else {
    fn();
  }
};

/**
 * Hook para cache de dados
 */
export const useCache = <T>(key: string, fetcher: () => Promise<T>, ttl = 5 * 60 * 1000) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const cachedData = localStorage.getItem(`cache_${key}`);
    const cachedTime = localStorage.getItem(`cache_time_${key}`);

    if (cachedData && cachedTime) {
      const age = Date.now() - parseInt(cachedTime);
      if (age < ttl) {
        setData(JSON.parse(cachedData));
        setLoading(false);
        return;
      }
    }

    fetcher()
      .then((result) => {
        setData(result);
        localStorage.setItem(`cache_${key}`, JSON.stringify(result));
        localStorage.setItem(`cache_time_${key}`, Date.now().toString());
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [key, fetcher, ttl]);

  return { data, loading, error };
};


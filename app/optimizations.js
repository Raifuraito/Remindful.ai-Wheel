import React, { useMemo, useCallback, useState, useEffect } from 'react';

// ── ERROR BOUNDARY ──────────────────────────────────────────────────────────
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DevWheel Error:', error, errorInfo);
  }

  render() {
    if(this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#050810',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: '#fff',
          padding: 20,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ margin: '0 0 12px', fontSize: 24 }}>Something went wrong</h1>
          <p style={{ color: '#999', marginBottom: 20 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: '#4ECDC4',
              border: 'none',
              borderRadius: 8,
              color: '#111',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 16,
            }}
          >
            🔄 Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ── DEBOUNCE HOOK ───────────────────────────────────────────────────────────
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// ── LAZY LOAD HOOK ──────────────────────────────────────────────────────────
export function useLazyLoad(enabled = true) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (fn) => {
    if(!enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await fn();
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  }, [enabled]);

  return { load, isLoading, error };
}

// ── VIEWPORT VISIBILITY HOOK ────────────────────────────────────────────────
export function useIsVisible(ref) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    if(ref.current) observer.observe(ref.current);

    return () => {
      if(ref.current) observer.unobserve(ref.current);
    };
  }, [ref]);

  return isVisible;
}

// ── MEMOIZED PLAYER STATS ────────────────────────────────────────────────────
export function useMemoizedStats(player, items, admin) {
  return useMemo(() => {
    const equippedPet = items.find(x => x.id === player.equippedPet);
    const ownedItemCount = (player.ownedItems || []).length;
    const hasLeaderboardBonus = ownedItemCount >= (admin.lbMinItems || 15);

    let coinMult = 1;
    if(hasLeaderboardBonus) coinMult *= (admin.lbMult || 1.25);
    if(equippedPet?.effect === 'coins_mult') coinMult *= (equippedPet.effectVal || 1);

    const streakBonus = player.streak > 0 ? Math.floor(player.streak / 7) * (admin.streakBonus || 1) : 0;

    return {
      equippedPet,
      ownedItemCount,
      hasLeaderboardBonus,
      coinMult,
      streakBonus,
      totalTickets: (player.tickets || 0) + streakBonus,
    };
  }, [player.equippedPet, player.ownedItems, player.streak, items, admin]);
}

// ── DEBOUNCED STATE SAVER ───────────────────────────────────────────────────
export function useDebouncedSave(state, key, db, delay = 1000) {
  const debouncedState = useDebounce(state, delay);

  useEffect(() => {
    db.set(key, debouncedState);
  }, [debouncedState, key, db]);
}

// ── LOCAL STORAGE CACHE ──────────────────────────────────────────────────────
export function useLocalStorageCache(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setCachedValue = useCallback((newValue) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (err) {
      console.error(`Error caching ${key}:`, err);
    }
  }, [key, value]);

  return [value, setCachedValue];
}

// ── VALIDATION HELPERS ──────────────────────────────────────────────────────
export const validators = {
  isValidEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  isValidNumber: (num, min = -Infinity, max = Infinity) => !isNaN(num) && num >= min && num <= max,
  isValidString: (str, minLen = 0, maxLen = Infinity) => typeof str === 'string' && str.length >= minLen && str.length <= maxLen,
  isValidColor: (color) => /^#[0-9A-F]{6}$/i.test(color),
  isValidTime: (time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time),
};

// ── SAFE STATE UPDATE ───────────────────────────────────────────────────────
export function useSafeState(initialValue) {
  const [value, setValue] = useState(initialValue);
  const isMountedRef = React.useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const setSafeValue = useCallback((newValue) => {
    if(isMountedRef.current) {
      setValue(newValue);
    }
  }, []);

  return [value, setSafeValue];
}

// ── THROTTLE HOOK ───────────────────────────────────────────────────────────
export function useThrottle(callback, delay = 500) {
  const lastRun = React.useRef(Date.now());

  return useCallback((...args) => {
    const now = Date.now();
    if(now - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = now;
    }
  }, [callback, delay]);
}

// ── PREVIOUS VALUE HOOK ─────────────────────────────────────────────────────
export function usePrevious(value) {
  const ref = React.useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// ── ASYNC DATA LOADER ───────────────────────────────────────────────────────
export function useAsyncData(asyncFunction, dependencies = []) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const result = await asyncFunction();
        if(isMounted) {
          setState({ data: result, loading: false, error: null });
        }
      } catch (err) {
        if(isMounted) {
          setState({ data: null, loading: false, error: err.message });
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return state;
}

// ── PERFORMANCE MONITOR (dev only) ──────────────────────────────────────────
export function usePerformanceMonitor(componentName) {
  useEffect(() => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      if(duration > 16) { // More than one frame
        console.warn(`⚠️ ${componentName} took ${duration.toFixed(2)}ms to render`);
      }
    };
  }, [componentName]);
}

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'tiveni-operator-theme-mode';
const ThemeModeContext = createContext(null);

// Defaults to the device's OS/browser preference on first use, then remembers whatever was
// picked from then on - wrapped in try/catch since localStorage can throw (private browsing,
// disabled storage) and matchMedia isn't guaranteed in every environment either.
function getInitialMode() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // ignore - fall through to system preference
  }
  try {
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  } catch {
    // ignore - default to light
  }
  return 'light';
}

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore - just won't persist across reloads
    }
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      toggleMode: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')),
      setMode,
    }),
    [mode]
  );

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within a ThemeModeProvider');
  return ctx;
}

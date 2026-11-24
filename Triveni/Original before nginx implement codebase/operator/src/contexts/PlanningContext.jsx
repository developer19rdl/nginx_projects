import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import dayjs from 'dayjs';

const PlanningContext = createContext(null);
const STORAGE_KEY = 'operator-planning-context';

/** Shared Machine + Date + Shift selection, persisted to localStorage so the choice made on the
 * Home dashboard carries over to Machine Planning (and survives a page reload) instead of being
 * asked twice. */
export function PlanningProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return { date: saved.date || dayjs().format('YYYY-MM-DD'), machineId: saved.machineId || '', shiftId: saved.shiftId || '' };
    } catch {
      return { date: dayjs().format('YYYY-MM-DD'), machineId: '', shiftId: '' };
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const update = (patch) => setState((s) => ({ ...s, ...patch }));

  const value = useMemo(() => ({ ...state, update }), [state]);

  return <PlanningContext.Provider value={value}>{children}</PlanningContext.Provider>;
}

export function usePlanningContext() {
  const ctx = useContext(PlanningContext);
  if (!ctx) throw new Error('usePlanningContext must be used within PlanningProvider');
  return ctx;
}

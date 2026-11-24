import { useState, useEffect } from "react";

export const CYCLE_MS = 2500; // how long each value is shown before advancing
export const BLINK_MS = 220;  // fade-out duration before the value swaps underneath it

const currentTick = () => Math.floor(Date.now() / CYCLE_MS);

// A single wall-clock-derived "tick", shared by every Cycling Badge on the
// page (and by ScadaDynamicTable's column headers, which highlight whichever
// word matches what's currently showing) — deriving the tick from Date.now()
// instead of each instance keeping its own local counter means any two of
// them read at the same moment always agree, so every badge (and the header
// that names it) rotates in lockstep with no shared state/context needed.
// Re-syncs against the actual wall-clock boundary each time (a plain
// setInterval(CYCLE_MS) would slowly drift out of phase across instances).
export function useGlobalCycleTick() {
    const [tick, setTick] = useState(currentTick());
    useEffect(() => {
        let timeoutId;
        const scheduleNext = () => {
            const msIntoCycle = Date.now() % CYCLE_MS;
            timeoutId = setTimeout(() => {
                setTick(currentTick());
                scheduleNext();
            }, CYCLE_MS - msIntoCycle);
        };
        scheduleNext();
        return () => clearTimeout(timeoutId);
    }, []);
    return tick;
}

// Cycles through a list of sensors (style.combinedSensors — the same
// {deviceId, slaveId, tagId, tagName, deviceName} shape the "Analytics"
// multi-sensor chart tab already collects), one at a time, dimming briefly
// ("blink") on each change — shared by CyclingBadgeWidget (floor-image
// marker), ScadaDynamicTable's MarkerCell/CellCyclingBadge, and any other
// cycling badge, so they all look the same AND rotate in sync with each
// other (see useGlobalCycleTick above) wherever they're placed.
// Cycle order = selection order (the order sensors were checked in the
// Analytics tab / "+ Add Sensor"), so "Temperature, then Humidity, then
// CO2" is just the order they were picked in.
export default function useCyclingSensor(sensors) {
    const tick  = useGlobalCycleTick();
    const count = sensors?.length || 0;
    const idx     = count ? tick % count : 0;
    const current = count ? sensors[idx] : null;

    // Brief fade right after each shared tick so the value swap doesn't look
    // like an abrupt jump cut. Re-runs whenever the shared tick advances, so
    // the blink itself stays in sync across every instance too.
    const [visible, setVisible] = useState(true);
    useEffect(() => {
        if (count <= 1) { setVisible(true); return undefined; }
        setVisible(false);
        const id = setTimeout(() => setVisible(true), BLINK_MS);
        return () => clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tick, count]);

    return { current, visible };
}

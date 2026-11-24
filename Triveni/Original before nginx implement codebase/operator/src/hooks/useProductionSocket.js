import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../lib/socket';

/**
 * Live replacement for polling on the Machine Planning screen. Joins the WebSocket room for one
 * machine and, on every `production:update` event, patches the matching row straight into the
 * `['by-machine', machineId, shiftId, scheduleDate]` query cache that useByMachine already reads -
 * no refetch, no polling, the table just re-renders with the new data. An update for a row that
 * isn't part of the currently loaded Date/Shift filter is ignored (nothing to patch).
 *
 * Room membership is rejoined on every 'connect' event, including reconnects - socket.io rooms
 * don't survive a transport-level reconnect, so without this a network blip would silently stop
 * delivering updates until the page was reloaded.
 */
export function useProductionSocket({ machineId, shiftId, scheduleDate }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!machineId) return undefined;

    const socket = getSocket();
    const queryKey = ['by-machine', machineId, shiftId, scheduleDate];

    const join = () => socket.emit('join-machine', machineId);

    const handleUpdate = (row) => {
      queryClient.setQueryData(queryKey, (rows) => {
        if (!rows) return rows;
        const idx = rows.findIndex((r) => r.id === row.id);
        if (idx === -1) return rows;
        const next = [...rows];
        next[idx] = row;
        return next;
      });
    };

    // eslint-disable-next-line no-console
    const handleDisconnect = (reason) => console.info('Production WebSocket disconnected:', reason);
    // eslint-disable-next-line no-console
    const handleServerError = (err) => console.warn('Production WebSocket error:', err.message);

    socket.on('connect', join);
    socket.on('disconnect', handleDisconnect);
    socket.on('production:update', handleUpdate);
    socket.on('error', handleServerError);

    if (socket.connected) join();

    return () => {
      socket.emit('leave-machine', machineId);
      socket.off('connect', join);
      socket.off('disconnect', handleDisconnect);
      socket.off('production:update', handleUpdate);
      socket.off('error', handleServerError);
    };
  }, [machineId, shiftId, scheduleDate, queryClient]);
}

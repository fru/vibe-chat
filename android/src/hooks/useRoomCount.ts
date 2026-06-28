import { useEffect, useState } from 'react';

import { signalR } from '@/services/SignalRService';

/**
 * Subscribe to the live unread count for a single room.
 *
 * Mirrors `frontend/src/app/components-chat/data-chat-menu-item.ts`:
 * the SignalR service emits the latest count on subscribe and on every
 * `MessageCounts` push from the hub.
 */
export function useRoomCount(room: string): number {
  const [count, setCount] = useState<number>(() => signalR.getCount(room));

  useEffect(() => {
    const unsubscribe = signalR.onCounts(room, (next) => setCount(next));
    return unsubscribe;
  }, [room]);

  return count;
}

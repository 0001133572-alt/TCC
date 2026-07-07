import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../services/supabase';

export function useRealtimeSync(tables, onChanges) {
  const channelRef = useRef(null);
  const onChangesRef = useRef(onChanges);
  onChangesRef.current = onChanges;

  useEffect(() => {
    if (!tables || tables.length === 0) return;

    const channel = supabase.channel('xflow-realtime');

    tables.forEach(({ table, event = '*', schema = 'public', filter }) => {
      let sub = channel.on(
        'postgres_changes',
        {
          event,
          schema,
          table,
          ...(filter ? { filter } : {}),
        },
        (payload) => {
          if (onChangesRef.current) {
            onChangesRef.current(table, payload);
          }
        }
      );
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('[Realtime] Conectado ao Supabase Realtime');
      }
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [tables]);

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  return { unsubscribe };
}

import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface NotificationsHook {
  isEnabled: boolean;
  isDenied: boolean;
  toggle: () => Promise<void>;
  notify: (title: string, body?: string) => void;
}

export function useNotifications(): NotificationsHook {
  const supported = 'Notification' in window;
  const [enabled, setEnabled] = useLocalStorage('notifications-enabled', false);
  const [permission, setPermission] = useState<NotificationPermission>(
    supported ? Notification.permission : 'denied',
  );

  const toggle = useCallback(async () => {
    if (!supported) return;
    if (permission === 'default') {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') setEnabled(true);
    } else if (permission === 'granted') {
      setEnabled((prev) => !prev);
    }
  }, [supported, permission, setEnabled]);

  const notify = useCallback(
    (title: string, body?: string) => {
      if (!supported || !enabled || permission !== 'granted') return;
      try {
        new Notification(title, { body });
      } catch {}
    },
    [supported, enabled, permission],
  );

  return {
    isEnabled: supported && enabled && permission === 'granted',
    isDenied: supported && permission === 'denied',
    toggle,
    notify,
  };
}

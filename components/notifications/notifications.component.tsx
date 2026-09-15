'use client';

import { useNotifications } from '@/stores/notifications.service';

export function Notifications() {
  const notifications = useNotifications((state) => state.notifications);
  const dismissNotification = useNotifications((state) => state.dismissNotification);
  return (
    <div aria-label="Notifications" role="region">
      {notifications.map((note) => (
        <div key={note.id} role="alert">
          <p>{note.title}</p>
          {note.message ? <p>{note.message}</p> : null}
          <button onClick={() => dismissNotification(note.id)} type="button">
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}

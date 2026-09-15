import { create } from 'zustand';
import type { Notification } from '@/stores/interfaces/notification.interface';

export const useNotifications = create<{
  readonly notifications: Notification[];
  readonly addNotification: (notification: Omit<Notification, 'id'>) => void;
  readonly dismissNotification: (id: string) => void;
}>((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, { id: crypto.randomUUID(), ...notification }],
    })),
  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((item) => item.id !== id),
    })),
}));

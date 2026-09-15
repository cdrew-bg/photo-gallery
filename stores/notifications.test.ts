import { beforeEach, expect, it } from 'vitest';
import { useNotifications } from './notifications.service';

beforeEach(() => {
  useNotifications.setState({ notifications: [] });
});

it('adds a notification with a generated id', () => {
  useNotifications.getState().addNotification({ type: 'info', title: 'hi' });
  const list = useNotifications.getState().notifications;
  expect(list).toHaveLength(1);
  expect(list[0]?.id).toBeTypeOf('string');
});

it('dismisses a notification by id', () => {
  useNotifications.getState().addNotification({ type: 'error', title: 'boom' });
  const id = useNotifications.getState().notifications[0]?.id ?? '';
  useNotifications.getState().dismissNotification(id);
  expect(useNotifications.getState().notifications).toHaveLength(0);
});

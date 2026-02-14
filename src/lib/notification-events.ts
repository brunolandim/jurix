type Callback<T = void> = T extends void ? () => void : (payload: T) => void;

const listeners = {
  created: new Set<Callback>(),
  deleted: new Set<Callback<string>>(),
  read: new Set<Callback<string>>(),
  allRead: new Set<Callback>(),
};

export const onNotificationCreated = (cb: Callback) => { listeners.created.add(cb); return () => { listeners.created.delete(cb); }; };
export const onNotificationDeleted = (cb: Callback<string>) => { listeners.deleted.add(cb); return () => { listeners.deleted.delete(cb); }; };
export const onNotificationRead = (cb: Callback<string>) => { listeners.read.add(cb); return () => { listeners.read.delete(cb); }; };
export const onAllNotificationsRead = (cb: Callback) => { listeners.allRead.add(cb); return () => { listeners.allRead.delete(cb); }; };

export const emitNotificationCreated = () => listeners.created.forEach((cb) => cb());
export const emitNotificationDeleted = (id: string) => listeners.deleted.forEach((cb) => cb(id));
export const emitNotificationRead = (id: string) => listeners.read.forEach((cb) => cb(id));
export const emitAllNotificationsRead = () => listeners.allRead.forEach((cb) => cb());

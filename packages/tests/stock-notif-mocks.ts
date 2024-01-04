import { faker } from '@faker-js/faker/locale/en_US';
import { NotificationMain } from '../stock-notif-client/src/defines/notification.define';
import { TnotifType } from '@open-stock/stock-universal';


export const createMockNotif = (incrementor = 0) => {
  const notif = {
    actions: Array.from({ length: 10 })
      .map((el, index) => ({
        action: 'action' + index,
        title: 'title',
        operation: 'operation',
        url: 'url'
      })),
    userId: faker.string.uuid(),
    title: faker.string.alphanumeric(),
    body: faker.string.alphanumeric(),
    icon: faker.image.avatar(),
    notifType: incrementor % 2 ? 'orders' : 'payments' as TnotifType,
    expireAt: new Date().toString(),
    createdAt: new Date().toString()
  };

  return new NotificationMain(notif);
};


export const createMockNotifs = (length: number) => {
  return Array.from({ length }).map((val, index)=> createMockNotif(index));
};


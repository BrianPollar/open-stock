import { faker } from '@faker-js/faker/locale/en_US';
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
        notifType: incrementor % 2 ? 'orders' : 'payments',
        expireAt: new Date().toString(),
        createdAt: new Date().toString()
    };
    return notif;
};
export const createMockNotifs = (length) => {
    return Array.from({ length }).map((val, index) => createMockNotif(index));
};
//# sourceMappingURL=stock-notif-mocks.js.map
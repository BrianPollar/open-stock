"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockNotifs = exports.createMockNotif = void 0;
const en_US_1 = require("@faker-js/faker/locale/en_US");
const notification_define_1 = require("../stock-notif-client/src/defines/notification.define");
const createMockNotif = (incrementor = 0) => {
    const notif = {
        actions: Array.from({ length: 10 })
            .map((el, index) => ({
            action: 'action' + index,
            title: 'title',
            operation: 'operation',
            url: 'url'
        })),
        userId: en_US_1.faker.string.uuid(),
        title: en_US_1.faker.string.alphanumeric(),
        body: en_US_1.faker.string.alphanumeric(),
        icon: en_US_1.faker.image.avatar(),
        notifType: incrementor % 2 ? 'orders' : 'payments',
        expireAt: new Date().toString(),
        createdAt: new Date().toString()
    };
    return new notification_define_1.NotificationMain(notif);
};
exports.createMockNotif = createMockNotif;
const createMockNotifs = (length) => {
    return Array.from({ length }).map((val, index) => (0, exports.createMockNotif)(index));
};
exports.createMockNotifs = createMockNotifs;
//# sourceMappingURL=stock-notif-mocks.js.map
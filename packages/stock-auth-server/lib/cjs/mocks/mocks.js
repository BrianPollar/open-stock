"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockDatabaseAuto = void 0;
const en_US_1 = require("@faker-js/faker/locale/en_US");
const createMockDatabaseAuto = () => {
    // This function creates a mock database auto object.
    return {
        // The `_id` property is a unique identifier for the object.
        _id: en_US_1.faker.string.uuid(),
        // The `createdAt` property is the date and time the object was created.
        createdAt: en_US_1.faker.date.past({
            years: 1
        }),
        // The `updatedAt` property is the date and time the object was updated.
        updatedAt: en_US_1.faker.date.past({
            years: 4
        })
    };
};
exports.createMockDatabaseAuto = createMockDatabaseAuto;
//# sourceMappingURL=mocks.js.map
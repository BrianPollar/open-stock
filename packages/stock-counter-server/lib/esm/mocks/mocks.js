import { faker } from '@faker-js/faker/locale/en_US';
export const createMockDatabaseAuto = () => {
    // This function creates a mock database auto object.
    return {
        // The `_id` property is a unique identifier for the object.
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _id: faker.string.uuid(),
        // The `createdAt` property is the date and time the object was created.
        createdAt: faker.date.past({
            years: 1
        }),
        // The `updatedAt` property is the date and time the object was updated.
        updatedAt: faker.date.past({
            years: 4
        })
    };
};
//# sourceMappingURL=mocks.js.map
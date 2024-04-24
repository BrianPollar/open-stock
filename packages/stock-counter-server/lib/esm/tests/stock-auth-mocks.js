import { faker } from '@faker-js/faker/locale/en_US';
import { Company } from '../stock-auth-client/src/defines/company.define';
import { User } from '../stock-auth-client/src/defines/user.define';
import { createMockDatabaseAuto } from './mocks';
export const createPermProp = (state = 'normal') => {
    return {
        create: state !== 'normal',
        read: state !== 'normal',
        update: state !== 'normal',
        delete: state !== 'normal'
    };
};
/** createMockUserperm  function: This function takes a state parameter and returns an object representing user permissions. The permissions object is based on the state value, where each permission is set to  true  if the state is not equal to 'normal', and  false  otherwise*/
export const createMockUserperm = (state = 'normal') => {
    return {
        orders: createPermProp(state),
        payments: createPermProp(state),
        users: createPermProp(state),
        items: createPermProp(state),
        faqs: createPermProp(state),
        buyer: state !== 'normal',
        customers: createPermProp(state),
        staffs: createPermProp(state),
        estimates: createPermProp(state),
        invoices: createPermProp(state),
        decoys: createPermProp(state),
        offers: createPermProp(state),
        jobCards: createPermProp(state),
        deliveryNotes: createPermProp(state),
        receipts: createPermProp(state),
        expenses: createPermProp(state),
        reports: createPermProp(state),
        companyAdminAccess: state !== 'normal'
    };
};
export const createMockCompanyPerm = (active = true) => {
    return {
        active
    };
};
/** createMockAddress  function: This function creates a mock address object with randomly generated values using the  faker  library*/
export const createMockAddress = () => {
    return {
        id: faker.string.sample(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        addressLine1: faker.address.streetAddress(),
        addressLine2: faker.address.streetAddress(),
        country: faker.address.country(),
        state: faker.address.state(),
        city: faker.address.city(),
        zipcode: Number(faker.address.zipCode()),
        phoneNumber: faker.phone.number(),
        email: faker.internet.email()
    };
};
/** createMockBilling  function: This function creates a mock billing object with randomly generated values using the  faker  library.*/
export const createMockBilling = () => {
    return {
        id: faker.string.sample(),
        cardNumber: faker.string.sample(9),
        expiryDate: faker.date.future(),
        cvv: faker.string.sample(3),
        postalCode: faker.string.sample(4)
    };
};
/** createMockUser  function: This function creates a mock user object with randomly generated values using the  faker  library. The function takes an optional incrementor parameter which is used to determine the values of certain properties based on its parity. The function also creates an instance of the  User  class with the created user object. */
export const createMockUser = (incrementor = 0) => {
    const user = {
        ...createMockDatabaseAuto(),
        urId: faker.string.uuid(),
        names: faker.person.fullName(),
        fname: faker.person.firstName(),
        lname: faker.person.lastName(),
        companyName: faker.string.sample(10),
        email: faker.internet.email(),
        address: Array.from({ length: 2 }).map(() => createMockAddress()),
        billing: Array.from({ length: 2 }).map(() => createMockBilling()),
        uid: faker.string.sample(10),
        did: faker.string.sample(10),
        aid: faker.string.sample(10),
        photos: [createMockFileMeta(), createMockFileMeta()],
        admin: incrementor % 2 !== 0,
        subAdmin: incrementor % 2 !== 0,
        permissions: createMockUserperm(),
        phone: faker.number.int(),
        amountDue: faker.number.int(),
        manuallyAdded: incrementor % 2 !== 0,
        online: incrementor % 2 !== 0,
        profilePic: createMockFileMeta(),
        profileCoverPic: createMockFileMeta(),
        greenIps: [],
        redIps: [],
        unverifiedIps: []
    };
    return new User(user);
};
/**  createMockUsers  function: This function takes a length parameter and returns an array of mock user objects created using the  createMockUser  function. */
export const createMockUsers = (length) => {
    return Array.from({ length }).map(() => createMockUser());
};
export const createMockCompany = (incrementor = 0) => {
    const companyDetails = {
        ...createMockDatabaseAuto(),
        urId: faker.string.uuid(),
        companyId: faker.string.uuid(),
        name: faker.string.alphanumeric(10),
        displayName: faker.string.alphanumeric(10),
        dateOfEst: faker.date.past().toString(),
        details: faker.string.alpha(),
        companyDispNameFormat: '',
        businessType: 'businessType',
        profilePic: createMockFileMeta(),
        profileCoverPic: createMockFileMeta(),
        password: 'password',
        websiteAddress: 'https://www.google.com',
        photos: [],
        blocked: Boolean(incrementor % 2),
        verified: Boolean(incrementor % 2),
        expireAt: '',
        blockedReasons: createMockBlockedReasons(),
        left: false,
        dateLeft: new Date(),
        owner: faker.string.uuid()
    };
    return new Company(companyDetails);
};
export const createMockCompanys = (length = 10) => {
    return Array.from({ length }).map((val, index) => createMockCompany(index));
};
export const createMockFileMeta = (allowOptionals = false) => {
    const compulObjs = {
        userOrCompanayId: faker.string.uuid(),
        name: faker.string.sample(),
        url: faker.image.url({ width: 800, height: 400 }),
        type: 'image',
        size: '400mb',
        storageDir: 'images'
    };
    if (!allowOptionals) {
        return compulObjs;
    }
    else {
        return {
            ...compulObjs,
            version: faker.number.int(10).toString(),
            photoColor: 'photoColor'
        };
    }
};
export const createMockBlockedReasons = (subscriptionInActive = true, banned = false) => {
    return {
        subscriptionInActive,
        banned
    };
};
export const createMockDeleteCredentialsLocalUser = () => {
    return {
        userId: faker.string.uuid(),
        id: faker.string.uuid()
    };
};
//# sourceMappingURL=stock-auth-mocks.js.map
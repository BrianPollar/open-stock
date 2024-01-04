"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockDeleteCredentialsLocalUser = exports.createMockBlockedReasons = exports.createMockFileMeta = exports.createMockCompanys = exports.createMockCompany = exports.createMockUsers = exports.createMockUser = exports.createMockBilling = exports.createMockAddress = exports.createMockCompanyPerm = exports.createMockUserperm = exports.createPermProp = void 0;
const en_US_1 = require("@faker-js/faker/locale/en_US");
const user_define_1 = require("../stock-auth-client/src/defines/user.define");
const mocks_1 = require("./mocks");
const company_define_1 = require("../stock-auth-client/src/defines/company.define");
const createPermProp = (state = 'normal') => {
    return {
        create: state !== 'normal',
        read: state !== 'normal',
        update: state !== 'normal',
        delete: state !== 'normal'
    };
};
exports.createPermProp = createPermProp;
/** createMockUserperm  function: This function takes a state parameter and returns an object representing user permissions. The permissions object is based on the state value, where each permission is set to  true  if the state is not equal to 'normal', and  false  otherwise*/
const createMockUserperm = (state = 'normal') => {
    return {
        orders: (0, exports.createPermProp)(state),
        payments: (0, exports.createPermProp)(state),
        users: (0, exports.createPermProp)(state),
        items: (0, exports.createPermProp)(state),
        faqs: (0, exports.createPermProp)(state),
        videos: (0, exports.createPermProp)(state),
        printables: (0, exports.createPermProp)(state),
        buyer: (0, exports.createPermProp)(state)
    };
};
exports.createMockUserperm = createMockUserperm;
const createMockCompanyPerm = (active = true) => {
    return {
        active
    };
};
exports.createMockCompanyPerm = createMockCompanyPerm;
/** createMockAddress  function: This function creates a mock address object with randomly generated values using the  faker  library*/
const createMockAddress = () => {
    return {
        id: en_US_1.faker.string.sample(),
        firstName: en_US_1.faker.person.firstName(),
        lastName: en_US_1.faker.person.lastName(),
        addressLine1: en_US_1.faker.address.streetAddress(),
        addressLine2: en_US_1.faker.address.streetAddress(),
        country: en_US_1.faker.address.country(),
        state: en_US_1.faker.address.state(),
        city: en_US_1.faker.address.city(),
        zipcode: Number(en_US_1.faker.address.zipCode()),
        phoneNumber: en_US_1.faker.phone.number(),
        email: en_US_1.faker.internet.email()
    };
};
exports.createMockAddress = createMockAddress;
/** createMockBilling  function: This function creates a mock billing object with randomly generated values using the  faker  library.*/
const createMockBilling = () => {
    return {
        id: en_US_1.faker.string.sample(),
        cardNumber: en_US_1.faker.string.sample(9),
        expiryDate: en_US_1.faker.date.future(),
        cvv: en_US_1.faker.string.sample(3),
        postalCode: en_US_1.faker.string.sample(4)
    };
};
exports.createMockBilling = createMockBilling;
/** createMockUser  function: This function creates a mock user object with randomly generated values using the  faker  library. The function takes an optional incrementor parameter which is used to determine the values of certain properties based on its parity. The function also creates an instance of the  User  class with the created user object. */
const createMockUser = (incrementor = 0) => {
    const user = {
        ...(0, mocks_1.createMockDatabaseAuto)(),
        urId: en_US_1.faker.string.uuid(),
        names: en_US_1.faker.person.fullName(),
        fname: en_US_1.faker.person.firstName(),
        lname: en_US_1.faker.person.lastName(),
        companyName: en_US_1.faker.string.sample(10),
        email: en_US_1.faker.internet.email(),
        address: Array.from({ length: 2 }).map(() => (0, exports.createMockAddress)()),
        billing: Array.from({ length: 2 }).map(() => (0, exports.createMockBilling)()),
        uid: en_US_1.faker.string.sample(10),
        did: en_US_1.faker.string.sample(10),
        aid: en_US_1.faker.string.sample(10),
        photos: [(0, exports.createMockFileMeta)(), (0, exports.createMockFileMeta)()],
        admin: String(incrementor % 2 !== 0),
        subAdmin: incrementor % 2 !== 0,
        permissions: (0, exports.createMockUserperm)(),
        phone: en_US_1.faker.number.int(),
        amountDue: en_US_1.faker.number.int(),
        manuallyAdded: incrementor % 2 !== 0,
        online: incrementor % 2 !== 0,
        profilePic: (0, exports.createMockFileMeta)(),
        profileCoverPic: (0, exports.createMockFileMeta)(),
        greenIps: [],
        redIps: [],
        unverifiedIps: []
    };
    return new user_define_1.User(user);
};
exports.createMockUser = createMockUser;
/**  createMockUsers  function: This function takes a length parameter and returns an array of mock user objects created using the  createMockUser  function. */
const createMockUsers = (length) => {
    return Array.from({ length }).map(() => (0, exports.createMockUser)());
};
exports.createMockUsers = createMockUsers;
const createMockCompany = (incrementor = 0) => {
    const companyDetails = {
        ...(0, mocks_1.createMockDatabaseAuto)(),
        urId: en_US_1.faker.string.uuid(),
        companyId: en_US_1.faker.string.uuid(),
        name: en_US_1.faker.string.alphanumeric(10),
        displayName: en_US_1.faker.string.alphanumeric(10),
        dateOfEst: en_US_1.faker.date.past().toString(),
        details: en_US_1.faker.string.alpha(),
        companyDispNameFormat: '',
        businessType: 'businessType',
        profilePic: (0, exports.createMockFileMeta)(),
        profileCoverPic: (0, exports.createMockFileMeta)(),
        password: 'password',
        websiteAddress: 'https://www.google.com',
        pesapalCallbackUrl: 'https://www.google.com',
        pesapalCancellationUrl: 'https://www.google.com',
        photos: [],
        blocked: Boolean(incrementor % 2),
        verified: Boolean(incrementor % 2),
        expireAt: '',
        blockedReasons: (0, exports.createMockBlockedReasons)(),
        left: false,
        dateLeft: new Date()
    };
    return new company_define_1.Company(companyDetails);
};
exports.createMockCompany = createMockCompany;
const createMockCompanys = (length = 10) => {
    return Array.from({ length }).map((val, index) => (0, exports.createMockCompany)(index));
};
exports.createMockCompanys = createMockCompanys;
const createMockFileMeta = (allowOptionals = false) => {
    const compulObjs = {
        userOrCompanayId: en_US_1.faker.string.uuid(),
        name: en_US_1.faker.string.sample(),
        url: en_US_1.faker.image.url({ width: 800, height: 400 }),
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
            version: en_US_1.faker.number.int(10).toString(),
            photoColor: 'photoColor'
        };
    }
};
exports.createMockFileMeta = createMockFileMeta;
const createMockBlockedReasons = (subscriptionInActive = true, banned = false) => {
    return {
        subscriptionInActive,
        banned
    };
};
exports.createMockBlockedReasons = createMockBlockedReasons;
const createMockDeleteCredentialsLocalUser = () => {
    return {
        userId: en_US_1.faker.string.uuid(),
        id: en_US_1.faker.string.uuid()
    };
};
exports.createMockDeleteCredentialsLocalUser = createMockDeleteCredentialsLocalUser;
//# sourceMappingURL=stock-auth-mocks.js.map
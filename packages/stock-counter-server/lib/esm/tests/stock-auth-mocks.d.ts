import { Iaddress, IcompanyPerm, IdeleteCredentialsLocalUser, IfileMeta, IpermProp, Iuserperm } from '@open-stock/stock-universal';
import { Company } from '../stock-auth-client/src/defines/company.define';
import { User } from '../stock-auth-client/src/defines/user.define';
export declare const createPermProp: (state?: string) => IpermProp;
/** createMockUserperm  function: This function takes a state parameter and returns an object representing user permissions. The permissions object is based on the state value, where each permission is set to  true  if the state is not equal to 'normal', and  false  otherwise*/
export declare const createMockUserperm: (state?: string) => Iuserperm;
export declare const createMockCompanyPerm: (active?: boolean) => IcompanyPerm;
/** createMockAddress  function: This function creates a mock address object with randomly generated values using the  faker  library*/
export declare const createMockAddress: () => Iaddress;
/** createMockBilling  function: This function creates a mock billing object with randomly generated values using the  faker  library.*/
export declare const createMockBilling: () => {
    id: string;
    cardNumber: string;
    expiryDate: Date;
    cvv: string;
    postalCode: string;
};
/** createMockUser  function: This function creates a mock user object with randomly generated values using the  faker  library. The function takes an optional incrementor parameter which is used to determine the values of certain properties based on its parity. The function also creates an instance of the  User  class with the created user object. */
export declare const createMockUser: (incrementor?: number) => User;
/**  createMockUsers  function: This function takes a length parameter and returns an array of mock user objects created using the  createMockUser  function. */
export declare const createMockUsers: (length: any) => User[];
export declare const createMockCompany: (incrementor?: number) => Company;
export declare const createMockCompanys: (length?: number) => Company[];
export declare const createMockFileMeta: (allowOptionals?: boolean) => IfileMeta;
export declare const createMockBlockedReasons: (subscriptionInActive?: boolean, banned?: boolean) => {
    subscriptionInActive: boolean;
    banned: boolean;
};
export declare const createMockDeleteCredentialsLocalUser: () => IdeleteCredentialsLocalUser;

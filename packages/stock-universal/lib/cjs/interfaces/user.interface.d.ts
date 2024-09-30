import { Iaddress, IdatabaseAuto, ItrackStamp, Iuser } from './general.interface';
import { IurId } from './inventory.interface';
import { Iitem } from './item.interface';
/**
 * Represents the salary of a user.
 */
export interface Isalary {
    amount: number;
    type: string;
}
/**
 * Represents the base properties of a user.
 */
export interface IuserBase extends IdatabaseAuto, ItrackStamp, IurId {
    companyId?: string;
    user: string | Iuser;
    startDate: Date;
    endDate: Date;
    occupation: string;
    currency?: string;
}
/**
 * Represents a staff member.
 */
export interface Istaff extends IuserBase, ItrackStamp {
    employmentType: string;
    salary: Isalary;
}
/**
 * Represents a customer, extending the base user interface.
 */
export interface Icustomer extends IuserBase {
    otherAddresses: Iaddress[];
}
export interface IuserBehaviour extends IdatabaseAuto {
    user?: Iuser | string;
    userCookieId: string;
    recents: Iitem[] | string[];
    cart: Iitem[] | string[];
    wishList: Iitem[] | string[];
    compareList: Iitem[] | string[];
    searchTerms: {
        term: string;
        filter: string;
    }[];
    expireAt?: string;
}

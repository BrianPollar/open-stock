import { Iaddress, Iuser } from './general.interface';
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
export interface IuserBase {
    companyId?: string;
    user: string | Iuser;
    startDate: Date;
    endDate: Date;
    occupation: string;
}
/**
 * Represents a staff member.
 */
export interface Istaff extends IuserBase {
    employmentType: string;
    salary: Isalary;
}
/**
 * Represents a customer, extending the base user interface.
 */
export interface Icustomer extends IuserBase {
    otherAddresses: Iaddress[];
}

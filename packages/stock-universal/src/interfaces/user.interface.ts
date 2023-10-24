import { Iaddress, Iuser } from './general.interface';

/** */
export interface Isalary {
  amount: number;
  type: string;
}

/** */
export interface IuserBase {
  user: string | Iuser;
  startDate: Date;
  endDate: Date;
  occupation: string;
}

/** */
export interface Istaff
extends IuserBase {
  employmentType: string;
  salary: Isalary;
}

/** */
export interface Icustomer
extends IuserBase {
  otherAddresses: Iaddress[];
}

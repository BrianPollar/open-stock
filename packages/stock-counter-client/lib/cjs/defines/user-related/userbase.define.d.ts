import { User } from '@open-stock/stock-auth-client';
import { DatabaseAuto, Icustomer, Istaff, Iuser } from '@open-stock/stock-universal';
export declare abstract class UserBase extends DatabaseAuto {
    user: string | User;
    startDate: Date;
    endDate: Date;
    occupation: string;
    readonly currency?: string;
    constructor(data: {
        user: string | Iuser;
        startDate: string;
        endDate: string;
        occupation: string;
        currency?: string;
    } | Icustomer | Istaff);
}

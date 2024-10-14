import { TnotifType } from './union-types';
export interface Iaction {
    action: string;
    title: string;
}
export interface Iactionwithall extends Iaction {
    operation: string;
    url: string;
}
export interface Imainnotification {
    _id?: string;
    actions: Iactionwithall[];
    userId: string;
    title: string;
    body: string;
    icon: string;
    notifType?: TnotifType;
    notifInvokerId?: string;
    expireAt?: string;
    createdAt?: string;
}
export interface InotifSetting {
    companyId: string;
    invoices: boolean;
    payments: boolean;
    orders: boolean;
    jobCards: boolean;
    users: boolean;
}

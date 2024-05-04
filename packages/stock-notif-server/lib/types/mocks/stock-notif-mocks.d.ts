import { TnotifType } from '@open-stock/stock-universal';
export declare const createMockNotif: (incrementor?: number) => {
    actions: {
        action: string;
        title: string;
        operation: string;
        url: string;
    }[];
    userId: string;
    title: string;
    body: string;
    icon: string;
    notifType: TnotifType;
    expireAt: string;
    createdAt: string;
};
export declare const createMockNotifs: (length: number) => {
    actions: {
        action: string;
        title: string;
        operation: string;
        url: string;
    }[];
    userId: string;
    title: string;
    body: string;
    icon: string;
    notifType: TnotifType;
    expireAt: string;
    createdAt: string;
}[];

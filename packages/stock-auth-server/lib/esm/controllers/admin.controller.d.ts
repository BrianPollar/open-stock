import { Iadminloginres } from '@open-stock/stock-universal';
/** defineAdmin  function defines an admin object with the name "admin" and sets its admin permissions for various actions.*/
export declare const defineAdmin: () => {
    name: string;
    admin: boolean;
    permissions: {
        orders: boolean;
        payments: boolean;
        users: boolean;
        items: boolean;
        faqs: boolean;
        videos: boolean;
        printables: boolean;
        buyer: boolean;
    };
};
/** login  function takes a password and adminServerPasswd as parameters and returns a promise that resolves to an admin login response object. It compares the provided password with the encrypted adminServerPasswd and returns success if they match.*/
export declare const login: (password: string, adminServerPasswd: string) => Promise<Iadminloginres>;
/** checkIfAdmin  function takes emailPhone, password, processadminID, and adminServerPasswd as parameters and returns a promise that resolves to an admin login response object. It checks if the provided emailPhone matches the processadminID and then calls the login function to check the password. */
export declare const checkIfAdmin: (emailPhone: any, password: string, processadminID: string, adminServerPasswd: string) => Promise<Iadminloginres>;

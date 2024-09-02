import { Iadminloginres } from '@open-stock/stock-universal';
/**
 * Defines an admin object with the name "admin" and sets its admin permissions for various actions.
 * @returns An admin object with the name "admin" and admin permissions for various actions.
 */
export declare const defineAdmin: () => {
    name: string;
    admin: boolean;
    permissions: {
        buyer: boolean;
        companyAdminAccess: boolean;
    };
};
/**
 * Takes a password and adminServerPasswd as parameters and returns a promise that resolves to an admin login response object.
 * It compares the provided password with the encrypted adminServerPasswd and returns success if they match.
 * @param password - The password to check against the encrypted adminServerPasswd.
 * @param adminServerPasswd - The encrypted admin password.
 * @returns A promise that resolves to an admin login response object.
 */
export declare const login: (password: string, adminServerPasswd: string) => Promise<Iadminloginres>;
/**
 * Takes emailPhone, password, processadminID, and adminServerPasswd as parameters and returns a promise that resolves to an admin login response object.
 * It checks if the provided emailPhone matches the processadminID and then calls the login function to check the password.
 * @param emailPhone - The email or phone number of the admin user.
 * @param password - The password to check against the encrypted adminServerPasswd.
 * @param processadminID - The admin ID to check against the emailPhone.
 * @param adminServerPasswd - The encrypted admin password.
 * @returns A promise that resolves to an admin login response object.
 */
export declare const checkIfAdmin: (emailPhone: string, password: string, processadminId: string, adminServerPasswd: string) => Promise<Iadminloginres>;

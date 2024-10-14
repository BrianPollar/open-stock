/**
 * @file This file defines several interfaces related to authentication and authorization.
 * @packageDocumentation
 */
import { IcompanyPerm, IsuperAdimPerms, Iuserperm } from './general-types';
import { Iauthresponse } from './return-types';
/**
 * An object representing an authentication response.
 */
export interface IauthresponseObj {
    /**
     * The status code of the response.
     */
    status: number;
    /**
     * The response object.
     */
    response: Iauthresponse;
}
/**
 * An object representing an authentication token.
 */
export interface Iauthtoken {
    /**
     * The ID of the user.
     */
    userId: string;
    superAdimPerms?: IsuperAdimPerms;
    /**
     * The permissions of the user.
     */
    companyId: string;
    permissions: Iuserperm;
    companyPermissions: IcompanyPerm;
}
/**
 * An object representing an administrator login response.
 */
export interface Iadminloginres {
    /**
     * Indicates whether the login was successful.
     */
    success: boolean;
    /**
     * The authentication token.
     */
    token?: string;
    /**
     * The user object.
     */
    user?: {
        /**
         * The name of the user.
         */
        name: string;
        /**
         * Indicates whether the user is an administrator.
         */
        admin: boolean;
        /**
         * The permissions of the user.
         */
        permissions: Iuserperm;
    };
}

import { Iuserperm } from './general.interface';
import { Iauthresponse } from './return.interface';
/** */
export interface IauthresponseObj {
    status: number;
    response: Iauthresponse;
}
/** */
export interface Iauthtoken {
    userId: string;
    permissions: Iuserperm;
}
/** */
export interface Iadminloginres {
    success: boolean;
    token?: string;
    user?: {
        name: string;
        admin: boolean;
        permissions: Iuserperm;
    };
}

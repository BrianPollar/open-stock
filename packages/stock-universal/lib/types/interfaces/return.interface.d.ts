import { Iuser } from './general.interface';
/** */
export interface Isuccess {
    success: boolean;
    err?: string;
    fileUrl?: string;
    status?: number;
}
/** */
export interface Iauthresponse {
    success: boolean;
    user?: Iuser;
    token?: string;
    err?: string;
    _id?: string;
    type?: string;
    msg?: string;
    phone?: string;
    status?: number;
}

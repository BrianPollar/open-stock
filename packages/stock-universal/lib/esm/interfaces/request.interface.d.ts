import { Request } from 'express';
import { Iauthtoken } from './auth.interface';
/** */
export interface Icustomrequest extends Request {
    user: Iauthtoken;
}

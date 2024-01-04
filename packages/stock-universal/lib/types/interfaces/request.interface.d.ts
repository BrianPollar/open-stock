import { Request } from 'express';
import { Iauthtoken } from './auth.interface';
/**
 * Represents a custom request that extends the base Request interface.
 */
export interface Icustomrequest extends Request {
    user: Iauthtoken;
}

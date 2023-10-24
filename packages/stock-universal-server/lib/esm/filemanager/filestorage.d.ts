import { Request } from 'express';
import multer from 'multer';
/** */
export interface IMulterRequest extends Request {
    file: any;
    files: any;
}
/** */
export declare const multerFileds: multer.Field[];
/** */
export declare const upload: any;

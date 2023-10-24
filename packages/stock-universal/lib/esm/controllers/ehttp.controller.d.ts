import { Observable } from 'rxjs';
import Axios from 'axios-observable';
import { LoggerController } from './logger.controller';
/** */
export interface Ifile {
    filename?: any;
    revokableUrl?: string;
    blob: Blob;
    fieldname: string;
}
/** */
export declare class EhttpController {
    axiosInstance: Axios;
    logger: LoggerController;
    constructor(axiosInstance: Axios);
    static create: (baseURL: string, token: string) => EhttpController;
    appendToken(token: string): void;
    appendHeaders(headers: any): void;
    makeGet(route: string): Observable<unknown>;
    makePut(route: string, extras: any): Observable<unknown>;
    makePost(route: string, extras: any): Observable<unknown>;
    makeDelete(route: string): Observable<unknown>;
    uploadFiles(files: Ifile[], url: string, extras?: any): Observable<unknown>;
}

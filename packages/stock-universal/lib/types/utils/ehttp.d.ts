import { Observable } from 'rxjs';
import Axios from 'axios-observable';
import { LoggerController } from './logger';
export interface Ifile {
    filename?: string;
    revokableUrl?: string;
    blob: Blob;
    fieldname: string;
}
/**
 * A class that provides methods for making HTTP requests using Axios.
 */
export declare class EhttpController {
    axiosInstance: Axios;
    /**
     * The logger for the class.
     */
    logger: LoggerController;
    /**
     * The constructor for the class.
     * @param axiosInstance - An instance of Axios.
     */
    constructor(axiosInstance: Axios);
    /**
     * A static method that creates a new instance of the class.
     * @param baseURL - The base URL for the Axios instance.
     * @param token - The authorization token for the Axios instance.
     * @returns A new instance of the EhttpController class.
     */
    static create: (baseURL: string, token: string) => EhttpController;
    /**
     * A method that appends a token to the headers of the Axios instance.
     * @param token - The authorization token to append to the headers.
     */
    appendToken(token: string): void;
    /**
     * A method that appends headers to the Axios instance.
     * @param headers - The headers to append to the Axios instance.
     */
    appendHeaders(headers: any): void;
    /**
     * A method that makes a GET request to the specified route.
     * @param route - The route to make the GET request to.
     * @returns An Observable that emits the response data.
     */
    makeGet<T = void>(route: string, retryTimes?: number): Observable<T>;
    /**
     * A method that makes a PUT request to the specified route.
     * @param route - The route to make the PUT request to.
     * @param extras - Any extra data to include in the request.
     * @returns An Observable that emits the response data.
     */
    makePut<T = void>(route: string, extras: any): Observable<T>;
    /**
     * A method that makes a POST request to the specified route.
     * @param route - The route to make the POST request to.
     * @param extras - Any extra data to include in the request.
     * @returns An Observable that emits the response data.
     */
    makePost<T = void>(route: string, extras: any): Observable<T>;
    /**
     * A method that makes a DELETE request to the specified route.
     * @param route - The route to make the DELETE request to.
     * @returns An Observable that emits the response data.
     */
    makeDelete<T = void>(route: string): Observable<T>;
    /**
     * A method that uploads files to the specified URL.
     * @param files - An array of files to upload.
  
     * @param url - The URL to upload the files to.
     * @param extras - Any extra data to include in the request.
     * @returns An Observable that emits the response data.
     */
    uploadFiles<T = void>(files: Ifile[], url: string, extras?: any): Observable<T>;
}

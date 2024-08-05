/* eslint-disable @typescript-eslint/naming-convention */
// This file imports the `Observable` type from the `rxjs` module.
import { map, retry } from 'rxjs';
// This file imports the `Axios` module.
import Axios from 'axios-observable';
// This file imports the `LoggerController` class from the `logger.controller` file.
import { LoggerController } from './logger.controller';
// This class is a controller for handling HTTP requests.
/**
 * A class that provides methods for making HTTP requests using Axios.
 */
export class EhttpController {
    /**
     * The constructor for the class.
     * @param axiosInstance - An instance of Axios.
     */
    constructor(axiosInstance) {
        this.axiosInstance = axiosInstance;
        /**
         * The logger for the class.
         */
        this.logger = new LoggerController();
    }
    /**
     * A method that appends a token to the headers of the Axios instance.
     * @param token - The authorization token to append to the headers.
     */
    appendToken(token) {
        this.axiosInstance.defaults.headers.common['Authorization'] = token;
    }
    /**
     * A method that appends headers to the Axios instance.
     * @param headers - The headers to append to the Axios instance.
     */
    appendHeaders(headers) {
        this.axiosInstance.defaults.headers = headers;
    }
    /**
     * A method that makes a GET request to the specified route.
     * @param route - The route to make the GET request to.
     * @returns An Observable that emits the response data.
     */
    makeGet(route, retryTimes = 5) {
        // Return a GET request from the Axios instance.
        return this.axiosInstance.get(route).pipe(retry(retryTimes), map(res => res.data));
    }
    /**
     * A method that makes a PUT request to the specified route.
     * @param route - The route to make the PUT request to.
     * @param extras - Any extra data to include in the request.
     * @returns An Observable that emits the response data.
     */
    makePut(route, extras) {
        // Return a PUT request from the Axios instance.
        return this.axiosInstance.put(route, extras).pipe(map(res => res.data));
    }
    /**
     * A method that makes a POST request to the specified route.
     * @param route - The route to make the POST request to.
     * @param extras - Any extra data to include in the request.
     * @returns An Observable that emits the response data.
     */
    makePost(route, extras) {
        // Return a POST request from the Axios instance.
        return this.axiosInstance.post(route, extras).pipe(map(res => res.data));
    }
    /**
     * A method that makes a DELETE request to the specified route.
     * @param route - The route to make the DELETE request to.
     * @returns An Observable that emits the response data.
     */
    makeDelete(route) {
        // Return a DELETE request from the Axios instance.
        return this.axiosInstance.delete(route).pipe(map(res => res.data));
    }
    /**
     * A method that uploads files to the specified URL.
     * @param files - An array of files to upload.
     * @param companyId - The ID of the company
     * @param url - The URL to upload the files to.
     * @param extras - Any extra data to include in the request.
     * @returns An Observable that emits the response data.
     */
    uploadFiles(files, url, extras) {
        // Create a new FormData object.
        const formData = new FormData();
        // If the `extras` parameter is not null, then append it to the form data.
        if (extras) {
            formData.append('data', JSON.stringify(extras));
        }
        // For each file in the `files` array, append it to the form data.
        for (const file of files) {
            formData.append(file.fieldname, file.blob);
        }
        // Log the request.
        this.logger.debug('uploadFiles:: - url: url , formData: %formData ', url, formData);
        // Return a POST request from the Axios instance.
        return this.axiosInstance.post(url, formData).pipe(map(res => res.data));
    }
}
/**
 * A static method that creates a new instance of the class.
 * @param baseURL - The base URL for the Axios instance.
 * @param token - The authorization token for the Axios instance.
 * @returns A new instance of the EhttpController class.
 */
EhttpController.create = (baseURL, token) => {
    // Create a new Axios instance.
    // TODO config must come from out
    const instance = Axios.create({
        baseURL,
        timeout: 1000,
        headers: {
            'X-Custom-Header': 'foobar',
            Authorization: token
        }
    });
    // Return a new instance of the class.
    return new EhttpController(instance);
};
//# sourceMappingURL=ehttp.controller.js.map
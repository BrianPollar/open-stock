/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
// This file imports the `Observable` type from the `rxjs` module.
import { map } from 'rxjs';
// This file imports the `Axios` module.
import Axios from 'axios-observable';
// This file imports the `LoggerController` class from the `logger.controller` file.
import { LoggerController } from './logger.controller';
// This class is a controller for handling HTTP requests.
/** */
export class EhttpController {
    // The constructor for the class.
    constructor(axiosInstance) {
        this.axiosInstance = axiosInstance;
        // The logger for the class.
        this.logger = new LoggerController();
    }
    // A method that appends a token to the headers of the Axios instance.
    appendToken(token) {
        this.axiosInstance.defaults.headers.common['Authorization'] = token;
    }
    // A method that appends headers to the Axios instance.
    appendHeaders(headers) {
        this.axiosInstance.defaults.headers = headers;
    }
    // A method that makes a GET request to the specified route.
    makeGet(route) {
        // Return a GET request from the Axios instance.
        return this.axiosInstance.get(route).pipe(map(res => res.data));
    }
    // A method that makes a PUT request to the specified route.
    makePut(route, extras) {
        // Return a PUT request from the Axios instance.
        return this.axiosInstance.put(route, extras).pipe(map(res => res.data));
    }
    // A method that makes a POST request to the specified route.
    makePost(route, extras) {
        // Return a POST request from the Axios instance.
        return this.axiosInstance.post(route, extras).pipe(map(res => res.data));
    }
    // A method that makes a DELETE request to the specified route.
    makeDelete(route) {
        // Return a DELETE request from the Axios instance.
        return this.axiosInstance.delete(route).pipe(map(res => res.data));
    }
    // A method that uploads files to the specified URL.
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
// A static method that creates a new instance of the class.
EhttpController.create = (baseURL, token) => {
    // Create a new Axios instance.
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
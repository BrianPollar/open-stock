/* eslint-disable @typescript-eslint/naming-convention */
// This file imports the `Observable` type from the `rxjs` module.
import { Observable, map, retry } from 'rxjs';
// This file imports the `Axios` module.
import Axios from 'axios-observable';
// This file imports the `LoggerController` class from the `logger.controller` file.
import { LoggerController } from './front-logger';

// This interface defines the properties of a file.

export interface Ifile {
  // The filename of the file.
  filename?: string;
  // The revokable URL of the file.
  revokableUrl?: string;
  // The blob data of the file.
  blob: Blob;
  // The name of the field in the form that the file will be uploaded to.
  fieldname: string;
}

// This class is a controller for handling HTTP requests.

/**
 * A class that provides methods for making HTTP requests using Axios.
 */
export class EhttpController {
  /**
   * The logger for the class.
   */
  logger = new LoggerController();

  /**
   * The constructor for the class.
   * @param axiosInstance - An instance of Axios.
   */
  constructor(public axiosInstance: Axios) { }

  /**
   * A static method that creates a new instance of the class.
   * @param baseURL - The base URL for the Axios instance.
   * @param token - The authorization token for the Axios instance.
   * @returns A new instance of the EhttpController class.
   */
  static create = (baseURL: string, token: string) => {
    // Create a new Axios instance.
    // TODO config must come from out
    const instance = Axios.create({ // TODO config must come from out
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

  /**
   * A method that appends a token to the headers of the Axios instance.
   * @param token - The authorization token to append to the headers.
   */
  appendToken(token: string) {
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
  makeGet<T = void>(route: string, retryTimes = 5): Observable<T> {
    // Return a GET request from the Axios instance.
    return this.axiosInstance.get(route).pipe(
      retry(retryTimes),
      map(res => {
        this.logger.debug('makeGet', res.data);

        return res.data;
      })
    );
  }

  /**
   * A method that makes a PUT request to the specified route.
   * @param route - The route to make the PUT request to.
   * @param extras - Any extra data to include in the request.
   * @returns An Observable that emits the response data.
   */
  makePut<T = void>(route: string, extras): Observable<T> {
    // Return a PUT request from the Axios instance.
    return this.axiosInstance.put(route, extras).pipe(map(res => {
      this.logger.debug('makePut', res.data);

      return res.data;
    }));
  }

  /**
   * A method that makes a POST request to the specified route.
   * @param route - The route to make the POST request to.
   * @param extras - Any extra data to include in the request.
   * @returns An Observable that emits the response data.
   */
  makePost<T = void>(route: string, extras): Observable<T> {
    // Return a POST request from the Axios instance.
    return this.axiosInstance.post(route, extras).pipe(map(res => {
      this.logger.debug('makePost', res.data);

      return res.data;}));
  }

  /**
   * A method that makes a DELETE request to the specified route.
   * @param route - The route to make the DELETE request to.
   * @returns An Observable that emits the response data.
   */
  makeDelete<T = void>(route: string): Observable<T> {
    // Return a DELETE request from the Axios instance.
    return this.axiosInstance.delete(route).pipe(map(res => {
      this.logger.debug('makeDelete', res.data);

      return res.data;}));
  }

  /**
   * A method that uploads files to the specified URL.
   * @param files - An array of files to upload.

   * @param url - The URL to upload the files to.
   * @param extras - Any extra data to include in the request.
   * @returns An Observable that emits the response data.
   */
  uploadFiles<T = void>(
    files: Ifile[],
    url: string, extras?
  ):
    Observable<T> {
    // Create a new FormData object.
    const formData: FormData = new FormData();

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
    return this.axiosInstance.post(url, formData).pipe(map(res => {
      this.logger.debug('uploadFiles', res.data);

      return res.data;
    }));
  }
}

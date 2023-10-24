import { Iuser } from './general.interface';

// This file imports the `Iuser` interface from the `general.interface` file.

/** */
export interface Isuccess {
  // The `success` property indicates whether the operation was successful.
  success: boolean;
  // The `error` property is a string that contains an error message, if any.
  err?: string;
  // The `fileUrl` property is the URL of the uploaded file, if any.
  fileUrl?: string;
  // The `photos` property is an array of objects that contain information about the uploaded photos, if any.
  // photos?: Iphotos;
  // the `status` property is the response status, if any.
  status?: number;
}

// This interface defines the properties of a successful response.

/** */
export interface Iauthresponse {
  // The `success` property indicates whether the authentication was successful.
  success: boolean;
  // The `user` property is an object that contains the user's information, if any.
  user?: Iuser;
  // The `token` property is the user's authentication token, if any.
  token?: string;
  // The `err` property is a string that contains an error message, if any.
  err?: string;
  // The `_id` property is the user's ID, if any.
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id?: string;
  // The `type` property is the type of the user, if any.
  type?: string;
  // The `msg` property is a message, if any.
  msg?: string;
  // The `phone` property is the user's phone number, if any.
  phone?: string;
  // the `status` property is the response status, if any.
  status?: number;
}

// This interface defines the properties of an authentication response.

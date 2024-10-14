import { Icompany, IcompanySubscription, IsubscriptionFeature, Iuser } from './general-types';

// This file imports the `Iuser` interface from the `general.interface` file.


/**
 * Represents the response object for a successful operation.
 */
export interface Isuccess {

  /**
   * Indicates whether the operation was successful.
   */
  success: boolean;

  /**
   * An error message, if any.
   */
  err?: string;

  /**
   * The URL of the uploaded file, if any.
   */
  fileUrl?: string;

  /**
   * An array of objects that contain information about the uploaded photos, if any.
   */
  // photos?: Iphotos;
  /**
   * The response status, if any.
   */
  status?: number;
}

// This interface defines the properties of a successful response.


/**
 * Represents the response object returned by the authentication process.
 */
export interface Iauthresponse {

  /**
   * Indicates whether the authentication was successful.
   */
  success: boolean;

  /**
   * Contains the user's information, if any.
   * Can be either an `Iuser` or `Icompany` object.
   */
  user?: Iuser;
  company?: Icompany;

  /**
   * The user's authentication token, if any.
   */
  token?: string;

  /**
   * An error message, if any.
   */
  err?: string;

  /**
   * The user's ID, if any.
   */

  _id?: string;

  /**
   * The type of the user, if any.
   */
  type?: string;

  /**
   * A message, if any.
   */
  msg?: string;

  /**
   * The user's phone number, if any.
   */
  phone?: string;

  /**
   * The response status, if any.
   */
  status?: number;

  /** */
  activeSubscription?: IcompanySubscription;

   /** */
  navRoute?: string;
}

// This interface defines the properties of an authentication response.


export interface IdataArrayResponse<T> {
  count: number;
  data: T[];
}

export interface IsubscriptionFeatureState
extends Isuccess {
  features?: IsubscriptionFeature[];
}

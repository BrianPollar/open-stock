import { User } from '@open-stock/stock-auth-client';
import { DatabaseAuto, Icustomer, Istaff, Iuser } from '@open-stock/stock-universal';

/** The  UserBase  class extends another class called  DatabaseAuto . It has properties  user ,  startDate ,  endDate , and  occupation . The  user  property can be either a string or an instance of the  User  class. The  startDate  and  endDate  properties are of type  Date  and represent the start and end dates for the user's occupation. The  occupation  property is a string that represents the user's occupation.  */
/**
 * Represents a base class for user-related data.
 * @abstract
 */
export abstract class UserBase extends DatabaseAuto {
  /** The user associated with this data. */
  user: string | User;

  /** The start date of the user's occupation. */
  startDate: Date;

  /** The end date of the user's occupation. */
  endDate: Date;

  /** The occupation of the user. */
  occupation: string;

  readonly currency: string;

  /**
   * Creates an instance of UserBase.
   * @param {Object} data - The data to initialize the instance with.
   * @param {string | Iuser} data.user - The user associated with this data.
   * @param {string} data.startDate - The start date of the user's occupation.
   * @param {string} data.endDate - The end date of the user's occupation.
   * @param {string} data.occupation - The occupation of the user.
   */
  constructor(data: {
    user: string | Iuser;
    startDate: string;
    endDate: string;
    occupation: string;
    currency?: string;
  } | Icustomer | Istaff) {
    super(data);
    this.user = typeof data.user === 'string' ? data.user : new User(data.user);
    this.startDate = new Date(data.startDate);
    this.endDate = new Date(data.endDate);
    this.occupation = data.occupation;
    this.currency = data.currency;
  }
}

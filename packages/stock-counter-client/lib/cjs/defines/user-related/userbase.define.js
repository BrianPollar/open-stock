"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserBase = void 0;
const stock_auth_client_1 = require("@open-stock/stock-auth-client");
const stock_universal_1 = require("@open-stock/stock-universal");
/** The  UserBase  class extends another class called  DatabaseAuto . It has properties  user ,  startDate ,  endDate , and  occupation . The  user  property can be either a string or an instance of the  User  class. The  startDate  and  endDate  properties are of type  Date  and represent the start and end dates for the user's occupation. The  occupation  property is a string that represents the user's occupation.  */
/**
 * Represents a base class for user-related data.
 * @abstract
 */
class UserBase extends stock_universal_1.DatabaseAuto {
    /**
     * Creates an instance of UserBase.
     * @param {Object} data - The data to initialize the instance with.
     * @param {string | Iuser} data.user - The user associated with this data.
     * @param {string} data.startDate - The start date of the user's occupation.
     * @param {string} data.endDate - The end date of the user's occupation.
     * @param {string} data.occupation - The occupation of the user.
     */
    constructor(data) {
        super(data);
        this.user = typeof data.user === 'string' ? data.user : new stock_auth_client_1.User(data.user);
        this.startDate = new Date(data.startDate);
        this.endDate = new Date(data.endDate);
        this.occupation = data.occupation;
    }
}
exports.UserBase = UserBase;
//# sourceMappingURL=userbase.define.js.map
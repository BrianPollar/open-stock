/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */

import { lastValueFrom } from 'rxjs';
import { DatabaseAuto, Iaddress, Ibilling, Ifile, Isuccess, Iuser, Iuserperm, TuserDispNameFormat } from '@open-stock/stock-universal';
import { StockAuthClient } from '../stock-auth-client';

/**
 * Represents a user and extends the DatabaseAuto class. It has properties that correspond to the fields in the user object, and methods for updating, deleting, and managing the user's profile, addresses, and permissions.
 */
export class User extends DatabaseAuto {
  /** The user's ID. */
  urId: string;
  /** The user's full name. */
  names: string;
  /** The user's first name. */
  fname: string;
  /** The user's last name. */
  lname: string;
  /** The user's company name. */
  companyName: string;
  /** The user's email address. */
  email: string;
  /** The user's address. */
  address: Iaddress[] = [];
  /** The user's billing information. */
  billing: Ibilling[] = [];
  /** The user's unique ID. */
  uid: string;
  /** The user's department ID. */
  did: string;
  /** The user's address ID. */
  aid: string;
  /** The user's photo. */
  photo: string;
  /** Whether the user is an admin. */
  admin = false;
  /** Whether the user is a sub-admin. */
  subAdmin = false;
  /** The user's permissions. */
  permissions: Iuserperm = {
    /** Whether the user has permission to view orders. */
    orders: false,
    /** Whether the user has permission to view payments. */
    payments: false,
    /** Whether the user has permission to view other users. */
    users: false,
    /** Whether the user has permission to view items. */
    items: false,
    /** Whether the user has permission to view FAQs. */
    faqs: false,
    /** Whether the user has permission to view videos. */
    videos: false,
    /** Whether the user has permission to view printables. */
    printables: false,
    /** Whether the user is a buyer. */
    buyer: false
  };
  /** The user's phone number. */
  phone: number;
  /** The amount due from the user. */
  amountDue = 0;
  /** Whether the user was manually added. */
  manuallyAdded: boolean;
  /** Whether the user is currently online. */
  online = false;
  /** The user's salutation. */
  salutation: string;
  /** Additional company details. */
  extraCompanyDetails: string;
  /** The format for displaying the user's name. */
  userDispNameFormat: TuserDispNameFormat = 'firstLast';

  /**
   * Creates a new User instance.
   * @param data The data to initialize the User instance with.
   */
  constructor(data: Iuser) {
    super(data);
    this.appendUpdate(data);
  }

  /**
   * Retrieves multiple users from a specified URL, with optional offset and limit parameters.
   * @param url The URL to retrieve the users from.
   * @param offset The offset to start retrieving users from.
   * @param limit The maximum number of users to retrieve.
   * @returns An array of User instances created from the retrieved user objects.
   */
  static async getUsers(url: string, offset = 0, limit = 0) {
    const observer$ = StockAuthClient.ehttp.makeGet(`/auth/getusers/${url}/${offset}/${limit}`);
    const users = await lastValueFrom(observer$) as Iuser[];
    return users.map(val => new User(val));
  }

  /**
   * Retrieves a single user based on the provided user ID.
   * @param urId The ID of the user to retrieve.
   * @returns A User instance created from the retrieved user object.
   */
  static async getOneUser(urId: string) {
    const observer$ = StockAuthClient.ehttp.makeGet(`/auth/getoneuser/${urId}`);
    const user = await lastValueFrom(observer$) as Iuser;
    return new User(user);
  }

  /**
   * Adds a new user with the provided values and optional files.
   * @param vals The values to add the user with.
   * @param files Optional files to upload with the user.
   * @returns A success object indicating whether the user was added successfully.
   */
  static async addUser(vals: Iuser, files?: Ifile[]) {
    const details = {
      user: vals
    };
    let added: Isuccess;
    if (files && files[0]) {
      const observer$ = StockAuthClient.ehttp.uploadFiles(files, '/auth/adduserimg', details);
      added = await lastValueFrom(observer$) as Isuccess;
    } else {
      const observer$ = StockAuthClient.ehttp.makePost('/auth/adduser', details);
      added = await lastValueFrom(observer$) as Isuccess;
    }
    return added;
  }

  /**
   * Deletes multiple users based on the provided user IDs and files with directories.
   * @param ids The IDs of the users to delete.
   * @param filesWithDir The files with directories to delete.
   * @returns A success object indicating whether the users were deleted successfully.
   */
  static async deleteUsers(ids: string[], filesWithDir) {
    const observer$ = StockAuthClient.ehttp.makePut('/auth/deletemany', { ids, filesWithDir });
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Updates the user's profile with the provided values and optional files.
   * @param vals The values to update the user's profile with.
   * @param files Optional files to upload with the user.
   * @returns A success object indicating whether the user was updated successfully.
   */
  async updateUserBulk(vals: Iuser, files?: Ifile[]) {
    const details = {
      user: {
        ...vals,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _id: this._id
      }
    };
    let added: Isuccess;
    if (files && files[0]) {
      const observer$ = StockAuthClient.ehttp.uploadFiles(files, '/auth/updateuserbulkimg', details);
      added = await lastValueFrom(observer$) as Isuccess;
    } else {
      const observer$ = StockAuthClient.ehttp.makePut('/auth/updateuserbulk', details);
      added = await lastValueFrom(observer$) as Isuccess;
    }
    return added;
  }

  /**
   * Determines whether the user is an admin or sub-admin based on their permissions and updates the corresponding properties accordingly.
   */
  makeAdmin() {
    const keys = Object.keys(this.permissions);
    let admin = true;
    let subAdmin = false;
    keys.forEach(key => {
      if (key !== 'buyer') {
        if (this.permissions[key]) {
          subAdmin = true;
        } else {
          admin = false;
        }
      }
    });
    this.admin = admin;
    this.subAdmin = subAdmin;
    if (this.admin) {
      this.urId = 'admin';
      this._id = 'admin';
      this.fname = this.fname || 'admin';
      this.lname = this.lname || 'admin';
      this.email = this.email || 'admin';
    }
  }

  /** updateUser  method: This method updates the user's profile with the provided values and optional files. It returns a success object indicating whether the user was updated successfully.*/
  async updateUser(
    vals,
    formtype: string,
    files?: Ifile[]) {
    let updated: Isuccess;
    if (files && files.length > 0) {
      const observer$ = StockAuthClient.ehttp
        .uploadFiles(
          files,
          '/auth/updateprofileimg',
          vals);
      updated = await lastValueFrom(observer$) as Isuccess;
    } else {
      const observer$ = StockAuthClient.ehttp
        .makePut(`/auth/updateprofile/${formtype}`, vals);
      updated = await lastValueFrom(observer$) as Isuccess;
    }
    if (updated.success) {
      this.appendUpdate(vals.userdetails);
    }
    return updated;
  }

  /** manageAddress  method: This method manages the user's addresses by adding, updating, or deleting an address based on the provided parameters. It returns a success object indicating whether the address was managed successfully.
 */
  async manageAddress(address: Iaddress | Ibilling, how = 'update', type = 'billing') {
    const observer$ = StockAuthClient.ehttp
      .makePut(`/auth/addupdateaddr/${this._id}`, { address, how, type });
    const updated = await lastValueFrom(observer$) as Isuccess;
    if (updated.success) {
      if (how === 'create') {
        if (type === 'billing') {
          this.billing.push(address as Ibilling);
        } else {
          this.address.push(address as Iaddress);
        }
      } else if (how === 'update') {
        let found: Iaddress | Ibilling | undefined;
        if (type === 'billing') {
          found = this.billing.find(val => val.id === address.id);
        } else {
          found = this.address.find(val => val.id === address.id);
        }
        if (found) {
          found = address;
        }
      } else if (type === 'billing') {
        this.billing = this.billing.filter(val => val.id !== address.id);
      } else {
        this.address = this.address.filter(val => val.id !== address.id);
      }
    }
    return updated;
  }

  /** managePermission  method: This method updates the user's permissions with the provided permissions object. It returns a success object indicating whether the permissions were updated successfully. */
  async managePermission(permissions: Iuserperm) {
    const observer$ = StockAuthClient.ehttp
      .makePut(`/auth/updatepermissions/${this._id}`, { permissions });
    const updated = await lastValueFrom(observer$) as Isuccess;
    this.permissions = permissions;
    return updated;
  }

  /** deleteUser  method: This method deletes the user. It returns a success object indicating whether the user was deleted successfully. */
  async deleteUser() {
    const observer$ = StockAuthClient.ehttp
      .makePut('/auth/deleteone',
        {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          _id: this._id,
          filesWithDir: [{
            filename: this.photo
          }] });
    const deleted = await lastValueFrom(observer$) as Isuccess;
    return deleted;
  }

  /** appendUpdate  method: This method updates the user object with the provided data and updates the admin and sub-admin properties based on the updated permissions. */
  appendUpdate(data: Iuser) {
    if (data) {
      this.urId = data.urId || this.urId;
      this.fname = data.fname || this.fname;
      this.lname = data.lname || this.lname;
      this.companyName = data.companyName || this.companyName;
      this.email = data.email || this.email;
      this.address = data.address || this.address;
      this.billing = data.billing || this.billing;
      this.uid = data.uid || this.uid;
      this.did = data.did || this.did;
      this.aid = data.aid || this.aid;
      this.photo = data.photo || this.photo;
      this.permissions = data.permissions || this.permissions;
      this.phone = data.phone || this.phone;
      this.amountDue = data.amountDue || this.amountDue;
      this.manuallyAdded = data.manuallyAdded;
      this.names = this.fname + ' ' + this.lname;
      this.salutation = data.salutation || this.salutation;
      this.extraCompanyDetails = data.extraCompanyDetails || this.extraCompanyDetails;
      this.userDispNameFormat = data.userDispNameFormat || this.userDispNameFormat;
    }

    this.makeAdmin();
  }
}

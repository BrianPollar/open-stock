/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */

import { lastValueFrom } from 'rxjs';
import { DatabaseAuto, Iaddress, Ibilling, Icompany, Ifile, IfileMeta, Isuccess, Iuser, Iuserperm, TuserDispNameFormat } from '@open-stock/stock-universal';
import { StockAuthClient } from '../stock-auth-client';
import { Company } from './company.define';

/**
 * Represents a user and extends the DatabaseAuto class. It has properties that correspond to the fields in the user object, and methods for updating, deleting, and managing the user's profile, addresses, and permissions.
 */
export class User extends DatabaseAuto {
  /** The user's ID. */
  urId: string;
  /** The user's company ID. */
  companyId: Company;
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
  /** The user's photos. */
  photos: IfileMeta[];
  profilePic: IfileMeta;
  profileCoverPic: IfileMeta;
  /** Whether the user is an admin. */
  admin = false;
  /** Whether the user is a sub-admin. */
  subAdmin = false;
  /** The user's permissions. */
  permissions: Iuserperm = {
    /** Whether the user has permission to view orders. */
    orders: {
      create: false,
      read: false,
      update: false,
      delete: false
    },
    /** Whether the user has permission to view payments. */
    payments: {
      create: false,
      read: false,
      update: false,
      delete: false
    },
    /** Whether the user has permission to view other users. */
    users: {
      create: false,
      read: false,
      update: false,
      delete: false
    },
    /** Whether the user has permission to view items. */
    items: {
      create: false,
      read: false,
      update: false,
      delete: false
    },
    /** Whether the user has permission to view FAQs. */
    faqs: {
      create: false,
      read: false,
      update: false,
      delete: false
    },
    /** Whether the user has permission to view videos. */
    videos: {
      create: false,
      read: false,
      update: false,
      delete: false
    },
    /** Whether the user has permission to view printables. */
    printables: {
      create: false,
      read: false,
      update: false,
      delete: false
    },
    /** Whether the user is a buyer. */
    buyer: {
      create: true,
      read: true,
      update: true,
      delete: true
    }
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
   * @param companyId - The ID of the company
   * @param url The URL to retrieve the users from.
   * @param offset The offset to start retrieving users from.
   * @param limit The maximum number of users to retrieve.
   * @returns An array of User instances created from the retrieved user objects.
   */
  static async getUsers(companyId: string, url: string, offset = 0, limit = 20) {
    const observer$ = StockAuthClient.ehttp.makeGet(`/user/getusers/${url}/${offset}/${limit}/${companyId}`);
    const users = await lastValueFrom(observer$) as Iuser[];
    return users.map(val => new User(val));
  }

  /**
   * Retrieves a single user based on the provided user ID.
   * @param companyId - The ID of the company
   * @param urId The ID of the user to retrieve.
   * @returns A User instance created from the retrieved user object.
   */
  static async getOneUser(companyId: string, urId: string) {
    const observer$ = StockAuthClient.ehttp.makeGet(`/user/getoneuser/${urId}/${companyId}`);
    const user = await lastValueFrom(observer$) as Iuser;
    return new User(user);
  }

  /**
   * Adds a new user with the provided values and optional files.
   * @param companyId - The ID of the company
   * @param vals The values to add the user with.
   * @param files Optional files to upload with the user.
   * @returns A success object indicating whether the user was added successfully.
   */
  static async addUser(companyId: string, vals: Iuser, files?: Ifile[]) {
    const details = {
      user: vals
    };
    let added: Isuccess;
    if (files && files[0]) {
      const observer$ = StockAuthClient.ehttp.uploadFiles(files, `/user/adduserimg/${companyId}`, details);
      added = await lastValueFrom(observer$) as Isuccess;
    } else {
      const observer$ = StockAuthClient.ehttp.makePost(`/user/adduser/${companyId}`, details);
      added = await lastValueFrom(observer$) as Isuccess;
    }
    return added;
  }

  /**
   * Deletes multiple users based on the provided user IDs and files with directories.
   * @param companyId - The ID of the company
   * @param ids The IDs of the users to delete.
   * @param filesWithDir The files with directories to delete.
   * @returns A success object indicating whether the users were deleted successfully.
   */
  static async deleteUsers(companyId: string, ids: string[], filesWithDir) {
    const observer$ = StockAuthClient.ehttp.makePut(`/user/deletemany/${companyId}`, { ids, filesWithDir });
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Updates the user's profile with the provided values and optional files.
   * @param companyId - The ID of the company
   * @param vals The values to update the user's profile with.
   * @param files Optional files to upload with the user.
   * @returns A success object indicating whether the user was updated successfully.
   */
  async updateUserBulk(companyId: string, vals: Iuser, files?: Ifile[]) {
    const details = {
      user: {
        ...vals,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _id: this._id
      }
    };
    let added: Isuccess;
    if (files && files[0]) {
      const observer$ = StockAuthClient.ehttp.uploadFiles(files, `/user/updateuserbulkimg/${companyId}`, details);
      added = await lastValueFrom(observer$) as Isuccess;
    } else {
      const observer$ = StockAuthClient.ehttp.makePut(`/user/updateuserbulk/${companyId}`, details);
      added = await lastValueFrom(observer$) as Isuccess;
    }
    return added;
  }

  /**
   * Makes the user an admin based on their permissions.
   * If the user has all permissions except 'buyer', they are considered a sub-admin.
   * If the user has all permissions, they are considered an admin.
   * Updates the user's admin and subAdmin properties accordingly.
   * If the user becomes an admin, their urId, _id, fname, lname, and email properties are updated.
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

  /**
   * Updates a user's profile information.
   * @param companyId - The ID of the company.
   * @param vals - The updated user data.
   * @param formtype - The type of form being updated.
   * @param files - Optional array of files to upload.
   * @returns A promise that resolves to the updated user data.
   */
  async updateUser(
    companyId: string,
    vals,
    formtype: string,
    files?: Ifile[]) {
    let updated: Isuccess;
    if (files && files.length > 0) {
      const observer$ = StockAuthClient.ehttp
        .uploadFiles(
          files,
          '/user/updateprofileimg',
          vals);
      updated = await lastValueFrom(observer$) as Isuccess;
    } else {
      const observer$ = StockAuthClient.ehttp
        .makePut(`/user/updateprofile/${formtype}/${companyId}`, vals);
      updated = await lastValueFrom(observer$) as Isuccess;
    }
    if (updated.success) {
      this.appendUpdate(vals.userdetails);
    }
    return updated;
  }

  /**
   * Manages the address for a user.
   * @param companyId - The ID of the company.
   * @param address - The address or billing information to manage.
   * @param how - The operation to perform (update or create). Default is 'update'.
   * @param type - The type of address to manage (billing or shipping). Default is 'billing'.
   * @returns A promise that resolves to the updated success status.
   */
  async manageAddress(companyId: string, address: Iaddress | Ibilling, how = 'update', type = 'billing') {
    const observer$ = StockAuthClient.ehttp
      .makePut(`/user/addupdateaddr/${this._id}/${companyId}`, { address, how, type });
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

  /**
   * Updates the permissions for a user in a specific company.
   * @param companyId - The ID of the company.
   * @param permissions - The updated permissions for the user.
   * @returns A promise that resolves to the updated user object.
   */
  async managePermission(companyId: string, permissions: Iuserperm) {
    const observer$ = StockAuthClient.ehttp
      .makePut(`/user/updatepermissions/${this._id}/${companyId}`, { permissions });
    const updated = await lastValueFrom(observer$) as Isuccess;
    this.permissions = permissions;
    return updated;
  }

  /**
   * Deletes a user with the specified companyId.
   * @param companyId - The ID of the company associated with the user.
   * @returns A promise that resolves to the deleted user.
   */
  async deleteUser(companyId: string) {
    const observer$ = StockAuthClient.ehttp
      .makePut(`/user/deleteone/${companyId}`,
        {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          _id: this._id,
          filesWithDir: [{
            filename: this.profilePic
          }] });
    const deleted = await lastValueFrom(observer$) as Isuccess;
    return deleted;
  }

  /**
   * Deletes images associated with a company.
   * @param companyId - The ID of the company.
   * @param filesWithDir - An array of file metadata objects.
   * @returns A promise that resolves to the success status of the deletion operation.
   */
  async deleteImages(companyId: string, filesWithDir: IfileMeta[]) {
    const observer$ = StockAuthClient.ehttp
    // eslint-disable-next-line @typescript-eslint/naming-convention
      .makePut(`/user/deleteimages/${companyId}`, { filesWithDir, user: { _id: this._id } });
    const deleted = await lastValueFrom(observer$) as Isuccess;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const toStrings = filesWithDir.map(val => val._id);
    this.photos = this.photos.filter(val => !toStrings.includes(val._id));
    return deleted;
  }

  /**
   * Updates the user object with the provided data.
   * If data is provided, the corresponding properties of the user object will be updated.
   * If a property is not provided in the data, it will retain its current value.
   * After updating the user object, it calls the makeAdmin() method.
   * @param data - The data object containing the properties to update.
   */
  appendUpdate(data: Iuser) {
    if (data) {
      this.urId = data.urId;
      if (data.companyId) {
        this.companyId = new Company(data.companyId as Icompany);
      }
      this.fname = data.fname || this.fname;
      this.lname = data.lname || this.lname;
      this.companyName = data.companyName || this.companyName;
      this.email = data.email || this.email;
      this.address = data.address || this.address;
      this.billing = data.billing || this.billing;
      this.uid = data.uid || this.uid;
      this.did = data.did || this.did;
      this.aid = data.aid || this.aid;
      this.photos = data.photos || this.photos;
      this.profilePic = data.profilePic || this.profilePic;
      this.profileCoverPic = data.profileCoverPic || this.profileCoverPic;
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

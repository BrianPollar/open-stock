/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { lastValueFrom } from 'rxjs';
import { DatabaseAuto } from '@open-stock/stock-universal';
import { StockAuthClient } from '../stock-auth-client';
/** User  class: This class represents a user and extends the  DatabaseAuto  class. It has properties that correspond to the fields in the user object, and methods for updating, deleting, and managing the user's profile, addresses, and permissions.*/
/** */
export class User extends DatabaseAuto {
    constructor(data) {
        super(data);
        /** */
        this.address = [];
        /** */
        this.billing = [];
        /** */
        this.admin = false;
        /** */
        this.subAdmin = false;
        /** */
        this.permissions = {
            /** */
            orders: false,
            /** */
            payments: false,
            /** */
            users: false,
            /** */
            items: false,
            /** */
            faqs: false,
            /** */
            videos: false,
            /** */
            printables: false,
            /** */
            buyer: false
            /** */
        };
        /** */
        this.amountDue = 0;
        /** */
        this.online = false;
        this.userDispNameFormat = 'firstLast';
        this.appendUpdate(data);
    }
    /**  getUsers  static method: This method makes a GET request to retrieve multiple users from a specified URL, with optional offset and limit parameters. It returns an array of  User  instances created from the retrieved user objects.*/
    /** */
    static async getUsers(url, offset = 0, limit = 0) {
        const observer$ = StockAuthClient.ehttp
            .makeGet(`/auth/getusers/${url}/${offset}/${limit}`);
        const users = await lastValueFrom(observer$);
        return users
            .map(val => new User(val));
    }
    /** getOneUser  static method: This method makes a GET request to retrieve a single user based on the provided user ID. It returns a  User  instance created from the retrieved user object. */
    /** */
    static async getOneUser(urId) {
        const observer$ = StockAuthClient.ehttp
            .makeGet(`/auth/getoneuser/${urId}`);
        const user = await lastValueFrom(observer$);
        return new User(user);
    }
    /** addUser  static method: This method makes a POST request to add a new user with the provided values and optional files. It returns a success object indicating whether the user was added successfully. */
    /** */
    static async addUser(vals, files) {
        const details = {
            user: vals
        };
        let added;
        if (files && files[0]) {
            const observer$ = StockAuthClient.ehttp
                .uploadFiles(files, '/auth/adduserimg', details);
            added = await lastValueFrom(observer$);
        }
        else {
            const observer$ = StockAuthClient.ehttp
                .makePost('/auth/adduser', details);
            added = await lastValueFrom(observer$);
        }
        return added;
    }
    /** deleteUsers  static method: This method makes a PUT request to delete multiple users based on the provided user IDs and files with directories. It returns a success object indicating whether the users were deleted successfully. */
    /** */
    static async deleteUsers(ids, filesWithDir) {
        const observer$ = StockAuthClient.ehttp
            .makePut('/auth/deletemany', { ids, filesWithDir });
        return await lastValueFrom(observer$);
    }
    /** updateUserBulk  method: This method updates the user's profile with the provided values and optional files. It returns a success object indicating whether the user was updated successfully. */
    async updateUserBulk(vals, files) {
        const details = {
            user: {
                ...vals,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                _id: this._id
            }
        };
        let added;
        if (files && files[0]) {
            const observer$ = StockAuthClient.ehttp
                .uploadFiles(files, '/auth/updateuserbulkimg', details);
            added = await lastValueFrom(observer$);
        }
        else {
            const observer$ = StockAuthClient.ehttp
                .makePut('/auth/updateuserbulk', details);
            added = await lastValueFrom(observer$);
        }
        return added;
    }
    /** makeAdmin  method: This method determines whether the user is an admin or sub-admin based on their permissions and updates the corresponding properties accordingly. */
    makeAdmin() {
        const keys = Object.keys(this.permissions);
        let admin = true;
        let subAdmin = false;
        keys.forEach(key => {
            if (key !== 'buyer') {
                if (this.permissions[key]) {
                    subAdmin = true;
                }
                else {
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
    async updateUser(vals, formtype, files) {
        let updated;
        if (files && files.length > 0) {
            const observer$ = StockAuthClient.ehttp
                .uploadFiles(files, '/auth/updateprofileimg', vals);
            updated = await lastValueFrom(observer$);
        }
        else {
            const observer$ = StockAuthClient.ehttp
                .makePut(`/auth/updateprofile/${formtype}`, vals);
            updated = await lastValueFrom(observer$);
        }
        if (updated.success) {
            this.appendUpdate(vals.userdetails);
        }
        return updated;
    }
    /** manageAddress  method: This method manages the user's addresses by adding, updating, or deleting an address based on the provided parameters. It returns a success object indicating whether the address was managed successfully.
   */
    async manageAddress(address, how = 'update', type = 'billing') {
        const observer$ = StockAuthClient.ehttp
            .makePut(`/auth/addupdateaddr/${this._id}`, { address, how, type });
        const updated = await lastValueFrom(observer$);
        if (updated.success) {
            if (how === 'create') {
                if (type === 'billing') {
                    this.billing.push(address);
                }
                else {
                    this.address.push(address);
                }
            }
            else if (how === 'update') {
                let found;
                if (type === 'billing') {
                    found = this.billing.find(val => val.id === address.id);
                }
                else {
                    found = this.address.find(val => val.id === address.id);
                }
                if (found) {
                    found = address;
                }
            }
            else if (type === 'billing') {
                this.billing = this.billing.filter(val => val.id !== address.id);
            }
            else {
                this.address = this.address.filter(val => val.id !== address.id);
            }
        }
        return updated;
    }
    /** managePermission  method: This method updates the user's permissions with the provided permissions object. It returns a success object indicating whether the permissions were updated successfully. */
    async managePermission(permissions) {
        const observer$ = StockAuthClient.ehttp
            .makePut(`/auth/updatepermissions/${this._id}`, { permissions });
        const updated = await lastValueFrom(observer$);
        this.permissions = permissions;
        return updated;
    }
    /** deleteUser  method: This method deletes the user. It returns a success object indicating whether the user was deleted successfully. */
    async deleteUser() {
        const observer$ = StockAuthClient.ehttp
            .makePut('/auth/deleteone', {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _id: this._id,
            filesWithDir: [{
                    filename: this.photo
                }]
        });
        const deleted = await lastValueFrom(observer$);
        return deleted;
    }
    /** appendUpdate  method: This method updates the user object with the provided data and updates the admin and sub-admin properties based on the updated permissions. */
    appendUpdate(data) {
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
//# sourceMappingURL=user.define.js.map
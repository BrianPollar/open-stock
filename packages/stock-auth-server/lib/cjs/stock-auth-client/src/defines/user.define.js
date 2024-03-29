"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_auth_client_1 = require("../stock-auth-client");
const company_define_1 = require("./company.define");
/**
 * Represents a user and extends the DatabaseAuto class. It has properties that correspond to the fields in the user object, and methods for updating, deleting, and managing the user's profile, addresses, and permissions.
 */
class User extends stock_universal_1.DatabaseAuto {
    /**
     * Creates a new User instance.
     * @param data The data to initialize the User instance with.
     */
    constructor(data) {
        super(data);
        /** The user's address. */
        this.address = [];
        /** The user's billing information. */
        this.billing = [];
        /** Whether the user is an admin. */
        this.admin = false;
        /** Whether the user is a sub-admin. */
        this.subAdmin = false;
        /** The user's permissions. */
        this.permissions = {
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
        /** The amount due from the user. */
        this.amountDue = 0;
        /** Whether the user is currently online. */
        this.online = false;
        /** The format for displaying the user's name. */
        this.userDispNameFormat = 'firstLast';
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
    static async getUsers(companyId, url, offset = 0, limit = 20) {
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp.makeGet(`/user/getusers/${url}/${offset}/${limit}/${companyId}`);
        const users = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: users.count,
            users: users.data.map(val => new User(val))
        };
    }
    /**
     * Retrieves a single user based on the provided user ID.
     * @param companyId - The ID of the company
     * @param urId The ID of the user to retrieve.
     * @returns A User instance created from the retrieved user object.
     */
    static async getOneUser(companyId, urId) {
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp.makeGet(`/user/getoneuser/${urId}/${companyId}`);
        const user = await (0, rxjs_1.lastValueFrom)(observer$);
        return new User(user);
    }
    /**
     * Adds a new user with the provided values and optional files.
     * @param companyId - The ID of the company
     * @param vals The values to add the user with.
     * @param files Optional files to upload with the user.
     * @returns A success object indicating whether the user was added successfully.
     */
    static async addUser(companyId, vals, files) {
        const details = {
            user: vals
        };
        let added;
        if (files && files[0]) {
            const observer$ = stock_auth_client_1.StockAuthClient.ehttp.uploadFiles(files, `/user/adduserimg/${companyId}`, details);
            added = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        else {
            const observer$ = stock_auth_client_1.StockAuthClient.ehttp.makePost(`/user/adduser/${companyId}`, details);
            added = await (0, rxjs_1.lastValueFrom)(observer$);
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
    static async deleteUsers(companyId, ids, filesWithDir) {
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp.makePut(`/user/deletemany/${companyId}`, { ids, filesWithDir });
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Updates the user's profile with the provided values and optional files.
     * @param companyId - The ID of the company
     * @param vals The values to update the user's profile with.
     * @param files Optional files to upload with the user.
     * @returns A success object indicating whether the user was updated successfully.
     */
    async updateUserBulk(companyId, vals, files) {
        const details = {
            user: {
                ...vals,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                _id: this._id
            }
        };
        let added;
        if (files && files[0]) {
            const observer$ = stock_auth_client_1.StockAuthClient.ehttp.uploadFiles(files, `/user/updateuserbulkimg/${companyId}`, details);
            added = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        else {
            const observer$ = stock_auth_client_1.StockAuthClient.ehttp.makePut(`/user/updateuserbulk/${companyId}`, details);
            added = await (0, rxjs_1.lastValueFrom)(observer$);
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
    /**
     * Updates a user's profile information.
     * @param companyId - The ID of the company.
     * @param vals - The updated user data.
     * @param formtype - The type of form being updated.
     * @param files - Optional array of files to upload.
     * @returns A promise that resolves to the updated user data.
     */
    async updateUser(companyId, vals, formtype, files) {
        let updated;
        if (files && files.length > 0) {
            const observer$ = stock_auth_client_1.StockAuthClient.ehttp
                .uploadFiles(files, '/user/updateprofileimg', vals);
            updated = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        else {
            const observer$ = stock_auth_client_1.StockAuthClient.ehttp
                .makePut(`/user/updateprofile/${formtype}/${companyId}`, vals);
            updated = await (0, rxjs_1.lastValueFrom)(observer$);
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
    async manageAddress(companyId, address, how = 'update', type = 'billing') {
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp
            .makePut(`/user/addupdateaddr/${this._id}/${companyId}`, { address, how, type });
        const updated = await (0, rxjs_1.lastValueFrom)(observer$);
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
    /**
     * Updates the permissions for a user in a specific company.
     * @param companyId - The ID of the company.
     * @param permissions - The updated permissions for the user.
     * @returns A promise that resolves to the updated user object.
     */
    async managePermission(companyId, permissions) {
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp
            .makePut(`/user/updatepermissions/${this._id}/${companyId}`, { permissions });
        const updated = await (0, rxjs_1.lastValueFrom)(observer$);
        this.permissions = permissions;
        return updated;
    }
    /**
     * Deletes a user with the specified companyId.
     * @param companyId - The ID of the company associated with the user.
     * @returns A promise that resolves to the deleted user.
     */
    async deleteUser(companyId) {
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp
            .makePut(`/user/deleteone/${companyId}`, {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _id: this._id,
            filesWithDir: [{
                    filename: this.profilePic
                }]
        });
        const deleted = await (0, rxjs_1.lastValueFrom)(observer$);
        return deleted;
    }
    /**
     * Deletes images associated with a company.
     * @param companyId - The ID of the company.
     * @param filesWithDir - An array of file metadata objects.
     * @returns A promise that resolves to the success status of the deletion operation.
     */
    async deleteImages(companyId, filesWithDir) {
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .makePut(`/user/deleteimages/${companyId}`, { filesWithDir, user: { _id: this._id } });
        const deleted = await (0, rxjs_1.lastValueFrom)(observer$);
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
    appendUpdate(data) {
        if (data) {
            this.urId = data.urId;
            if (data.companyId) {
                this.companyId = new company_define_1.Company(data.companyId);
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
exports.User = User;
//# sourceMappingURL=user.define.js.map
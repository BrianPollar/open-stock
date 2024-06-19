import { DatabaseAuto, Iaddress, Ibilling, Ifile, IfileMeta, Isuccess, Iuser, Iuserperm, TuserDispNameFormat, TuserType } from '@open-stock/stock-universal';
import { Company } from './company.define';
/**
 * Represents a user and extends the DatabaseAuto class. It has properties that correspond to the fields in the user object, and methods for updating, deleting, and managing the user's profile, addresses, and permissions.
 */
export declare class User extends DatabaseAuto {
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
    address: Iaddress[];
    /** The user's billing information. */
    billing: Ibilling[];
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
    /** Whether the user is a sub-admin. */
    /** The user's permissions. */
    permissions: Iuserperm;
    /** The user's phone number. */
    phone: number;
    /** The amount due from the user. */
    amountDue: number;
    /** Whether the user was manually added. */
    manuallyAdded: boolean;
    /** Whether the user is currently online. */
    online: boolean;
    /** The user's salutation. */
    salutation: string;
    /** Additional company details. */
    extraCompanyDetails: string;
    /** The format for displaying the user's name. */
    userDispNameFormat: TuserDispNameFormat;
    userType?: TuserType;
    verified: boolean;
    /**
     * Creates a new User instance.
     * @param data The data to initialize the User instance with.
     */
    constructor(data: Iuser);
    /**
     * Retrieves multiple users from a specified URL, with optional offset and limit parameters.
     * @param companyId - The ID of the company
     * @param url The URL to retrieve the users from.
     * @param offset The offset to start retrieving users from.
     * @param limit The maximum number of users to retrieve.
     * @returns An array of User instances created from the retrieved user objects.
     */
    static getUsers(companyId: string, where: TuserType | 'all' | 'registered', offset?: number, limit?: number): Promise<{
        count: number;
        users: User[];
    }>;
    /**
     * Retrieves a single user based on the provided user ID.
     * @param companyId - The ID of the company
     * @param urId The ID of the user to retrieve.
     * @returns A User instance created from the retrieved user object.
     */
    static getOneUser(companyId: string, urId: string): Promise<User>;
    /**
     * Adds a new user with the provided values and optional files.
     * @param companyId - The ID of the company
     * @param vals The values to add the user with.
     * @param files Optional files to upload with the user.
     * @returns A success object indicating whether the user was added successfully.
     */
    static addUser(companyId: string, vals: Iuser, files?: Ifile[]): Promise<Isuccess>;
    /**
     * Deletes multiple users based on the provided user IDs and files with directories.
     * @param companyId - The ID of the company
     * @param ids The IDs of the users to delete.
     * @param filesWithDir The files with directories to delete.
     * @returns A success object indicating whether the users were deleted successfully.
     */
    static deleteUsers(companyId: string, ids: string[], filesWithDir: IfileMeta[]): Promise<Isuccess>;
    /**
     * Updates the user's profile with the provided values and optional files.
     * @param companyId - The ID of the company
     * @param vals The values to update the user's profile with.
     * @param files Optional files to upload with the user.
     * @returns A success object indicating whether the user was updated successfully.
     */
    updateUserBulk(companyId: string, vals: Iuser, files?: Ifile[]): Promise<Isuccess>;
    /**
     * Makes the user an admin based on their permissions.
     * If the user has all permissions except 'buyer', they are considered a sub-admin.
     * If the user has all permissions, they are considered an admin.
     * Updates the user's admin and subAdmin properties accordingly.
     * If the user becomes an admin, their urId, _id, fname, lname, and email properties are updated.
     */
    /**
     * Updates a user's profile information.
     * @param companyId - The ID of the company.
     * @param vals - The updated user data.
     * @param formtype - The type of form being updated.
     * @param files - Optional array of files to upload.
     * @returns A promise that resolves to the updated user data.
     */
    updateUser(companyId: string, vals: any, formtype: string, files?: Ifile[]): Promise<Isuccess>;
    /**
     * Manages the address for a user.
     * @param companyId - The ID of the company.
     * @param address - The address or billing information to manage.
     * @param how - The operation to perform (update or create). Default is 'update'.
     * @param type - The type of address to manage (billing or shipping). Default is 'billing'.
     * @returns A promise that resolves to the updated success status.
     */
    manageAddress(companyId: string, address: Iaddress | Ibilling, how?: string, type?: string): Promise<Isuccess>;
    /**
     * Updates the permissions for a user in a specific company.
     * @param companyId - The ID of the company.
     * @param permissions - The updated permissions for the user.
     * @returns A promise that resolves to the updated user object.
     */
    managePermission(companyId: string, permissions: Iuserperm): Promise<Isuccess>;
    /**
     * Deletes a user with the specified companyId.
     * @param companyId - The ID of the company associated with the user.
     * @returns A promise that resolves to the deleted user.
     */
    deleteUser(companyId: string): Promise<Isuccess>;
    /**
     * Deletes images associated with a company.
     * @param companyId - The ID of the company.
     * @param filesWithDir - An array of file metadata objects.
     * @returns A promise that resolves to the success status of the deletion operation.
     */
    deleteImages(companyId: string, filesWithDir: IfileMeta[]): Promise<Isuccess>;
    /**
     * Updates the user object with the provided data.
     * If data is provided, the corresponding properties of the user object will be updated.
     * If a property is not provided in the data, it will retain its current value.
     * After updating the user object, it calls the makeAdmin() method.
     * @param data - The data object containing the properties to update.
     */
    appendUpdate(data: Iuser): void;
}

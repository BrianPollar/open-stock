import { DatabaseAuto, Iaddress, Ibilling, Ifile, Isuccess, Iuser, Iuserperm, TuserDispNameFormat } from '@open-stock/stock-universal';
/** User  class: This class represents a user and extends the  DatabaseAuto  class. It has properties that correspond to the fields in the user object, and methods for updating, deleting, and managing the user's profile, addresses, and permissions.*/
/** */
export declare class User extends DatabaseAuto {
    /** */
    urId: string;
    /** */
    names: string;
    /** */
    fname: string;
    /** */
    lname: string;
    /** */
    companyName: string;
    /** */
    email: string;
    /** */
    address: Iaddress[];
    /** */
    billing: Ibilling[];
    /** */
    uid: string;
    /** */
    did: string;
    /** */
    aid: string;
    /** */
    photo: string;
    /** */
    admin: boolean;
    /** */
    subAdmin: boolean;
    /** */
    permissions: Iuserperm;
    phone: number;
    /** */
    amountDue: number;
    /** */
    manuallyAdded: boolean;
    /** */
    online: boolean;
    /** */
    salutation: string;
    extraCompanyDetails: string;
    userDispNameFormat: TuserDispNameFormat;
    constructor(data: Iuser);
    /**  getUsers  static method: This method makes a GET request to retrieve multiple users from a specified URL, with optional offset and limit parameters. It returns an array of  User  instances created from the retrieved user objects.*/
    /** */
    static getUsers(url: string, offset?: number, limit?: number): Promise<User[]>;
    /** getOneUser  static method: This method makes a GET request to retrieve a single user based on the provided user ID. It returns a  User  instance created from the retrieved user object. */
    /** */
    static getOneUser(urId: string): Promise<User>;
    /** addUser  static method: This method makes a POST request to add a new user with the provided values and optional files. It returns a success object indicating whether the user was added successfully. */
    /** */
    static addUser(vals: Iuser, files?: Ifile[]): Promise<Isuccess>;
    /** deleteUsers  static method: This method makes a PUT request to delete multiple users based on the provided user IDs and files with directories. It returns a success object indicating whether the users were deleted successfully. */
    /** */
    static deleteUsers(ids: string[], filesWithDir: any): Promise<Isuccess>;
    /** updateUserBulk  method: This method updates the user's profile with the provided values and optional files. It returns a success object indicating whether the user was updated successfully. */
    updateUserBulk(vals: Iuser, files?: Ifile[]): Promise<Isuccess>;
    /** makeAdmin  method: This method determines whether the user is an admin or sub-admin based on their permissions and updates the corresponding properties accordingly. */
    makeAdmin(): void;
    /** updateUser  method: This method updates the user's profile with the provided values and optional files. It returns a success object indicating whether the user was updated successfully.*/
    updateUser(vals: any, formtype: string, files?: Ifile[]): Promise<Isuccess>;
    /** manageAddress  method: This method manages the user's addresses by adding, updating, or deleting an address based on the provided parameters. It returns a success object indicating whether the address was managed successfully.
   */
    manageAddress(address: Iaddress | Ibilling, how?: string, type?: string): Promise<Isuccess>;
    /** managePermission  method: This method updates the user's permissions with the provided permissions object. It returns a success object indicating whether the permissions were updated successfully. */
    managePermission(permissions: Iuserperm): Promise<Isuccess>;
    /** deleteUser  method: This method deletes the user. It returns a success object indicating whether the user was deleted successfully. */
    deleteUser(): Promise<Isuccess>;
    /** appendUpdate  method: This method updates the user object with the provided data and updates the admin and sub-admin properties based on the updated permissions. */
    appendUpdate(data: Iuser): void;
}

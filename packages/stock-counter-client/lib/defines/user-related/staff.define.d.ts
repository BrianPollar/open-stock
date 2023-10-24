import { Istaff, Isuccess, Isalary, IdeleteCredentialsLocalUser, Ifilewithdir } from '@open-stock/stock-universal';
import { UserBase } from './userbase.define';
/** The  Staff  class extends a base class called  UserBase  (not provided) and adds additional properties such as employmentType and salary. It also provides several static methods for interacting with the server API, including retrieving all staff members, retrieving a single staff member by ID, creating a new staff member, deleting multiple staff members, updating a staff member's information, and deleting a single staff member. */
export declare class Staff extends UserBase {
    employmentType: string;
    salary: Isalary;
    /** The  Staff  class extends a base class called  UserBase  (not provided) and adds additional properties such as employmentType and salary. It also provides several static methods for interacting with the server API, including retrieving all staff members, retrieving a single staff member by ID, creating a new staff member, deleting multiple staff members, updating a staff member's information, and deleting a single staff member.  */
    constructor(data: Istaff);
    /** */
    static getStaffs(offset?: number, limit?: number): Promise<Staff[]>;
    /** */
    static getOneStaff(id: string): Promise<Staff>;
    /** */
    static createStaff(staff: Istaff): Promise<Isuccess>;
    /** */
    static deleteStaffs(credentials: IdeleteCredentialsLocalUser[], filesWithDir: Ifilewithdir[]): Promise<Isuccess>;
    /** The  updateStaff  method in the  Staff  class updates the current staff member's employmentType and salary properties with the values provided in the  vals  parameter, if they are present. It then makes a PUT request to the server API to update the staff member's information.*/
    updateStaff(vals: Istaff): Promise<Isuccess>;
    /** The  deleteStaff  method in the  Staff  class deletes the current staff member by making a DELETE request to the server API.*/
    deleteStaff(credential: IdeleteCredentialsLocalUser, filesWithDir: Ifilewithdir[]): Promise<Isuccess>;
}

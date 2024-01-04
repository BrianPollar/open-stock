import { Istaff, Isuccess, Isalary, IdeleteCredentialsLocalUser, IfileMeta } from '@open-stock/stock-universal';
import { UserBase } from './userbase.define';
/**
 * The  Staff  class extends a base class called  UserBase  (not provided) and adds additional properties such as employmentType and salary.
 * It also provides several static methods for interacting with the server API, including retrieving all staff members, retrieving a single staff member by ID, creating a new staff member, deleting multiple staff members, updating a staff member's information, and deleting a single staff member.
 */
export declare class Staff extends UserBase {
    employmentType: string;
    salary: Isalary;
    /**
     * Creates an instance of Staff.
     * @param {Istaff} data - The data for the staff member.
     */
    constructor(data: Istaff);
    /**
     * Retrieves all staff members.
     * @param companyId - The ID of the company
     * @param {number} [offset=0] - The offset to start retrieving staff members from.
     * @param {number} [limit=0] - The maximum number of staff members to retrieve.
     * @returns {Promise<Staff[]>} - A promise that resolves to an array of Staff instances.
     */
    static getStaffs(companyId: string, offset?: number, limit?: number): Promise<Staff[]>;
    /**
     * Retrieves all staff members.
     * @param companyId - The ID of the company
     * @param {number} [offset=0] - The offset to start retrieving staff members from.
     * @param {number} [limit=0] - The maximum number of staff members to retrieve.
     * @returns {Promise<Staff[]>} - A promise that resolves to an array of Staff instances.
     */
    static getStaffByRole(companyId: string, role: string, offset?: number, limit?: number): Promise<Staff[]>;
    /**
     * Retrieves a single staff member by ID.
     * @param companyId - The ID of the company
     * @param {string} id - The ID of the staff member to retrieve.
     * @returns {Promise<Staff>} - A promise that resolves to a Staff instance.
     */
    static getOneStaff(companyId: string, id: string): Promise<Staff>;
    /**
     * Creates a new staff member.
     * @param companyId - The ID of the company
     * @param {Istaff} staff - The data for the new staff member.
     * @returns {Promise<Isuccess>} - A promise that resolves to a success message.
     */
    static createStaff(companyId: string, staff: Istaff): Promise<Isuccess>;
    /**
     * Deletes multiple staff members.
     * @param companyId - The ID of the company
     * @param {IdeleteCredentialsLocalUser[]} credentials - The credentials of the staff members to delete.
     * @param {Ifilewithdir[]} filesWithDir - The files and directories associated with the staff members to delete.
     * @returns {Promise<Isuccess>} - A promise that resolves to a success message.
     */
    static deleteStaffs(companyId: string, credentials: IdeleteCredentialsLocalUser[], filesWithDir: IfileMeta[]): Promise<Isuccess>;
    /**
     * Updates the current staff member's employmentType and salary properties with the values provided in the  vals  parameter, if they are present.
     * It then makes a PUT request to the server API to update the staff member's information.
     * @param companyId - The ID of the company
     * @param {Istaff} vals - The new values for the staff member.
     * @returns {Promise<Isuccess>} - A promise that resolves to a success message.
     */
    updateStaff(companyId: string, vals: Istaff): Promise<Isuccess>;
    /**
     * Deletes the current staff member.
     * @param companyId - The ID of the company
     * @param {IdeleteCredentialsLocalUser} credential - The credentials of the staff member to delete.
     * @param {Ifilewithdir[]} filesWithDir - The files and directories associated with the staff member to delete.
     * @returns {Promise<Isuccess>} - A promise that resolves to a success message.
     */
    deleteStaff(companyId: string, credential: IdeleteCredentialsLocalUser, filesWithDir: IfileMeta[]): Promise<Isuccess>;
}

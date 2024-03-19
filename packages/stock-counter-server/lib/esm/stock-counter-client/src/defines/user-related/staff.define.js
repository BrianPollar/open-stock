import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
import { UserBase } from './userbase.define';
/**
 * The  Staff  class extends a base class called  UserBase  (not provided) and adds additional properties such as employmentType and salary.
 * It also provides several static methods for interacting with the server API, including retrieving all staff members, retrieving a single staff member by ID, creating a new staff member, deleting multiple staff members, updating a staff member's information, and deleting a single staff member.
 */
export class Staff extends UserBase {
    /**
     * Creates an instance of Staff.
     * @param {Istaff} data - The data for the staff member.
     */
    constructor(data) {
        super(data);
        this.employmentType = data.employmentType;
        this.salary = data.salary;
    }
    /**
     * Retrieves all staff members.
     * @param companyId - The ID of the company
     * @param {number} [offset=0] - The offset to start retrieving staff members from.
     * @param {number} [limit=0] - The maximum number of staff members to retrieve.
     * @returns {Promise<Staff[]>} - A promise that resolves to an array of Staff instances.
     */
    static async getStaffs(companyId, offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp.makeGet(`/staff/getall/${offset}/${limit}/${companyId}`);
        const staffs = await lastValueFrom(observer$);
        return staffs.map(val => new Staff(val));
    }
    /**
     * Retrieves all staff members.
     * @param companyId - The ID of the company
     * @param {number} [offset=0] - The offset to start retrieving staff members from.
     * @param {number} [limit=0] - The maximum number of staff members to retrieve.
     * @returns {Promise<Staff[]>} - A promise that resolves to an array of Staff instances.
     */
    static async getStaffByRole(companyId, role, offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp.makeGet(`/staff/getbyrole/${offset}/${limit}/${role}/${companyId}`);
        const staffs = await lastValueFrom(observer$);
        return staffs.map(val => new Staff(val));
    }
    /**
     * Retrieves a single staff member by ID.
     * @param companyId - The ID of the company
     * @param {string} id - The ID of the staff member to retrieve.
     * @returns {Promise<Staff>} - A promise that resolves to a Staff instance.
     */
    static async getOneStaff(companyId, id) {
        const observer$ = StockCounterClient.ehttp.makeGet(`/staff/getone/${id}/${companyId}`);
        const staff = await lastValueFrom(observer$);
        return new Staff(staff);
    }
    /**
     * Creates a new staff member.
     * @param companyId - The ID of the company
     * @param {Istaff} staff - The data for the new staff member.
     * @returns {Promise<Isuccess>} - A promise that resolves to a success message.
     */
    static async createStaff(companyId, staff) {
        const observer$ = StockCounterClient.ehttp.makePost(`/staff/create/${companyId}`, { staff });
        return await lastValueFrom(observer$);
    }
    /**
     * Deletes multiple staff members.
     * @param companyId - The ID of the company
     * @param {IdeleteCredentialsLocalUser[]} credentials - The credentials of the staff members to delete.
     * @param {Ifilewithdir[]} filesWithDir - The files and directories associated with the staff members to delete.
     * @returns {Promise<Isuccess>} - A promise that resolves to a success message.
     */
    static async deleteStaffs(companyId, credentials, filesWithDir) {
        const observer$ = StockCounterClient.ehttp.makePut(`/staff/deletemany/${companyId}`, { credentials, filesWithDir });
        return await lastValueFrom(observer$);
    }
    /**
     * Updates the current staff member's employmentType and salary properties with the values provided in the  vals  parameter, if they are present.
     * It then makes a PUT request to the server API to update the staff member's information.
     * @param companyId - The ID of the company
     * @param {Istaff} vals - The new values for the staff member.
     * @returns {Promise<Isuccess>} - A promise that resolves to a success message.
     */
    async updateStaff(companyId, vals) {
        const observer$ = StockCounterClient.ehttp.makePut(`/staff/update/${companyId}`, vals);
        const updated = await lastValueFrom(observer$);
        if (updated.success) {
            this.employmentType = vals.employmentType || this.employmentType;
            this.salary = vals.salary || this.salary;
        }
        return updated;
    }
    /**
     * Deletes the current staff member.
     * @param companyId - The ID of the company
     * @param {IdeleteCredentialsLocalUser} credential - The credentials of the staff member to delete.
     * @param {Ifilewithdir[]} filesWithDir - The files and directories associated with the staff member to delete.
     * @returns {Promise<Isuccess>} - A promise that resolves to a success message.
     */
    async deleteStaff(companyId, credential, filesWithDir) {
        const observer$ = StockCounterClient.ehttp.makePut(`/staff/deleteone/${companyId}`, { credential, filesWithDir });
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=staff.define.js.map
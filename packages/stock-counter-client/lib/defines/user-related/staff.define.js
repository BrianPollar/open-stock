import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
import { UserBase } from './userbase.define';
/** The  Staff  class extends a base class called  UserBase  (not provided) and adds additional properties such as employmentType and salary. It also provides several static methods for interacting with the server API, including retrieving all staff members, retrieving a single staff member by ID, creating a new staff member, deleting multiple staff members, updating a staff member's information, and deleting a single staff member. */
export class Staff extends UserBase {
    /** The  Staff  class extends a base class called  UserBase  (not provided) and adds additional properties such as employmentType and salary. It also provides several static methods for interacting with the server API, including retrieving all staff members, retrieving a single staff member by ID, creating a new staff member, deleting multiple staff members, updating a staff member's information, and deleting a single staff member.  */
    constructor(data) {
        super(data);
        this.employmentType = data.employmentType;
        this.salary = data.salary;
    }
    /** */
    static async getStaffs(offset = 0, limit = 0) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/staff/getall/${offset}/${limit}`);
        const staffs = await lastValueFrom(observer$);
        return staffs.map(val => new Staff(val));
    }
    /** */
    static async getOneStaff(id) {
        const observer$ = StockCounterClient.ehttp.makeGet(`/staff/getone/${id}`);
        const staff = await lastValueFrom(observer$);
        return new Staff(staff);
    }
    /** */
    static async createStaff(staff) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/staff/create', {
            staff
        });
        return await lastValueFrom(observer$);
    }
    /** */
    static async deleteStaffs(credentials, filesWithDir) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/staff/deletemany', { credentials, filesWithDir });
        return await lastValueFrom(observer$);
    }
    /** The  updateStaff  method in the  Staff  class updates the current staff member's employmentType and salary properties with the values provided in the  vals  parameter, if they are present. It then makes a PUT request to the server API to update the staff member's information.*/
    async updateStaff(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/staff/update', vals);
        const updated = await lastValueFrom(observer$);
        if (updated.success) {
            this.employmentType = vals.employmentType || this.employmentType;
            this.salary = vals.salary || this.salary;
        }
        return updated;
    }
    /** The  deleteStaff  method in the  Staff  class deletes the current staff member by making a DELETE request to the server API.*/
    async deleteStaff(credential, filesWithDir) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/staff/deleteone', { credential, filesWithDir });
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=staff.define.js.map
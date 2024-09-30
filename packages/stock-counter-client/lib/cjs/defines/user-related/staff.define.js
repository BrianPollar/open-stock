"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Staff = void 0;
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../../stock-counter-client");
const userbase_define_1 = require("./userbase.define");
class Staff extends userbase_define_1.UserBase {
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
  
     * @param {number} [offset=0] - The offset to start retrieving staff members from.
     * @param {number} [limit=0] - The maximum number of staff members to retrieve.
     * @returns {Promise<Staff[]>} - A promise that resolves to an array of Staff instances.
     */
    static async getAll(offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/staff/all/${offset}/${limit}`);
        const staffs = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: staffs.count,
            staffs: staffs.data.map(val => new Staff(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/staff/filter', filter);
        const staffs = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: staffs.count,
            staffs: staffs.data.map(val => new Staff(val))
        };
    }
    /**
     * Retrieves all staff members.
  
     * @param {number} [offset=0] - The offset to start retrieving staff members from.
     * @param {number} [limit=0] - The maximum number of staff members to retrieve.
     * @returns {Promise<Staff[]>} - A promise that resolves to an array of Staff instances.
     */
    static async getByRole(role, offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/staff/getbyrole/${offset}/${limit}/${role}`);
        const staffs = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: staffs.count,
            staffs: staffs.data.map(val => new Staff(val))
        };
    }
    /**
     * Retrieves a single staff member by ID.
  
     * @param {string} id - The ID of the staff member to retrieve.
     * @returns {Promise<Staff>} - A promise that resolves to a Staff instance.
     */
    static async getOne(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/staff/one', filter);
        const staff = await (0, rxjs_1.lastValueFrom)(observer$);
        return new Staff(staff);
    }
    /**
     * Creates a new staff member.
  
     * @param {Istaff} staff - The data for the new staff member.
     * @returns {Promise<Isuccess>} - A promise that resolves to a success message.
     */
    static async add(vals, files) {
        let added;
        vals.user.userType = 'staff';
        if (files && files[0]) {
            const observer$ = stock_counter_client_1.StockCounterClient.ehttp
                .uploadFiles(files, '/staff/add/img', vals);
            added = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        else {
            const observer$ = stock_counter_client_1.StockCounterClient.ehttp
                .makePost('/staff/add', vals);
            added = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        return added;
    }
    /**
     * Deletes multiple staff members.
  
     * @param {IdeleteCredentialsLocalUser[]} credentials - The credentials of the staff members to delete.
     * @param {Ifilewithdir[]} filesWithDir - The files and directories associated with the staff members to delete.
     * @returns {Promise<Isuccess>} - A promise that resolves to a success message.
     */
    static removeMany(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/staff/delete/many', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Updates the current staff member's employmentType
     * and salary properties with the values provided in the  vals  parameter, if they are present.
     * It then makes a PUT request to the server API to update the staff member's information.
  
     * @param {Istaff} vals - The new values for the staff member.
     * @returns {Promise<Isuccess>} - A promise that resolves to a success message.
     */
    async update(vals, files) {
        let updated;
        vals.staff._id = this._id;
        vals.user._id = typeof this.user === 'string' ? this.user : this.user._id;
        if (files && files[0]) {
            const observer$ = stock_counter_client_1.StockCounterClient.ehttp.uploadFiles(files, '/staff/update/img', vals);
            updated = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        else {
            const observer$ = stock_counter_client_1.StockCounterClient.ehttp
                .makePut('/staff/update', vals);
            updated = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        if (updated.success) {
            this.employmentType = vals.staff.employmentType || this.employmentType;
            this.salary = vals.staff.salary || this.salary;
        }
        return updated;
    }
    /**
     * Deletes the current staff member.
  
     * @param {IdeleteCredentialsLocalUser} credential - The credentials of the staff member to delete.
     * @param {Ifilewithdir[]} filesWithDir - The files and directories associated with the staff member to delete.
     * @returns {Promise<Isuccess>} - A promise that resolves to a success message.
     */
    remove(val) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/staff/delete/one', val);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.Staff = Staff;
//# sourceMappingURL=staff.define.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Staff = void 0;
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../../stock-counter-client");
const userbase_define_1 = require("./userbase.define");
class Staff extends userbase_define_1.UserBase {
    constructor(data) {
        super(data);
        this.employmentType = data.employmentType;
        this.salary = data.salary;
    }
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
    static async getByRole(role, offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/staff/getbyrole/${offset}/${limit}/${role}`);
        const staffs = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: staffs.count,
            staffs: staffs.data.map(val => new Staff(val))
        };
    }
    static async getOne(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/staff/one', filter);
        const staff = await (0, rxjs_1.lastValueFrom)(observer$);
        return new Staff(staff);
    }
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
    static removeMany(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/staff/delete/many', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
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
    remove(val) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/staff/delete/one', val);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.Staff = Staff;
//# sourceMappingURL=staff.define.js.map
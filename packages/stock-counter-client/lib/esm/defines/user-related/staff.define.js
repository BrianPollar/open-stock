import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
import { UserBase } from './userbase.define';
export class Staff extends UserBase {
    constructor(data) {
        super(data);
        this.employmentType = data.employmentType;
        this.salary = data.salary;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/staff/all/${offset}/${limit}`);
        const staffs = await lastValueFrom(observer$);
        return {
            count: staffs.count,
            staffs: staffs.data.map(val => new Staff(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/staff/filter', filter);
        const staffs = await lastValueFrom(observer$);
        return {
            count: staffs.count,
            staffs: staffs.data.map(val => new Staff(val))
        };
    }
    static async getByRole(role, offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/staff/getbyrole/${offset}/${limit}/${role}`);
        const staffs = await lastValueFrom(observer$);
        return {
            count: staffs.count,
            staffs: staffs.data.map(val => new Staff(val))
        };
    }
    static async getOne(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/staff/one', filter);
        const staff = await lastValueFrom(observer$);
        return new Staff(staff);
    }
    static async add(vals, files) {
        let added;
        vals.user.userType = 'staff';
        if (files && files[0]) {
            const observer$ = StockCounterClient.ehttp
                .uploadFiles(files, '/staff/add/img', vals);
            added = await lastValueFrom(observer$);
        }
        else {
            const observer$ = StockCounterClient.ehttp
                .makePost('/staff/add', vals);
            added = await lastValueFrom(observer$);
        }
        return added;
    }
    static removeMany(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/staff/delete/many', vals);
        return lastValueFrom(observer$);
    }
    async update(vals, files) {
        let updated;
        vals.staff._id = this._id;
        vals.user._id = typeof this.user === 'string' ? this.user : this.user._id;
        if (files && files[0]) {
            const observer$ = StockCounterClient.ehttp.uploadFiles(files, '/staff/update/img', vals);
            updated = await lastValueFrom(observer$);
        }
        else {
            const observer$ = StockCounterClient.ehttp
                .makePut('/staff/update', vals);
            updated = await lastValueFrom(observer$);
        }
        if (updated.success) {
            this.employmentType = vals.staff.employmentType || this.employmentType;
            this.salary = vals.staff.salary || this.salary;
        }
        return updated;
    }
    remove() {
        const observer$ = StockCounterClient.ehttp
            .makePut('/staff/delete/one', { _id: this._id });
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=staff.define.js.map
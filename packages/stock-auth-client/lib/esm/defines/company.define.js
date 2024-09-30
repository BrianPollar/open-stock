import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockAuthClient } from '../stock-auth-client';
import { User } from './user.define';
export class Company extends DatabaseAuto {
    constructor(data) {
        super(data);
        this.appendUpdate(data);
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = StockAuthClient
            .ehttp.makeGet(`/company/all/${offset}/${limit}`);
        const companys = await lastValueFrom(observer$);
        return {
            count: companys.count,
            companys: companys.data.map(val => new Company(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockAuthClient
            .ehttp.makePost('/company/filter', filter);
        const companys = await lastValueFrom(observer$);
        return {
            count: companys.count,
            companys: companys.data.map(val => new Company(val))
        };
    }
    static async getOne(_id) {
        const observer$ = StockAuthClient.ehttp.makeGet(`/company/one/${_id}`);
        const company = await lastValueFrom(observer$);
        return new Company(company);
    }
    static async add(vals) {
        const observer$ = StockAuthClient.ehttp.makePost('/company/add', vals);
        const added = await lastValueFrom(observer$);
        return added;
    }
    static deleteCompanys(vals) {
        const observer$ = StockAuthClient
            .ehttp.makePut('/company/delete/many', vals);
        return lastValueFrom(observer$);
    }
    async update(vals, files) {
        vals.company._id = this._id;
        let updated;
        if (files && files.length > 0) {
            const observer$ = StockAuthClient.ehttp
                .uploadFiles(files, '/company/update/img', vals);
            updated = await lastValueFrom(observer$);
        }
        else {
            const observer$ = StockAuthClient.ehttp.makePut('/company/update', vals);
            updated = await lastValueFrom(observer$);
        }
        return updated;
    }
    async remove() {
        const observer$ = StockAuthClient.ehttp
            .makePut('/company/delete/one', {
            _id: this._id
        });
        const deleted = await lastValueFrom(observer$);
        return deleted;
    }
    appendUpdate(data) {
        if (data) {
            this.urId = data.urId || this.urId;
            this.name = data.name || this.name;
            this.displayName = data.displayName || this.displayName;
            this.dateOfEst = data.dateOfEst || this.dateOfEst;
            this.details = data.details || this.details;
            this.businessType = data.businessType || this.businessType;
            this.websiteAddress = data.websiteAddress || this.websiteAddress;
            this.blockedReasons = data.blockedReasons || this.blockedReasons;
            this.left = data.left || this.left;
            this.dateLeft = data.dateLeft || this.dateLeft;
            this.blocked = data.blocked || this.blocked;
            this.verified = data.verified || this.verified;
            this.address = data.address || this.address;
            this.owner = typeof data.owner === 'object' ? new User(data.owner) : data.owner;
        }
    }
}
//# sourceMappingURL=company.define.js.map
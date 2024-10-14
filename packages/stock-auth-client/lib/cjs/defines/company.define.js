"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Company = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_auth_client_1 = require("../stock-auth-client");
const user_define_1 = require("./user.define");
class Company extends stock_universal_1.DatabaseAuto {
    constructor(data) {
        super(data);
        this.appendUpdate(data);
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = stock_auth_client_1.StockAuthClient
            .ehttp.makeGet(`/company/all/${offset}/${limit}`);
        const companys = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: companys.count,
            companys: companys.data.map(val => new Company(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = stock_auth_client_1.StockAuthClient
            .ehttp.makePost('/company/filter', filter);
        const companys = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: companys.count,
            companys: companys.data.map(val => new Company(val))
        };
    }
    static async getOne(id) {
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp.makeGet(`/company/one/${id}`);
        const company = await (0, rxjs_1.lastValueFrom)(observer$);
        return new Company(company);
    }
    static async add(vals) {
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp.makePost('/company/add', vals);
        const added = await (0, rxjs_1.lastValueFrom)(observer$);
        return added;
    }
    static deleteCompanys(vals) {
        const observer$ = stock_auth_client_1.StockAuthClient
            .ehttp.makePut('/company/delete/many', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    async update(vals, files) {
        vals.company._id = this._id;
        let updated;
        if (files && files.length > 0) {
            const observer$ = stock_auth_client_1.StockAuthClient.ehttp
                .uploadFiles(files, '/company/update/img', vals);
            updated = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        else {
            const observer$ = stock_auth_client_1.StockAuthClient.ehttp.makePut('/company/update', vals);
            updated = await (0, rxjs_1.lastValueFrom)(observer$);
        }
        return updated;
    }
    async remove() {
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp
            .makePut('/company/delete/one', {
            _id: this._id
        });
        const deleted = await (0, rxjs_1.lastValueFrom)(observer$);
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
            this.owner = typeof data.owner === 'object' ? new user_define_1.User(data.owner) : data.owner;
            this.logo = typeof data.owner === 'object' && data.owner.photos ? data.owner.photos[0].url : '';
        }
    }
}
exports.Company = Company;
//# sourceMappingURL=company.define.js.map
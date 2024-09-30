import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockAuthClient } from '../stock-auth-client';
import { Company } from './company.define';
export class User extends DatabaseAuto {
    constructor(data) {
        super(data);
        this.address = [];
        this.billing = [];
        this.permissions = {
            companyAdminAccess: false
        };
        this.amountDue = 0;
        this.online = false;
        this.userDispNameFormat = 'firstLast';
        this.appendUpdate(data);
        this.currency = data.currency;
    }
    static async existsEmailOrPhone(emailPhone) {
        const observer$ = StockAuthClient.ehttp.makeGet(`/user/existsemailphone/${emailPhone}`);
        const response = await lastValueFrom(observer$);
        return response.exists;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = StockAuthClient
            .ehttp.makeGet(`/user/all/${offset}/${limit}`);
        const users = await lastValueFrom(observer$);
        return {
            count: users.count,
            users: users.data.map(val => new User(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockAuthClient.ehttp.makePost('/user/filter', filter);
        const users = await lastValueFrom(observer$);
        return {
            count: users.count,
            users: users.data.map(val => new User(val))
        };
    }
    static async getOne(urId) {
        const observer$ = StockAuthClient.ehttp.makeGet(`/user/one/${urId}`);
        const user = await lastValueFrom(observer$);
        return new User(user);
    }
    static async add(user, files) {
        const body = {
            user
        };
        let added;
        if (files && files[0]) {
            const observer$ = StockAuthClient.ehttp.uploadFiles(files, '/user/add/img', body);
            added = await lastValueFrom(observer$);
        }
        else {
            const observer$ = StockAuthClient.ehttp.makePost('/user/add', body);
            added = await lastValueFrom(observer$);
        }
        return added;
    }
    static removeMany(vals) {
        const observer$ = StockAuthClient.ehttp.makePut('/user/delete/many', vals);
        return lastValueFrom(observer$);
    }
    async update(vals, files) {
        const details = {
            user: {
                ...vals,
                _id: this._id
            }
        };
        let updated;
        if (files && files[0]) {
            const observer$ = StockAuthClient
                .ehttp.uploadFiles(files, '/user/update/img', details);
            updated = await lastValueFrom(observer$);
        }
        else {
            const observer$ = StockAuthClient.ehttp.makePut('/user/update', details);
            updated = await lastValueFrom(observer$);
        }
        return updated;
    }
    async modifyPermissions(permissions) {
        const observer$ = StockAuthClient.ehttp
            .makePut(`/user/updatepermissions/${this._id}`, permissions);
        const updated = await lastValueFrom(observer$);
        this.permissions = permissions;
        return updated;
    }
    async remove() {
        const observer$ = StockAuthClient.ehttp
            .makePut('/user/delete/one', {
            _id: this._id
        });
        const deleted = await lastValueFrom(observer$);
        return deleted;
    }
    async removeImages(filesWithDir) {
        const observer$ = StockAuthClient.ehttp
            .makePut('/user/delete/images', { filesWithDir, user: { _id: this._id } });
        const deleted = await lastValueFrom(observer$);
        const toStrings = filesWithDir.map(val => val._id);
        this.photos = this.photos.filter(val => !toStrings.includes(val._id));
        return deleted;
    }
    appendUpdate(data) {
        if (data) {
            this.urId = data.urId;
            if (data.companyId) {
                this.companyId = new Company(data.companyId);
            }
            this.fname = data.fname || this.fname;
            this.lname = data.lname || this.lname;
            this.companyName = data.companyName || this.companyName;
            this.email = data.email || this.email;
            this.address = data.address || this.address;
            this.billing = data.billing || this.billing;
            this.uid = data.uid || this.uid;
            this.did = data.did || this.did;
            this.aid = data.aid || this.aid;
            this.photos = data.photos || this.photos;
            this.profilePic = data.profilePic || this.profilePic;
            this.profileCoverPic = data.profileCoverPic || this.profileCoverPic;
            this.permissions = data.permissions || this.permissions;
            this.phone = data.phone || this.phone;
            this.amountDue = data.amountDue || this.amountDue;
            this.manuallyAdded = data.manuallyAdded;
            this.names = this.fname + ' ' + this.lname;
            this.salutation = data.salutation || this.salutation;
            this.extraCompanyDetails = data.extraCompanyDetails || this.extraCompanyDetails;
            this.userDispNameFormat = data.userDispNameFormat || this.userDispNameFormat;
            this.userType = data.userType || this.userType;
            this.verified = data.verified || this.verified;
        }
    }
}
//# sourceMappingURL=user.define.js.map
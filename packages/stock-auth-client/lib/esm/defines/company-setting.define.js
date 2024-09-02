import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockAuthClient } from '../stock-auth-client';
export class CompanySetting extends DatabaseAuto {
    /**
     * Creates a new CompanySetting from the given data.
     * @param data The data to create the CompanySetting with.
     */
    constructor(data) {
        super(data);
        this.companyId = data.companyId;
        this.trashPeriod = data.trashPeriod;
    }
    /**
     * Retrieves multiple company settings from the server, with optional offset and limit parameters.
     * @param companyId - The ID of the company
     * @param offset - The offset to start retrieving the company settings from (default is 0).
     * @param limit - The maximum number of company settings to retrieve (default is 20).
     * @returns An object containing the total count of company settings and the list of company settings.
     */
    static async getCompanySetting(companyId, offset = 0, limit = 20) {
        const observer$ = StockAuthClient.ehttp.makeGet(`/companysetting/getall/${offset}/${limit}/${companyId}`);
        const companys = await lastValueFrom(observer$);
        return {
            count: companys.count,
            companys: companys.data.map(val => new CompanySetting(val))
        };
    }
    /**
     * Retrieves a single company setting based on its ID.
     * @param companyId - The ID of the company
     * @param urId - The ID of the company setting to retrieve.
     * @returns A single CompanySetting object.
     */
    static async getOneCompanySetting(companyId, urId) {
        const observer$ = StockAuthClient.ehttp.makeGet(`/companysetting/getone/${urId}/${companyId}`);
        const company = await lastValueFrom(observer$);
        return new CompanySetting(company);
    }
    static async addCompanySetting(companyId, vals, files) {
        let added;
        if (files && files[0]) {
            const observer$ = StockAuthClient.ehttp.uploadFiles(files, `/companysetting/addcompanyimg/${companyId}`, vals);
            added = await lastValueFrom(observer$);
        }
        else {
            const observer$ = StockAuthClient.ehttp.makePost('/companysetting/addcompany', vals);
            added = await lastValueFrom(observer$);
        }
        return added;
    }
    /**
     * Deletes multiple company settings objects from the server based on their IDs.
     * @param companyId - The ID of the company
     * @param ids - An array of IDs of the company settings objects to delete.
     * @param filesWithDir - An array of file metadata objects to delete.
     * @returns A success object indicating whether the company settings were deleted successfully.
     */
    static async deleteCompanySetting(companyId, ids, filesWithDir) {
        const observer$ = StockAuthClient.ehttp.makePut(`/companysetting/deletemany/${companyId}`, { ids, filesWithDir });
        return await lastValueFrom(observer$);
    }
    /**
     * Updates a company setting object on the server based on its ID and the properties provided in the vals object.
     * @param companyId - The ID of the company
     * @param vals - The properties to update the company setting with.
     * @param formtype - The type of form being updated.
     * @param files - Optional array of files to upload with the update.
     * @returns A success object indicating whether the update was successful.
     */
    async updateCompanySetting(companyId, vals, formtype, files) {
        const observer$ = StockAuthClient.ehttp
            .makePut(`/companysetting/updateone/${formtype}/${companyId}`, vals);
        const updated = await lastValueFrom(observer$);
        if (updated.success) {
            this.appendUpdate(vals.companydetails);
        }
        return updated;
    }
    /**
     * Deletes a company setting object from the server based on its ID.
     * @param companyId - The ID of the company
     * @returns A success object indicating whether the company setting was deleted successfully.
     */
    async deleteCompany(companyId) {
        const observer$ = StockAuthClient.ehttp
            .makePut(`/companysetting/deleteone/${companyId}`, {
            _id: this._id
        });
        const deleted = await lastValueFrom(observer$);
        return deleted;
    }
    appendUpdate(data) {
        if (data) {
            this.companyId = data.companyId;
            this.trashPeriod = data.trashPeriod;
        }
    }
}
//# sourceMappingURL=company-setting.define.js.map
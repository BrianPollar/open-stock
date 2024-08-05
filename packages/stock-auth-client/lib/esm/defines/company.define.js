import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockAuthClient } from '../stock-auth-client';
import { User } from './user.define';
/**
 * Represents a company and extends the DatabaseAuto class. It has properties that
 * correspond to the fields in the company object, and methods for updating, deleting, a
 * nd managing the company's profile, addresses, and permissions.
 */
export class Company extends DatabaseAuto {
    /**
     * Creates a new Company instance.
     * @param data The data to initialize the Company instance with.
     */
    constructor(data) {
        super(data);
        this.appendUpdate(data);
    }
    /**
     * Retrieves multiple companys from a specified URL, with optional offset and limit parameters.
     * @param companyId - The ID of the company
     * @param url The URL to retrieve the companys from.
     * @param offset The offset to start retrieving companys from.
     * @param limit The maximum number of companys to retrieve.
     * @returns An array of Company instances created from the retrieved company objects.
     */
    static async getCompanys(companyId, offset = 0, limit = 20) {
        const observer$ = StockAuthClient.ehttp.makeGet(`/company/getcompanys/${offset}/${limit}/${companyId}`);
        const companys = await lastValueFrom(observer$);
        return {
            count: companys.count,
            companys: companys.data.map(val => new Company(val))
        };
    }
    /**
     * Retrieves a single company based on the provided company ID.
     * @param companyId - The ID of the company
     * @param urId The ID of the company to retrieve.
     * @returns A Company instance created from the retrieved company object.
     */
    static async getOneCompany(companyId, urId) {
        const observer$ = StockAuthClient.ehttp.makeGet(`/company/getonecompany/${urId}/${companyId}`);
        const company = await lastValueFrom(observer$);
        return new Company(company);
    }
    /**
     * Adds a new company with the provided values and optional files.
     * @param companyId - The ID of the company
     * @param vals The values to add the company with.
     * @param files Optional files to upload with the company.
     * @returns A success object indicating whether the company was added successfully.
     */
    static async addCompany(companyId, vals, files) {
        let added;
        if (files && files[0]) {
            const observer$ = StockAuthClient.ehttp.uploadFiles(files, `/company/addcompanyimg/${companyId}`, vals);
            added = await lastValueFrom(observer$);
        }
        else {
            const observer$ = StockAuthClient.ehttp.makePost('/company/addcompany', vals);
            added = await lastValueFrom(observer$);
        }
        return added;
    }
    /**
     * Deletes multiple companys based on the provided company IDs and files with directories.
     * @param companyId - The ID of the company
     * @param ids The IDs of the companys to delete.
     * @param filesWithDir The files with directories to delete.
     * @returns A success object indicating whether the companys were deleted successfully.
     */
    static async deleteCompanys(companyId, ids, filesWithDir) {
        const observer$ = StockAuthClient.ehttp.makePut(`/company/deletemany/${companyId}`, { ids, filesWithDir });
        return await lastValueFrom(observer$);
    }
    /**
     * Updates the company's profile with the provided values and optional files.
     * @param companyId - The ID of the company
     * @param vals The values to update the company's profile with.
     * @param files Optional files to upload with the company.
     * @returns A success object indicating whether the company was updated successfully.
     */
    async updateCompanyBulk(companyId, vals, files) {
        vals.company._id = this._id;
        let added;
        if (files && files[0]) {
            const observer$ = StockAuthClient.ehttp.uploadFiles(files, `/company/updatecompanybulkimg/${companyId}`, vals);
            added = await lastValueFrom(observer$);
        }
        else {
            const observer$ = StockAuthClient.ehttp.makePut(`/company/updatecompanybulk/${companyId}`, vals);
            added = await lastValueFrom(observer$);
        }
        return added;
    }
    /**
     * Updates a company's information.
     * @param companyId - The ID of the company
     * @param vals - The updated values for the company.
     * @param formtype - The type of form being updated.
     * @param files - Optional array of files to upload.
     * @returns A promise that resolves to the updated company information.
     */
    async updateCompany(companyId, vals, formtype, files) {
        let updated;
        if (files && files.length > 0) {
            const observer$ = StockAuthClient.ehttp
                .uploadFiles(files, '/company/updateprofileimg', vals);
            updated = await lastValueFrom(observer$);
        }
        else {
            const observer$ = StockAuthClient.ehttp
                .makePut(`/company/updateprofile/${formtype}/${companyId}`, vals);
            updated = await lastValueFrom(observer$);
        }
        if (updated.success) {
            this.appendUpdate(vals.companydetails);
        }
        return updated;
    }
    /**
     * Deletes images associated with a company.
     * @param companyId - The ID of the company.
     * @param filesWithDir - An array of file metadata objects.
     * @returns A promise that resolves to the success status of the deletion.
     */
    async deleteImages(companyId, filesWithDir) {
        const observer$ = StockAuthClient.ehttp
            .makePut(`/company/deleteimages/${companyId}`, { filesWithDir, company: { _id: this._id } });
        const deleted = await lastValueFrom(observer$);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        const toStrings = filesWithDir.map(val => val._id);
        this.photos = this.photos.filter(val => !toStrings.includes(val._id));
        return deleted;
    }
    /**
     * Deletes a company by its ID.
     * @param companyId The ID of the company to delete.
     * @returns A promise that resolves to the deleted company.
     */
    async deleteCompany(companyId) {
        const observer$ = StockAuthClient.ehttp
            .makePut(`/company/deleteone/${companyId}`, {
            _id: this._id,
            filesWithDir: [{
                    filename: this.profilePic
                },
                {
                    filename: this.profileCoverPic
                }
            ]
        });
        const deleted = await lastValueFrom(observer$);
        return deleted;
    }
    /**
     * Updates the company object with the provided data.
     * If a property is not provided in the data object, it remains unchanged.
     * @param data - The data object containing the properties to update.
     */
    appendUpdate(data) {
        if (data) {
            this.urId = data.urId || this.urId;
            this.name = data.name || this.name;
            this.displayName = data.displayName || this.displayName;
            this.dateOfEst = data.dateOfEst || this.dateOfEst;
            this.details = data.details || this.details;
            this.businessType = data.businessType || this.businessType;
            this.profilePic = data.profilePic || this.profilePic;
            this.profileCoverPic = data.profileCoverPic || this.profileCoverPic;
            this.photos = data.photos || this.photos;
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
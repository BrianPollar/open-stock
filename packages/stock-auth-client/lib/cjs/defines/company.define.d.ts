import { DatabaseAuto, IblockedReasons, Icompany, Ifile, IfileMeta, Isuccess } from '@open-stock/stock-universal';
/**
 * Represents a company and extends the DatabaseAuto class. It has properties that correspond to the fields in the company object, and methods for updating, deleting, and managing the company's profile, addresses, and permissions.
 */
export declare class Company extends DatabaseAuto {
    urId: string;
    name: string;
    displayName: string;
    dateOfEst: string;
    details: string;
    businessType: string;
    profilePic: IfileMeta;
    profileCoverPic: IfileMeta;
    photos: IfileMeta[];
    websiteAddress: string;
    pesapalCallbackUrl: string;
    pesapalCancellationUrl: string;
    blockedReasons: IblockedReasons;
    left: boolean;
    dateLeft: Date;
    blocked: boolean;
    verified: boolean;
    /**
     * Creates a new Company instance.
     * @param data The data to initialize the Company instance with.
     */
    constructor(data: Icompany);
    /**
     * Retrieves multiple companys from a specified URL, with optional offset and limit parameters.
     * @param companyId - The ID of the company
     * @param url The URL to retrieve the companys from.
     * @param offset The offset to start retrieving companys from.
     * @param limit The maximum number of companys to retrieve.
     * @returns An array of Company instances created from the retrieved company objects.
     */
    static getCompanys(companyId: string, url: string, offset?: number, limit?: number): Promise<Company[]>;
    /**
     * Retrieves a single company based on the provided company ID.
     * @param companyId - The ID of the company
     * @param urId The ID of the company to retrieve.
     * @returns A Company instance created from the retrieved company object.
     */
    static getOneCompany(companyId: string, urId: string): Promise<Company>;
    /**
     * Adds a new company with the provided values and optional files.
     * @param companyId - The ID of the company
     * @param vals The values to add the company with.
     * @param files Optional files to upload with the company.
     * @returns A success object indicating whether the company was added successfully.
     */
    static addCompany(companyId: string, vals: Icompany, files?: Ifile[]): Promise<Isuccess>;
    /**
     * Deletes multiple companys based on the provided company IDs and files with directories.
     * @param companyId - The ID of the company
     * @param ids The IDs of the companys to delete.
     * @param filesWithDir The files with directories to delete.
     * @returns A success object indicating whether the companys were deleted successfully.
     */
    static deleteCompanys(companyId: string, ids: string[], filesWithDir: IfileMeta[]): Promise<Isuccess>;
    /**
     * Updates the company's profile with the provided values and optional files.
     * @param companyId - The ID of the company
     * @param vals The values to update the company's profile with.
     * @param files Optional files to upload with the company.
     * @returns A success object indicating whether the company was updated successfully.
     */
    updateCompanyBulk(companyId: string, vals: Icompany, files?: Ifile[]): Promise<Isuccess>;
    /**
     * Updates a company's information.
     * @param companyId - The ID of the company
     * @param vals - The updated values for the company.
     * @param formtype - The type of form being updated.
     * @param files - Optional array of files to upload.
     * @returns A promise that resolves to the updated company information.
     */
    updateCompany(companyId: string, vals: any, formtype: string, files?: Ifile[]): Promise<Isuccess>;
    /**
     * Deletes images associated with a company.
     * @param companyId - The ID of the company.
     * @param filesWithDir - An array of file metadata objects.
     * @returns A promise that resolves to the success status of the deletion.
     */
    deleteImages(companyId: string, filesWithDir: IfileMeta[]): Promise<Isuccess>;
    /**
     * Deletes a company by its ID.
     * @param companyId The ID of the company to delete.
     * @returns A promise that resolves to the deleted company.
     */
    deleteCompany(companyId: string): Promise<Isuccess>;
    /**
     * Updates the company object with the provided data.
     * If a property is not provided in the data object, it remains unchanged.
     * @param data - The data object containing the properties to update.
     */
    appendUpdate(data: Icompany): void;
}

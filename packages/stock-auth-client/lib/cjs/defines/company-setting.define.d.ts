import { DatabaseAuto, Icompany, Ifile, IfileMeta, Isuccess, Iuser } from '@open-stock/stock-universal';
export declare class CompanySetting extends DatabaseAuto {
    companyId: string;
    trashPeriod: string;
    /**
     * Creates a new CompanySetting from the given data.
     * @param data The data to create the CompanySetting with.
     */
    constructor(data: any);
    /**
     * Retrieves multiple company settings from the server, with optional offset and limit parameters.
     * @param companyId - The ID of the company
     * @param offset - The offset to start retrieving the company settings from (default is 0).
     * @param limit - The maximum number of company settings to retrieve (default is 20).
     * @returns An object containing the total count of company settings and the list of company settings.
     */
    static getCompanySetting(companyId: string, offset?: number, limit?: number): Promise<{
        count: number;
        companys: CompanySetting[];
    }>;
    /**
     * Retrieves a single company setting based on its ID.
     * @param companyId - The ID of the company
     * @param urId - The ID of the company setting to retrieve.
     * @returns A single CompanySetting object.
     */
    static getOneCompanySetting(companyId: string, urId: string): Promise<CompanySetting>;
    static addCompanySetting(companyId: string, vals: {
        company: Icompany;
        user: Partial<Iuser>;
    }, files?: Ifile[]): Promise<Isuccess>;
    /**
     * Deletes multiple company settings objects from the server based on their IDs.
     * @param companyId - The ID of the company
     * @param ids - An array of IDs of the company settings objects to delete.
     * @param filesWithDir - An array of file metadata objects to delete.
     * @returns A success object indicating whether the company settings were deleted successfully.
     */
    static deleteCompanySetting(companyId: string, ids: string[], filesWithDir: IfileMeta[]): Promise<Isuccess>;
    /**
     * Updates a company setting object on the server based on its ID and the properties provided in the vals object.
     * @param companyId - The ID of the company
     * @param vals - The properties to update the company setting with.
     * @param formtype - The type of form being updated.
     * @param files - Optional array of files to upload with the update.
     * @returns A success object indicating whether the update was successful.
     */
    updateCompanySetting(companyId: string, vals: any, formtype: string, files?: Ifile[]): Promise<Isuccess>;
    /**
     * Deletes a company setting object from the server based on its ID.
     * @param companyId - The ID of the company
     * @returns A success object indicating whether the company setting was deleted successfully.
     */
    deleteCompany(companyId: string): Promise<Isuccess>;
    appendUpdate(data: any): void;
}

import { IdeleteMany, IdeleteOne, IeditStaff, Ifile, IfilterProps, Isalary, Istaff, IsubscriptionFeatureState, Isuccess } from '@open-stock/stock-universal';
import { UserBase } from './userbase.define';
interface IgetOneFilter {
    _id?: string;
    userId?: string;
    companyId?: string;
}
export declare class Staff extends UserBase {
    employmentType: string;
    salary: Isalary;
    /**
     * Creates an instance of Staff.
     * @param {Istaff} data - The data for the staff member.
     */
    constructor(data: Istaff);
    /**
     * Retrieves all staff members.
  
     * @param {number} [offset=0] - The offset to start retrieving staff members from.
     * @param {number} [limit=0] - The maximum number of staff members to retrieve.
     * @returns {Promise<Staff[]>} - A promise that resolves to an array of Staff instances.
     */
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        staffs: Staff[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        staffs: Staff[];
    }>;
    /**
     * Retrieves all staff members.
  
     * @param {number} [offset=0] - The offset to start retrieving staff members from.
     * @param {number} [limit=0] - The maximum number of staff members to retrieve.
     * @returns {Promise<Staff[]>} - A promise that resolves to an array of Staff instances.
     */
    static getByRole(role: string, offset?: number, limit?: number): Promise<{
        count: number;
        staffs: Staff[];
    }>;
    /**
     * Retrieves a single staff member by ID.
  
     * @param {string} id - The ID of the staff member to retrieve.
     * @returns {Promise<Staff>} - A promise that resolves to a Staff instance.
     */
    static getOne(filter: IgetOneFilter): Promise<Staff>;
    /**
     * Creates a new staff member.
  
     * @param {Istaff} staff - The data for the new staff member.
     * @returns {Promise<Isuccess>} - A promise that resolves to a success message.
     */
    static add(vals: IeditStaff, files?: Ifile[]): Promise<IsubscriptionFeatureState>;
    /**
     * Deletes multiple staff members.
  
     * @param {IdeleteCredentialsLocalUser[]} credentials - The credentials of the staff members to delete.
     * @param {Ifilewithdir[]} filesWithDir - The files and directories associated with the staff members to delete.
     * @returns {Promise<Isuccess>} - A promise that resolves to a success message.
     */
    static removeMany(vals: IdeleteMany): Promise<Isuccess>;
    /**
     * Updates the current staff member's employmentType
     * and salary properties with the values provided in the  vals  parameter, if they are present.
     * It then makes a PUT request to the server API to update the staff member's information.
  
     * @param {Istaff} vals - The new values for the staff member.
     * @returns {Promise<Isuccess>} - A promise that resolves to a success message.
     */
    update(vals: IeditStaff, files: Ifile[]): Promise<Isuccess>;
    /**
     * Deletes the current staff member.
  
     * @param {IdeleteCredentialsLocalUser} credential - The credentials of the staff member to delete.
     * @param {Ifilewithdir[]} filesWithDir - The files and directories associated with the staff member to delete.
     * @returns {Promise<Isuccess>} - A promise that resolves to a success message.
     */
    remove(val: IdeleteOne): Promise<Isuccess>;
}
export {};

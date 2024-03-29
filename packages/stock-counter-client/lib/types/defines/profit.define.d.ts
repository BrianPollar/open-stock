import { DatabaseAuto, IfileMeta, Iprofit, Isuccess } from '@open-stock/stock-universal';
/**
 * Represents a Profit object.
 * @class
 * @extends DatabaseAuto
 */
export declare class Profit extends DatabaseAuto {
    /** The margin of the Profit object. */
    margin: number;
    /** The original cost of the Profit object. */
    origCost: number;
    /** The sold price of the Profit object. */
    soldAtPrice: number;
    /**
     * Creates a new Profit object.
     * @constructor
     * @param {Iprofit} data - The data to create the Profit object.
     */
    constructor(data: Iprofit);
    /**
     * Gets all Profit objects.
     * @static
     * @async
     * @param {string} url - The URL to get the Profit objects from.
     * @param {number} offset - The offset to start getting Profit objects from.
     * @param {number} limit - The maximum number of Profit objects to get.
     * @returns {Promise<Profit[]>} - A Promise that resolves to an array of Profit objects.
     */
    static getProfits(companyId: string, url?: string, offset?: number, limit?: number): Promise<{
        count: number;
        profits: Profit[];
    }>;
    /**
     * Gets a single Profit object by ID.
     * @static
     * @async
     * @param companyId - The ID of the company
     * @param {string} id - The ID of the Profit object to get.
     * @returns {Promise<Profit>} - A Promise that resolves to a single Profit object.
     */
    static getOneProfit(companyId: string, id: string): Promise<Profit>;
    /**
     * Adds a new Profit object.
     * @static
     * @async
     * @param companyId - The ID of the company
     * @param {Iprofit} vals - The data to create the new Profit object.
     * @returns {Promise<Isuccess>} - A Promise that resolves to a success message.
     */
    static addProfit(companyId: string, vals: Iprofit): Promise<Isuccess>;
    /**
     * Deletes multiple Profit objects.
     * @static
     * @async
     * @param companyId - The ID of the company
     * @param {string[]} ids - The IDs of the Profit objects to delete.
     * @param {IfileMeta} filesWithDir - The files and directories to delete.
     * @param {string} url - The URL to delete the Profit objects from.
     * @returns {Promise<Isuccess>} - A Promise that resolves to a success message.
     */
    static deleteProfits(companyId: string, ids: string[], filesWithDir: IfileMeta[], url: string): Promise<Isuccess>;
    /**
     * Updates a single Profit object.
     * @async
     * @param companyId - The ID of the company
     * @param {Iprofit} vals - The data to update the Profit object.
     * @returns {Promise<Isuccess>} - A Promise that resolves to a success message.
     */
    updateProfit(companyId: string, vals: Iprofit): Promise<Isuccess>;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackEdit = void 0;
const rxjs_1 = require("rxjs");
const stock_universal_1 = require("../../stock-universal");
const base_define_1 = require("../base/base.define");
class TrackEdit extends base_define_1.DatabaseAuto {
    /**
     * Constructor for TrackEdit
     * @param data the data to initialize the TrackEdit object
     */
    constructor(data) {
        super(data);
        this.parent = data.parent;
        this.createdBy = data.createdBy;
        this.users = data.users;
        this.deletedBy = data.deletedBy;
    }
    /**
     * Get a track edit document by parent id
     * @param parent the parent id to query
     * @returns a TrackEdit object
     */
    static async getByParent(parent) {
        const observer$ = stock_universal_1.StockUniversal.ehttp.makeGet(`/track/gettrackeditbyparent/${parent}`);
        const edit = await (0, rxjs_1.lastValueFrom)(observer$);
        return new TrackEdit(edit);
    }
    /**
     * Get track edits made by a user
     * @param userId the id of the user to query
     * @param offset the offset of the results to return
     * @param limit the maximum number of results to return
     * @returns a promise resolving to an object containing the count of all track edits made by the user and an array of track edits
     */
    static async getByUser(userId, offset = 0, limit = 20) {
        const observer$ = stock_universal_1.StockUniversal.ehttp.makeGet(`/track/gettrackeditbyuser/${offset}/${limit}/${userId}`);
        const edits = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: edits.count,
            trackEdits: edits.data.map(val => new TrackEdit(val))
        };
    }
    /**
     * Get all track edits
     * @param offset the offset of the results to return
     * @param limit the maximum number of results to return
     * @returns a promise resolving to an object containing the count of all track edits and an array of track edits
     */
    static async getAll(offset = 0, limit = 20) {
        const observer$ = stock_universal_1.StockUniversal.ehttp.makeGet(`/track/gettrackedit/${offset}/${limit}`);
        const edits = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: edits.count,
            trackEdits: edits.data.map(val => new TrackEdit(val))
        };
    }
    /**
     * Delete a track edit
     * @param id the id of the track edit to delete
     * @returns a promise resolving to an object containing a boolean indicating success
     */
    static async deleteOne(id) {
        const observer$ = stock_universal_1.StockUniversal.ehttp.makeDelete(`/track/deletetrackedit/${id}`);
        const deleted = await (0, rxjs_1.lastValueFrom)(observer$);
        return deleted;
    }
}
exports.TrackEdit = TrackEdit;
//# sourceMappingURL=track-edit.define.js.map
import { lastValueFrom } from 'rxjs';
import { StockUniversal } from '../../stock-universal';
import { DatabaseAuto } from '../base/base.define';
export class TrackEdit extends DatabaseAuto {
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
        const observer$ = StockUniversal.ehttp.makeGet(`/track/gettrackeditbyparent/${parent}`);
        const edit = await lastValueFrom(observer$);
        return new TrackEdit(edit);
    }
    /**
     * Get track edits made by a user
     * @param userId the id of the user to query
     * @param offset the offset of the results to return
     * @param limit the maximum number of results to return
     * @returns a promise resolving to an object containing
     * the count of all track edits made by the user and an array of track edits
     */
    static async getByUser(userId, offset = 0, limit = 20) {
        const observer$ = StockUniversal
            .ehttp.makeGet(`/track/gettrackeditbyuser/${offset}/${limit}/${userId}`);
        const edits = await lastValueFrom(observer$);
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
        const observer$ = StockUniversal
            .ehttp.makeGet(`/track/gettrackedit/${offset}/${limit}`);
        const edits = await lastValueFrom(observer$);
        return {
            count: edits.count,
            trackEdits: edits.data.map(val => new TrackEdit(val))
        };
    }
    /**
     * Delete a track edit
     * @param _id the id of the track edit to delete
     * @returns a promise resolving to an object containing a boolean indicating success
     */
    static async deleteOne(_id) {
        const observer$ = StockUniversal.ehttp.makeDelete(`/track/deletetrackedit/${_id}`);
        const deleted = await lastValueFrom(observer$);
        return deleted;
    }
}
//# sourceMappingURL=track-edit.define.js.map
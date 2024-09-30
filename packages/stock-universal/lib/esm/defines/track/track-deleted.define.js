import { lastValueFrom } from 'rxjs';
import { StockUniversal } from '../../stock-universal';
import { DatabaseAuto } from '../base/base.define';
export class TrackDeleted extends DatabaseAuto {
    constructor(data) {
        super(data);
        this.parent = data.parent;
        this.deletedAt = data.deletedAt;
    }
    /**
     * Get all trackDeleteds, paginated.
     *
     * @param offset - The offset from which to return the trackDeleteds.
     * @param limit - The maximum number of trackDeleteds to return.
     * @returns An object containing the total count of trackDeleteds and an array of the trackDeleteds.
     */
    static async getAll(offset = 0, limit = 20) {
        const observer$ = StockUniversal
            .ehttp.makeGet(`/track/gettrackdelete/${offset}/${limit}`);
        const edits = await lastValueFrom(observer$);
        return {
            count: edits.count,
            trackDeleteds: edits.data.map(val => new TrackDeleted(val))
        };
    }
    /**
     * Deletes a trackDeleted by id.
     *
     * @param _id - The id of the trackDeleted to delete.
     * @returns A boolean indicating whether the trackDeleted was successfully deleted.
     */
    static async deleteOne(_id) {
        const observer$ = StockUniversal.ehttp.makeDelete(`/track/deletetrackdelete/${_id}`);
        const deleted = await lastValueFrom(observer$);
        return deleted;
    }
}
//# sourceMappingURL=track-deleted.define.js.map
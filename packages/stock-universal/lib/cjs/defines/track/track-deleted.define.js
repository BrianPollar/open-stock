"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackDeleted = void 0;
const rxjs_1 = require("rxjs");
const stock_universal_1 = require("../../stock-universal");
const base_define_1 = require("../base/base.define");
class TrackDeleted extends base_define_1.DatabaseAuto {
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
        const observer$ = stock_universal_1.StockUniversal
            .ehttp.makeGet(`/track/gettrackdelete/${offset}/${limit}`);
        const edits = await (0, rxjs_1.lastValueFrom)(observer$);
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
        const observer$ = stock_universal_1.StockUniversal.ehttp.makeDelete(`/track/deletetrackdelete/${_id}`);
        const deleted = await (0, rxjs_1.lastValueFrom)(observer$);
        return deleted;
    }
}
exports.TrackDeleted = TrackDeleted;
//# sourceMappingURL=track-deleted.define.js.map
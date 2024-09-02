"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackView = void 0;
const rxjs_1 = require("rxjs");
const stock_universal_1 = require("../../stock-universal");
const base_define_1 = require("../base/base.define");
class TrackView extends base_define_1.DatabaseAuto {
    /**
     * Constructor for TrackView
     * @param data the data to initialize the TrackView object
     */
    constructor(data) {
        super(data);
        this.parent = data.parent;
        this.users = data.users;
    }
    static async getByDates(url, filters, offset = 0, limit = 40) {
        const observer$ = stock_universal_1.StockUniversal.ehttp.makePost(`/track/${url}${offset}/${limit}`, filters);
        const views = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: views.count,
            trackViews: views.data.map(val => new TrackView(val))
        };
    }
    /**
     * Get a track view document by parent id
     * @param parent the parent id to query
     * @returns a TrackView object
     */
    static async getByParent(parent) {
        const observer$ = stock_universal_1.StockUniversal.ehttp.makeGet(`/track/gettrackviewbyparent/${parent}`);
        const view = await (0, rxjs_1.lastValueFrom)(observer$);
        return new TrackView(view);
    }
    /**
     * Get track views for a user
     * @param userId the user id to query
     * @param offset the offset of the query
     * @param limit the limit of the query
     * @returns a TrackView object with a count of the total results and an array of track views
     */
    static async getByUser(userId, offset = 0, limit = 20) {
        const observer$ = stock_universal_1.StockUniversal.ehttp.makeGet(`/track/gettrackviewbyuser/${offset}/${limit}/${userId}`);
        const views = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: views.count,
            trackViews: views.data.map(val => new TrackView(val))
        };
    }
    /**
     * Get all track views
     * @param offset the offset of the query
     * @param limit the limit of the query
     * @returns a TrackView object with a count of the total results and an array of track views
     */
    static async getAll(offset = 0, limit = 20) {
        const observer$ = stock_universal_1.StockUniversal.ehttp.makeGet(`/track/gettrackview/${offset}/${limit}`);
        const views = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: views.count,
            trackViews: views.data.map(val => new TrackView(val))
        };
    }
    /**
     * Deletes a track view by id.
     *
     * @param id the id of the track view to delete.
     * @returns a boolean indicating whether the track view was successfully deleted.
     */
    static async deleteOne(id) {
        const observer$ = stock_universal_1.StockUniversal.ehttp.makeDelete(`/track/deletetrackview/${id}`);
        const deleted = await (0, rxjs_1.lastValueFrom)(observer$);
        return deleted;
    }
}
exports.TrackView = TrackView;
//# sourceMappingURL=track-view.define.js.map
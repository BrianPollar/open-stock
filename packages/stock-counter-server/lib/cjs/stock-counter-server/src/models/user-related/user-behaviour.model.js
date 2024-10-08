"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserBehaviourModel = exports.userBehaviourSelect = exports.userBehaviourLean = exports.userBehaviourMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const database_1 = require("../../utils/database");
const userBehaviourSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.globalSchemaObj,
    user: { type: String, index: true },
    userCookieId: { type: String, required: [true, 'cannot be empty.'], index: true },
    recents: [],
    cart: [],
    wishList: [],
    compareList: [],
    searchTerms: [],
    expireAt: { type: String }
}, { timestamps: true, collection: 'userbehaviours' });
userBehaviourSchema.index({ expireAt: 1 }, { expireAfterSeconds: 7.884e+6 }); // expire After 3 months
userBehaviourSchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
userBehaviourSchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
const userBehaviourselect = {
    ...stock_universal_server_1.globalSelectObj,
    user: 1,
    userCookieId: 1,
    recents: 1,
    cart: 1,
    wishList: 1,
    compareList: 1,
    searchTerms: 1
};
exports.userBehaviourSelect = userBehaviourselect;
/**
 * Creates a review model with the specified database URL, main connection flag, and lean flag.
 * @param dbUrl The URL of the database.
 * @param main Indicates whether to create the main connection model.
 * @param lean Indicates whether to create the lean connection model.
 */
const createUserBehaviourModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(userBehaviourSchema);
    if (!database_1.isStockDbConnected) {
        await (0, database_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.userBehaviourMain = database_1.mainConnection.model('UserBehaviour', userBehaviourSchema);
    }
    if (lean) {
        exports.userBehaviourLean = database_1.mainConnectionLean.model('UserBehaviour', userBehaviourSchema);
    }
};
exports.createUserBehaviourModel = createUserBehaviourModel;
//# sourceMappingURL=user-behaviour.model.js.map
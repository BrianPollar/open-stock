import { createExpireDocIndex, globalSchemaObj, globalSelectObj, preUpdateDocExpire } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../utils/database';
const userBehaviourSchema = new Schema({
    ...globalSchemaObj,
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
    return preUpdateDocExpire(this, next);
});
userBehaviourSchema.pre('updateMany', function (next) {
    return preUpdateDocExpire(this, next);
});
const userBehaviourselect = {
    ...globalSelectObj,
    user: 1,
    userCookieId: 1,
    recents: 1,
    cart: 1,
    wishList: 1,
    compareList: 1,
    searchTerms: 1
};
/**
 * Represents the main Mongoose model for the user behaviour data, including recent activity, cart, wishlist, compare list, and search terms.
 * This model is used for the main database connection.
 */
export let userBehaviourMain;
/**
 * Represents the lean Mongoose model for the user behaviour data, including recent activity, cart, wishlist, compare list, and search terms.
 * This model is used for the lean database connection, which provides a more optimized and efficient way of querying the data.
 */
export let userBehaviourLean;
export const userBehaviourSelect = userBehaviourselect;
/**
 * Creates a review model with the specified database URL, main connection flag, and lean flag.
 * @param dbUrl The URL of the database.
 * @param main Indicates whether to create the main connection model.
 * @param lean Indicates whether to create the lean connection model.
 */
export const createUserBehaviourModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    createExpireDocIndex(userBehaviourSchema);
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl, dbOptions);
    }
    if (main) {
        userBehaviourMain = mainConnection.model('UserBehaviour', userBehaviourSchema);
    }
    if (lean) {
        userBehaviourLean = mainConnectionLean.model('UserBehaviour', userBehaviourSchema);
    }
};
//# sourceMappingURL=user-behaviour.model.js.map
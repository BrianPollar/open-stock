"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubscriptionModel = exports.subscriptionSelect = exports.subscriptionLean = exports.subscriptionMain = void 0;
const mongoose_1 = require("mongoose");
// import { PushSubscription } from 'web-push';
const database_controller_1 = require("../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const subscriptionSchema = new mongoose_1.Schema({
    subscription: {},
    userId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true }
}, { timestamps: true });
// Apply the uniqueValidator plugin to subscriptionSchema.
subscriptionSchema.plugin(uniqueValidator);
/** primary selection object
 * for notification
 */
const subscriptionselect = {
    subscription: 1,
    userId: 1
};
/** primary selection object
 * for notification
 */
/** */
exports.subscriptionSelect = subscriptionselect;
/** */
const createSubscriptionModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isNotifDbConnected) {
        await (0, database_controller_1.connectNotifDatabase)(dbUrl);
    }
    if (main) {
        exports.subscriptionMain = database_controller_1.mainConnection.model('Subscription', subscriptionSchema);
    }
    if (lean) {
        exports.subscriptionLean = database_controller_1.mainConnectionLean.model('Subscription', subscriptionSchema);
    }
};
exports.createSubscriptionModel = createSubscriptionModel;
//# sourceMappingURL=subscriptions.model.js.map
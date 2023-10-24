import { Schema } from 'mongoose';
// import { PushSubscription } from 'web-push';
import { connectNotifDatabase, isNotifDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const subscriptionSchema = new Schema({
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
/** main connection for notifications Operations*/
export let subscriptionMain;
/** lean connection for notifications Operations*/
export let subscriptionLean;
/** primary selection object
 * for notification
 */
/** */
export const subscriptionSelect = subscriptionselect;
/** */
export const createSubscriptionModel = async (dbUrl, main = true, lean = true) => {
    if (!isNotifDbConnected) {
        await connectNotifDatabase(dbUrl);
    }
    if (main) {
        subscriptionMain = mainConnection.model('Subscription', subscriptionSchema);
    }
    if (lean) {
        subscriptionLean = mainConnectionLean.model('Subscription', subscriptionSchema);
    }
};
//# sourceMappingURL=subscriptions.model.js.map
/**
 * @fileoverview This file contains the Mongoose schema and model for the main notification object.
 * @packageDocumentation
 */
import { connectDatabase, createExpireDocIndex, globalSchemaObj, isDbConnected, mainConnection, mainConnectionLean } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
/** Mongoose schema for the main notification object. */
const mainnotificationSchema = new Schema({
    ...globalSchemaObj,
    actions: [{
            action: { type: String },
            title: { type: String },
            operation: { type: String },
            url: { type: String }
        }],
    userId: { type: Schema.Types.ObjectId, required: [true, 'cannot be empty.'], index: true },
    title: { type: String, required: [true, 'cannot be empty.'] },
    body: { type: String, required: [true, 'cannot be empty.'] },
    icon: { type: String },
    expireAt: { type: Number, required: [true, 'cannot be empty.'] },
    notifType: { type: String, required: [true, 'cannot be empty.'] },
    notifInvokerId: { type: String },
    active: { type: Boolean, default: true },
    viewed: [] // strings of ObjectId
}, { timestamps: true, collection: 'mainnotifications' });
mainnotificationSchema.index({ createdAt: -1 });
/** Index for the expiration time of the notification. */
mainnotificationSchema
    .index({ expireAt: 1 }, { expireAfterSeconds: 2628003 });
/**
 * Represents the main notification model.
 */
export let mainnotificationMain;
/**
 * Represents the mainnotificationLean variable.
 */
export let mainnotificationLean;
/**
 * Creates the Mongoose models for the main notification object.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main Mongoose model or not.
 * @param lean Whether to create the lean Mongoose model or not.
 */
export const createNotificationsModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    createExpireDocIndex(mainnotificationSchema);
    if (!isDbConnected) {
        await connectDatabase(dbUrl, dbOptions);
    }
    if (main) {
        mainnotificationMain = mainConnection
            .model('Mainnotification', mainnotificationSchema);
    }
    if (lean) {
        mainnotificationLean = mainConnectionLean
            .model('Mainnotification', mainnotificationSchema);
    }
};
//# sourceMappingURL=mainnotification.model.js.map
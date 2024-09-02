import { createExpireDocIndex, globalSchemaObj, globalSelectObj, preUpdateDocExpire } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
import { connectAuthDatabase, isAuthDbConnected, mainConnection, mainConnectionLean } from '../utils/database';
// Create authenticated Authy and Twilio API clients
// const authy = require('authy')(config.authyKey);
// const twilioClient = require('twilio')(config.accountSid, config.authToken);
const uniqueValidator = require('mongoose-unique-validator');
export const companySchema = new Schema({
    ...globalSchemaObj,
    trackDeleted: { type: Schema.ObjectId },
    urId: { type: String, required: [true, 'cannot be empty.'], index: true },
    name: { type: String, required: [true, 'cannot be empty.'], index: true },
    displayName: { type: String, required: [true, 'cannot be empty.'], index: true },
    dateOfEst: { type: String, index: true },
    left: { type: Boolean, default: false },
    dateLeft: { type: Date },
    details: { type: String },
    address: { type: String },
    companyDispNameFormat: { type: String },
    businessType: { type: String },
    profilePic: { type: String },
    profileCoverPic: { type: String },
    photos: [],
    websiteAddress: { type: String },
    blocked: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    expireAt: { type: String },
    blockedReasons: {},
    owner: { type: String } // user
}, { timestamps: true, collection: 'companies' });
companySchema.index({ createdAt: -1 });
companySchema.index({ expireAt: 1 }, { expireAfterSeconds: 2628003 });
companySchema.pre('updateOne', function (next) {
    return preUpdateDocExpire(this, next);
});
companySchema.pre('updateMany', function (next) {
    return preUpdateDocExpire(this, next);
});
// Apply the uniqueValidator plugin to companySchema.
companySchema.plugin(uniqueValidator);
companySchema.methods['toAuthJSON'] = function () {
    return {
        urId: this.urId,
        name: this.name,
        displayName: this.displayName,
        dateOfEst: this.dateOfEst,
        salutation: this.salutation,
        details: this.details,
        companyDispNameFormat: this.companyDispNameFormat,
        businessType: this.businessType,
        photos: this.photos,
        blockedReasons: this.blockedReasons
    };
};
companySchema.methods['toProfileJSONFor'] = function () {
    return {
        urId: this.urId,
        name: this.name,
        displayName: this.displayName,
        dateOfEst: this.dateOfEst,
        details: this.details,
        companyDispNameFormat: this.companyDispNameFormat,
        businessType: this.businessType,
        profilepic: this.profilepic,
        profileCoverPic: this.profileCoverPic,
        createdAt: this.createdAt,
        websiteAddress: this.websiteAddress,
        photos: this.photos,
        blockedReasons: this.blockedReasons
    };
};
const companyAuthselect = {
    ...globalSelectObj,
    name: 1,
    displayName: 1,
    dateOfEst: 1,
    salutation: 1,
    details: 1,
    companyDispNameFormat: 1,
    businessType: 1,
    profilepic: 1,
    profileCoverPic: 1,
    createdAt: 1,
    websiteAddress: 1,
    photos: 1,
    blocked: 1,
    verified: 1,
    expireAt: 1,
    blockedReasons: 1,
    left: 1,
    dateLeft: 1
};
const companyaboutSelect = {
    ...globalSelectObj,
    name: 1,
    displayName: 1,
    dateOfEst: 1,
    salutation: 1,
    details: 1,
    companyDispNameFormat: 1,
    businessType: 1,
    profilepic: 1,
    profileCoverPic: 1,
    createdAt: 1,
    websiteAddress: 1,
    photos: 1,
    blocked: 1,
    verified: 1,
    expireAt: 1,
    blockedReasons: 1,
    left: 1,
    dateLeft: 1
};
/**
 * Represents the main company model.
 */
export let companyMain;
/**
 * Represents a lean company model.
 */
export let companyLean;
/**
 * Represents the company authentication select function.
 */
export const companyAuthSelect = companyAuthselect;
/**
 * Selects the company about information.
 */
export const companyAboutSelect = companyaboutSelect;
/**
 * Creates a company model with the specified database URL.
 * @param dbUrl The URL of the database.
 * @param main Optional parameter indicating whether to create the main company model. Default is true.
 * @param lean Optional parameter indicating whether to create the lean company model. Default is true.
 */
export const createCompanyModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    createExpireDocIndex(companySchema);
    if (!isAuthDbConnected) {
        await connectAuthDatabase(dbUrl, dbOptions);
    }
    if (main) {
        companyMain = mainConnection.model('Company', companySchema);
    }
    if (lean) {
        companyLean = mainConnectionLean.model('Company', companySchema);
    }
};
//# sourceMappingURL=company.model.js.map
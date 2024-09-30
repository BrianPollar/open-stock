"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompanyModel = exports.companyAboutSelect = exports.companyAuthSelect = exports.companyLean = exports.companyMain = exports.companySchema = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const database_1 = require("../utils/database");
// Create authenticated Authy and Twilio API clients
// const authy = require('authy')(config.authyKey);
// const twilioClient = require('twilio')(config.accountSid, config.authToken);
const uniqueValidator = require('mongoose-unique-validator');
exports.companySchema = new mongoose_1.Schema({
    ...stock_universal_server_1.globalSchemaObj,
    trackDeleted: { type: mongoose_1.Schema.ObjectId },
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
    websiteAddress: { type: String },
    blocked: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    expireAt: { type: String },
    blockedReasons: {},
    owner: { type: String } // user
}, { timestamps: true, collection: 'companies' });
exports.companySchema.index({ createdAt: -1 });
exports.companySchema.index({ expireAt: 1 }, { expireAfterSeconds: 2628003 });
exports.companySchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
exports.companySchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
// Apply the uniqueValidator plugin to companySchema.
exports.companySchema.plugin(uniqueValidator);
exports.companySchema.methods['toAuthJSON'] = function () {
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
exports.companySchema.methods['toProfileJSONFor'] = function () {
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
    ...stock_universal_server_1.globalSelectObj,
    name: 1,
    displayName: 1,
    dateOfEst: 1,
    salutation: 1,
    details: 1,
    companyDispNameFormat: 1,
    businessType: 1,
    createdAt: 1,
    websiteAddress: 1,
    blocked: 1,
    verified: 1,
    expireAt: 1,
    blockedReasons: 1,
    left: 1,
    dateLeft: 1
};
const companyaboutSelect = {
    ...stock_universal_server_1.globalSelectObj,
    name: 1,
    displayName: 1,
    dateOfEst: 1,
    salutation: 1,
    details: 1,
    companyDispNameFormat: 1,
    businessType: 1,
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
 * Represents the company authentication select function.
 */
exports.companyAuthSelect = companyAuthselect;
/**
 * Selects the company about information.
 */
exports.companyAboutSelect = companyaboutSelect;
/**
 * Creates a company model with the specified database URL.
 * @param dbUrl The URL of the database.
 * @param main Optional parameter indicating whether to create the main company model. Default is true.
 * @param lean Optional parameter indicating whether to create the lean company model. Default is true.
 */
const createCompanyModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(exports.companySchema);
    if (!database_1.isAuthDbConnected) {
        await (0, database_1.connectAuthDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.companyMain = database_1.mainConnection
            .model('Company', exports.companySchema);
    }
    if (lean) {
        exports.companyLean = database_1.mainConnectionLean
            .model('Company', exports.companySchema);
    }
};
exports.createCompanyModel = createCompanyModel;
//# sourceMappingURL=company.model.js.map
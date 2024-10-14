"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompanyModel = exports.companyAboutSelect = exports.companyAuthSelect = exports.companyLean = exports.companyMain = exports.companySchema = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
// Create authenticated Authy and Twilio API clients
// const authy = require('authy')(config.authyKey);
// const twilioClient = require('twilio')(config.accountSid, config.authToken);
const uniqueValidator = require('mongoose-unique-validator');
exports.companySchema = new mongoose_1.Schema({
    ...stock_universal_server_1.globalSchemaObj,
    trackDeleted: { type: mongoose_1.Schema.ObjectId },
    urId: { type: String, required: [true, 'cannot be empty.'], index: true },
    name: { type: String,
        required: [true, 'cannot be empty.'],
        index: true,
        minlength: [3, 'more than 3 characters required.'],
        maxlength: [90, 'less than 90 characters required.']
    },
    displayName: {
        type: String, required: [true, 'cannot be empty.'],
        index: true,
        minlength: [3, 'more than 3 characters required.'],
        maxlength: [90, 'less than 90 characters required.']
    },
    dateOfEst: {
        type: Date,
        index: true
    },
    left: { type: Boolean, default: false },
    dateLeft: { type: Date,
        validate: {
            validator: validateDateLeft,
            message: props => `${props.value} is less than date of establishment!`
        }
    },
    details: { type: String },
    address: { type: String },
    companyDispNameFormat: { type: String },
    businessType: { type: String },
    websiteAddress: { type: String,
        validate: {
            validator(v) {
                return /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/.test(v);
            },
            message: props => `${props.value} is not a valid web address!`
        }
    },
    blocked: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    expireAt: { type: String },
    blockedReasons: {},
    owner: { type: mongoose_1.Schema.Types.ObjectId } // user
}, { timestamps: true, collection: 'companies' });
exports.companySchema.index({ createdAt: -1 });
exports.companySchema.index({ expireAt: 1 }, { expireAfterSeconds: 2628003 });
exports.companySchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
exports.companySchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
function validateDateLeft(v) {
    return (new Date(v) > new Date(this.createdAt)) && (new Date(v) > new Date(this.dateOfEst));
}
// Apply the uniqueValidator plugin to companySchema.
exports.companySchema.plugin(uniqueValidator);
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
    if (!stock_universal_server_1.isDbConnected) {
        await (0, stock_universal_server_1.connectDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.companyMain = stock_universal_server_1.mainConnection
            .model('Company', exports.companySchema);
    }
    if (lean) {
        exports.companyLean = stock_universal_server_1.mainConnectionLean
            .model('Company', exports.companySchema);
    }
};
exports.createCompanyModel = createCompanyModel;
//# sourceMappingURL=company.model.js.map
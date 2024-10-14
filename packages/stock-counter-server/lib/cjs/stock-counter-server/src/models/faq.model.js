"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFaqModel = exports.faqSelect = exports.faqLean = exports.faqMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
/** FAQ schema */
const faqSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withUrIdAndCompanySchemaObj,
    posterName: {
        type: String,
        minlength: [3, 'cannot be less than 3.'],
        maxlength: [100, 'cannot be more than 100.']
    },
    posterEmail: {
        type: String,
        required: [true, 'cannot be empty.'],
        index: true,
        validator: checkEmail,
        message: props => `${props.value} is invalid phone!`
    },
    userId: { type: mongoose_1.Schema.Types.ObjectId },
    qn: {
        type: String,
        required: [true, 'cannot be empty.'],
        index: true,
        minlength: [10, 'cannot be less than 10.'],
        maxlength: [400, 'cannot be more than 400.']
    }
}, { timestamps: true, collection: 'faqs' });
function checkEmail(email) {
    // eslint-disable-next-line max-len
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
faqSchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
faqSchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
// Apply the uniqueValidator plugin to faqSchema.
faqSchema.plugin(uniqueValidator);
/** Primary selection object for FAQ */
const faqselect = {
    ...stock_universal_server_1.withUrIdAndCompanySelectObj,
    posterName: 1,
    posterEmail: 1,
    userId: 1,
    qn: 1
};
/**
 * Selects the faqselect constant from the faq.model module.
 */
exports.faqSelect = faqselect;
/**
 * Creates a new FAQ model.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create a main connection.
 * @param lean Whether to create a lean connection.
 */
const createFaqModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(faqSchema);
    if (!stock_universal_server_1.isDbConnected) {
        await (0, stock_universal_server_1.connectDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.faqMain = stock_universal_server_1.mainConnection
            .model('Faq', faqSchema);
    }
    if (lean) {
        exports.faqLean = stock_universal_server_1.mainConnectionLean
            .model('Faq', faqSchema);
    }
};
exports.createFaqModel = createFaqModel;
//# sourceMappingURL=faq.model.js.map
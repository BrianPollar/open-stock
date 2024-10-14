"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExpireDocIndex = exports.withUrIdSelectObj = exports.withUrIdAndCompanySelectObj = exports.withCompanySelectObj = exports.globalSelectObj = exports.withUrIdSchemaObj = exports.withUrIdAndCompanySchemaObj = exports.withCompanySchemaObj = exports.globalSchemaObj = void 0;
const mongoose_1 = require("mongoose");
const stock_universal_local_1 = require("../stock-universal-local");
exports.globalSchemaObj = {
    trackEdit: { type: mongoose_1.Schema.ObjectId },
    trackView: { type: mongoose_1.Schema.ObjectId },
    isDeleted: { type: Boolean, default: false },
    trackDeleted: { type: mongoose_1.Schema.ObjectId },
    expireDocAfter: { type: Date, default: null }
};
exports.withCompanySchemaObj = {
    ...exports.globalSchemaObj,
    companyId: { type: mongoose_1.Schema.Types.ObjectId, index: true }
};
exports.withUrIdAndCompanySchemaObj = {
    ...exports.withCompanySchemaObj,
    urId: {
        type: String, required: [true, 'cannot be empty.'], index: true
    }
};
exports.withUrIdSchemaObj = {
    ...exports.globalSchemaObj,
    urId: {
        type: String, required: [true, 'cannot be empty.'], index: true
    }
};
exports.globalSelectObj = {
    trackEdit: 1,
    trackView: 1,
    isDeleted: 1,
    trackDeleted: 1
};
exports.withCompanySelectObj = {
    ...exports.globalSelectObj,
    companyId: 1
};
exports.withUrIdAndCompanySelectObj = {
    ...exports.withCompanySelectObj,
    urId: 1
};
exports.withUrIdSelectObj = {
    ...exports.globalSchemaObj,
    urId: 1
};
/**
 * Creates an index on the `expireDocAfter` field, which is used to expire
 * documents after a certain amount of time.
 *
 * The index is created with the following options:
 *
 * - `expireAfterSeconds`: The number of seconds after which the document will
 *   be deleted.
 * - `partialFilterExpression`: An expression that specifies which documents
 *   should be deleted. In this case, the expression is `{ isDeleted: true }`,
 *   which means that only documents with `isDeleted` set to `true` will be
 *   deleted.
 *
 * This function is used to create the index on the `expireDocAfter` field when
 * the schema is created.
 *
 * @param schema The schema on which to create the index.
 */
const createExpireDocIndex = (schema) => {
    schema.index({ expireDocAfter: 1 }, { expireAfterSeconds: stock_universal_local_1.stockUniversalConfig.expireDocAfterSeconds, partialFilterExpression: { isDeleted: true } });
};
exports.createExpireDocIndex = createExpireDocIndex;
//# sourceMappingURL=global.js.map
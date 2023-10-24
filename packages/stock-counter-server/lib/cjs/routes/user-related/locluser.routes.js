"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.localUserRoutes = exports.canRemoveOneUser = exports.removeManyUsers = exports.removeOneUser = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const invoicerelated_model_1 = require("../../models/printables/related/invoicerelated.model");
const customer_model_1 = require("../../models/user-related/customer.model");
const staff_model_1 = require("../../models/user-related/staff.model");
const log4js_1 = require("log4js");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
/**
 * Removes one user from the database.
 * @param req - Express Request object.
 * @param res - Express Response object.
 * @param next - Express NextFunction object.
 * @returns Promise<void>
 */
const removeOneUser = async (req, res, next) => {
    const { credential } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(credential.userId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const canRemove = await (0, exports.canRemoveOneUser)(credential.userId);
    if (!canRemove.success) {
        return res.status(401).send({ ...canRemove, status: 401 });
    }
    const deleted = await stock_auth_server_1.user.findByIdAndDelete(credential.userId);
    req.body.id = credential.id;
    if (!Boolean(deleted)) {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
    next();
};
exports.removeOneUser = removeOneUser;
/**
 * Removes multiple users from the database.
 * @param req - Express Request object.
 * @param res - Express Response object.
 * @param next - Express NextFunction object.
 * @returns Promise<void>
 */
const removeManyUsers = async (req, res, next) => {
    const { credentials } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)(credentials.map(val => val.userId));
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const promises = req.body.credentials.map(async (val) => {
        const canRemove = await (0, exports.canRemoveOneUser)(val.userId);
        return Promise.resolve({ ...canRemove, ...val });
    });
    const all = await Promise.all(promises);
    const newIds = all.filter(val => val.success).map(val => val.id);
    const newUserIds = all.filter(val => val.success).map(val => val.userId);
    if (newIds.length <= 0) {
        return res.status(401).send({ success: false, status: 401, err: 'sorry all users selected are linked' });
    }
    const newFilesWithDir = req.body.filesWithDir.filter(val => newUserIds.includes(val.id));
    req.body.ids = newIds;
    req.body.newFilesWithDir = newFilesWithDir;
    const deleted = await stock_auth_server_1.user
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: newUserIds } })
        .catch(err => {
        localUserRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (!Boolean(deleted)) {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
    next();
};
exports.removeManyUsers = removeManyUsers;
/**
 * Checks if a user can be removed from the database.
 * @param id - The ID of the user to check.
 * @returns Promise<IuserLinkedInMoreModels>
 */
const canRemoveOneUser = async (id) => {
    const hasInvRelated = await invoicerelated_model_1.invoiceRelatedLean.findOne({ billingUserId: id });
    if (hasInvRelated) {
        return {
            success: false,
            msg: 'user is linked to invoice, or estimate or delivery note or receipt'
        };
    }
    const hasCustomer = await customer_model_1.customerLean.findOne({ user: id });
    if (hasCustomer) {
        return {
            success: false,
            msg: 'user is linked to customer'
        };
    }
    const hasStaff = await staff_model_1.staffLean.findOne({ user: id });
    if (hasStaff) {
        return {
            success: false,
            msg: 'user is linked to customer'
        };
    }
    return {
        success: true,
        msg: 'user is not linked to anything'
    };
};
exports.canRemoveOneUser = canRemoveOneUser;
/** Logger for local user routes. */
const localUserRoutesLogger = (0, log4js_1.getLogger)('routes/customerRoutes');
/** Express Router for local user routes. */
exports.localUserRoutes = express_1.default.Router();
exports.localUserRoutes.put('/deleteone', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users'), exports.removeOneUser, stock_universal_server_1.deleteFiles, (req, res) => {
    return res.status(200).send({ success: true });
});
exports.localUserRoutes.put('/deletemany', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users'), exports.removeManyUsers, stock_universal_server_1.deleteFiles, (req, res) => {
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=locluser.routes.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletHistoryRoutes = exports.makeWalletHistoryQuery = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const user_wallet_history_model_1 = require("../../models/printables/wallet/user-wallet-history.model");
const query_1 = require("../../utils/query");
const makeWalletHistoryQuery = (walletHistory) => {
    const newWalletHist = new user_wallet_history_model_1.userWalletHistoryMain(walletHistory);
    const savedRes = newWalletHist.save().catch((err) => err);
    return savedRes;
};
exports.makeWalletHistoryQuery = makeWalletHistoryQuery;
/**
 * Router for wallet related routes.
 */
exports.walletHistoryRoutes = express_1.default.Router();
exports.walletHistoryRoutes.post('/one', stock_universal_server_1.requireAuth, async (req, res) => {
    const { _id, userId, urId } = req.body;
    if (!_id && !userId && !urId) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    let filter2 = {};
    if (urId) {
        filter2 = { ...filter2, urId };
    }
    if (_id) {
        const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id]);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        filter2 = { ...filter2, _id };
    }
    /* if (companyId) {
    filter = { ...filter, ...filter };
  } */
    if (userId) {
        const isValid = (0, stock_universal_server_1.verifyObjectIds)([userId]);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        filter2 = { ...filter2, user: userId };
    }
    const wallet = await user_wallet_history_model_1.userWalletHistoryLean
        .findOne({ ...filter, ...filter2 })
        .populate([(0, query_1.populateUser)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
        .lean();
    if (!wallet) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    return res.status(200).send(wallet);
});
exports.walletHistoryRoutes.get('/all/:offset/:limit', stock_universal_server_1.requireAuth, async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        user_wallet_history_model_1.userWalletHistoryLean
            .find({ ...filter })
            .populate([(0, query_1.populateUser)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
            .skip(offset)
            .limit(limit)
            .lean(),
        user_wallet_history_model_1.userWalletHistoryLean.countDocuments({ ...filter })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
exports.walletHistoryRoutes.post('/filter', stock_universal_server_1.requireAuth, async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    let filters;
    const all = await Promise.all([
        user_wallet_history_model_1.userWalletHistoryLean
            .find({ ...filter, ...filters })
            .populate([(0, query_1.populateUser)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
            .skip(offset)
            .limit(limit)
            .lean(),
        user_wallet_history_model_1.userWalletHistoryLean.countDocuments({ ...filter, ...filters })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
exports.walletHistoryRoutes.put('/delete/one', stock_universal_server_1.requireAuth, async (req, res) => {
    const { _id } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    // const deleted = await userWalletHistoryMain.findOneAndDelete({ _id, ...filter });
    const updateRes = await user_wallet_history_model_1.userWalletHistoryMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } })
        .catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    return res.status(200).send({ success: true });
});
exports.walletHistoryRoutes.put('/delete/many', stock_universal_server_1.requireAuth, async (req, res) => {
    const { _ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const updateRes = await user_wallet_history_model_1.userWalletHistoryMain
        .updateMany({ _id: { $in: _ids }, ...filter }, {
        $set: { isDeleted: true }
    }).catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=wallet-history.routes.js.map
"use strict";
/* eslint-disable @typescript-eslint/naming-convention */
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletRoutes = exports.updateUserWallet = exports.addUserWallet = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const mongoose_1 = require("mongoose");
const user_wallet_model_1 = require("../../models/printables/wallet/user-wallet.model");
const waiting_wallet_pay_model_1 = require("../../models/printables/wallet/waiting-wallet-pay.model");
const query_1 = require("../../utils/query");
const addUserWallet = (userWallet) => {
    const newWallet = new user_wallet_model_1.userWalletMain(userWallet);
    return newWallet.save().catch(err => err);
};
exports.addUserWallet = addUserWallet;
const updateUserWallet = (userWallet) => {
    return user_wallet_model_1.userWalletMain
        .updateOne({ _id: userWallet._id }, {
        $set: {
            accountBalance: userWallet.accountBalance,
            currency: userWallet.currency
        }
    });
};
exports.updateUserWallet = updateUserWallet;
const firePesapalRelegator = async (waitinPay, currUser, currency) => {
    const payDetails = {
        id: waitinPay.toString(),
        currency,
        amount: waitinPay.amount,
        description: 'Refill your Wallet ,',
        callback_url: stock_auth_server_1.pesapalPaymentInstance.config.pesapalCallbackUrl, // TODO add proper callback url
        cancellation_url: '',
        notification_id: '',
        billing_address: {
            email_address: currUser.email,
            phone_number: currUser.phone.toString(),
            country_code: 'UG',
            first_name: currUser.fname,
            middle_name: '',
            last_name: currUser.lname,
            line_1: '',
            line_2: '',
            city: '',
            state: '',
            // postal_code: paymentRelated.shippingAddress,
            zip_code: ''
        }
    };
    const response = await stock_auth_server_1.pesapalPaymentInstance.submitOrder(payDetails, waitinPay.walletId.toString(), 'Complete product payment');
    stock_universal_server_1.mainLogger.debug('firePesapalRelegator::Pesapal payment failed', response);
    if (!response.success || !response.pesaPalOrderRes) {
        return { success: false, err: response.err };
    }
    /* const updateRes = await userWalletLean.updateOne({
      _id: waitinPay.walletId
    }, {
      $inc: { accountBalance: waitinPay.amount }
    }).catch((err: Error) => err);
  
    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);
  
      return { success: errResponse.success, err: errResponse.err };
    } */
    return {
        success: true,
        pesaPalOrderRes: {
            redirect_url: response.pesaPalOrderRes.redirect_url
        }
    };
};
/**
 * Router for wallet related routes.
 */
exports.walletRoutes = express_1.default.Router();
exports.walletRoutes.post('/add', stock_universal_server_1.requireAuth, async (req, res) => {
    const userWallet = req.body;
    const amount = userWallet.accountBalance;
    userWallet.accountBalance = 0;
    const savedRes = await (0, exports.addUserWallet)(userWallet)
        .catch((err) => err);
    if (savedRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    const waitingPay = new waiting_wallet_pay_model_1.waitingWalletPayMain({
        userId: userWallet.user,
        walletId: savedRes._id,
        amount
    });
    const savedWPayRes = await waitingPay.save()
        .catch((err) => err);
    if (savedWPayRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedWPayRes);
        await user_wallet_model_1.userWalletMain.deleteOne({ _id: savedRes._id });
        return res.status(errResponse.status).send(errResponse);
    }
    const currUser = await stock_auth_server_1.user.findOne({ _id: userWallet.user }).lean();
    if (!currUser) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const paidRes = await firePesapalRelegator(waitingPay, currUser, userWallet.currency);
    return res.status(200).send(paidRes);
});
exports.walletRoutes.post('/one', stock_universal_server_1.requireAuth, async (req, res) => {
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
    if (userId) {
        const isValid = (0, stock_universal_server_1.verifyObjectIds)([userId]);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        filter2 = { ...filter2, user: userId };
    }
    const wallet = await user_wallet_model_1.userWalletLean
        .findOne({ ...filter, ...filter2 })
        .populate([(0, query_1.populateUser)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
        .lean();
    if (!wallet) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    return res.status(200).send(wallet);
});
exports.walletRoutes.get('/all/:offset/:limit', stock_universal_server_1.requireAuth, async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        user_wallet_model_1.userWalletLean
            .find({ ...filter })
            .populate([(0, query_1.populateUser)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
            .skip(offset)
            .limit(limit)
            .lean(),
        user_wallet_model_1.userWalletLean.countDocuments({ ...filter })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
exports.walletRoutes.post('/filter', stock_universal_server_1.requireAuth, async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    let filters;
    const all = await Promise.all([
        user_wallet_model_1.userWalletLean
            .find({ ...filter, ...filters })
            .populate([(0, query_1.populateUser)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
            .skip(offset)
            .limit(limit)
            .lean(),
        user_wallet_model_1.userWalletLean.countDocuments({ ...filter, ...filters })
    ]);
    const walletsToReturn = all[0].filter(val => val.user);
    const response = {
        count: all[1],
        data: walletsToReturn
    };
    return res.status(200).send(response);
});
exports.walletRoutes.put('/update', stock_universal_server_1.requireAuth, async (req, res) => {
    const userWallet = req.body;
    const amount = userWallet.accountBalance;
    const found = await user_wallet_model_1.userWalletLean.findOne({ _id: userWallet._id }).lean();
    if (!found) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const waitingPay = new waiting_wallet_pay_model_1.waitingWalletPayMain({
        userId: userWallet.user,
        walletId: userWallet._id,
        amount
    });
    const savedWPayRes = await waitingPay.save()
        .catch((err) => err);
    if (savedWPayRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedWPayRes);
        return res.status(errResponse.status).send(errResponse);
    }
    const currUser = await stock_auth_server_1.user.findOne({ _id: userWallet.user }).lean();
    if (!currUser) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    userWallet.accountBalance = found.accountBalance;
    const saved = await (0, exports.updateUserWallet)(userWallet);
    if (saved instanceof mongoose_1.Error) {
        return res.status(400).send({ success: false, err: saved });
    }
    if (amount <= 0) {
        return res.status(200).send({ success: true });
    }
    const paidRes = await firePesapalRelegator(waitingPay, currUser, userWallet.currency);
    return res.status(200).send(paidRes);
});
exports.walletRoutes.put('/delete/one', stock_universal_server_1.requireAuth, async (req, res) => {
    const { _id } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    // const deleted = await userWalletMain.findOneAndDelete({ _id, ...filter });
    const updateRes = await user_wallet_model_1.userWalletMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    return res.status(200).send({ success: true });
});
exports.walletRoutes.put('/delete/many', stock_universal_server_1.requireAuth, async (req, res) => {
    const { _ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const updateRes = await user_wallet_model_1.userWalletMain
        .updateMany({ _id: { $in: _ids }, ...filter }, {
        $set: { isDeleted: true }
    }).catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=wallet.routes.js.map
/* eslint-disable @typescript-eslint/naming-convention */
import { pesapalPaymentInstance, populateTrackEdit, populateTrackView, user } from '@open-stock/stock-auth-server';
import { handleMongooseErr, mainLogger, makeCompanyBasedQuery, offsetLimitRelegator, requireAuth, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import { Error } from 'mongoose';
import { userWalletLean, userWalletMain } from '../../models/printables/wallet/user-wallet.model';
import { waitingWalletPayMain } from '../../models/printables/wallet/waiting-wallet-pay.model';
import { populateUser } from '../../utils/query';
export const addUserWallet = (userWallet) => {
    const newWallet = new userWalletMain(userWallet);
    return newWallet.save().catch(err => err);
};
export const updateUserWallet = (userWallet) => {
    return userWalletMain
        .updateOne({ _id: userWallet._id }, {
        $set: {
            accountBalance: userWallet.accountBalance,
            currency: userWallet.currency
        }
    });
};
const firePesapalRelegator = async (waitinPay, currUser, currency) => {
    const payDetails = {
        id: waitinPay.toString(),
        currency,
        amount: waitinPay.amount,
        description: 'Refill your Wallet ,',
        callback_url: pesapalPaymentInstance.config.pesapalCallbackUrl, // TODO add proper callback url
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
    const response = await pesapalPaymentInstance.submitOrder(payDetails, waitinPay.walletId.toString(), 'Complete product payment');
    mainLogger.debug('firePesapalRelegator::Pesapal payment failed', response);
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
export const walletRoutes = express.Router();
walletRoutes.post('/add', requireAuth, async (req, res) => {
    const userWallet = req.body;
    const amount = userWallet.accountBalance;
    userWallet.accountBalance = 0;
    const savedRes = await addUserWallet(userWallet)
        .catch((err) => err);
    if (savedRes instanceof Error) {
        const errResponse = handleMongooseErr(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    const waitingPay = new waitingWalletPayMain({
        userId: userWallet.user,
        walletId: savedRes._id,
        amount
    });
    const savedWPayRes = await waitingPay.save()
        .catch((err) => err);
    if (savedWPayRes instanceof Error) {
        const errResponse = handleMongooseErr(savedWPayRes);
        await userWalletMain.deleteOne({ _id: savedRes._id });
        return res.status(errResponse.status).send(errResponse);
    }
    const currUser = await user.findOne({ _id: userWallet.user }).lean();
    if (!currUser) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const paidRes = await firePesapalRelegator(waitingPay, currUser, userWallet.currency);
    return res.status(200).send(paidRes);
});
walletRoutes.post('/one', requireAuth, async (req, res) => {
    const { _id, userId, urId } = req.body;
    if (!_id && !userId && !urId) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { filter } = makeCompanyBasedQuery(req);
    let filter2 = {};
    if (urId) {
        filter2 = { ...filter2, urId };
    }
    if (_id) {
        const isValid = verifyObjectIds([_id]);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        filter2 = { ...filter2, _id };
    }
    if (userId) {
        const isValid = verifyObjectIds([userId]);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        filter2 = { ...filter2, user: userId };
    }
    const wallet = await userWalletLean
        .findOne({ ...filter, ...filter2 })
        .populate([populateUser(), populateTrackEdit(), populateTrackView()])
        .lean();
    if (!wallet) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    return res.status(200).send(wallet);
});
walletRoutes.get('/all/:offset/:limit', requireAuth, async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { filter } = makeCompanyBasedQuery(req);
    const all = await Promise.all([
        userWalletLean
            .find({ ...filter })
            .populate([populateUser(), populateTrackEdit(), populateTrackView()])
            .skip(offset)
            .limit(limit)
            .lean(),
        userWalletLean.countDocuments({ ...filter })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
walletRoutes.post('/filter', requireAuth, async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
    const { filter } = makeCompanyBasedQuery(req);
    let filters;
    const all = await Promise.all([
        userWalletLean
            .find({ ...filter, ...filters })
            .populate([populateUser(), populateTrackEdit(), populateTrackView()])
            .skip(offset)
            .limit(limit)
            .lean(),
        userWalletLean.countDocuments({ ...filter, ...filters })
    ]);
    const walletsToReturn = all[0].filter(val => val.user);
    const response = {
        count: all[1],
        data: walletsToReturn
    };
    return res.status(200).send(response);
});
walletRoutes.put('/update', requireAuth, async (req, res) => {
    const userWallet = req.body;
    const amount = userWallet.accountBalance;
    const found = await userWalletLean.findOne({ _id: userWallet._id }).lean();
    if (!found) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const waitingPay = new waitingWalletPayMain({
        userId: userWallet.user,
        walletId: userWallet._id,
        amount
    });
    const savedWPayRes = await waitingPay.save()
        .catch((err) => err);
    if (savedWPayRes instanceof Error) {
        const errResponse = handleMongooseErr(savedWPayRes);
        return res.status(errResponse.status).send(errResponse);
    }
    const currUser = await user.findOne({ _id: userWallet.user }).lean();
    if (!currUser) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    userWallet.accountBalance = found.accountBalance;
    const saved = await updateUserWallet(userWallet);
    if (saved instanceof Error) {
        return res.status(400).send({ success: false, err: saved });
    }
    if (amount <= 0) {
        return res.status(200).send({ success: true });
    }
    const paidRes = await firePesapalRelegator(waitingPay, currUser, userWallet.currency);
    return res.status(200).send(paidRes);
});
walletRoutes.put('/delete/one', requireAuth, async (req, res) => {
    const { _id } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    // const deleted = await userWalletMain.findOneAndDelete({ _id, ...filter });
    const updateRes = await userWalletMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } })
        .catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    return res.status(200).send({ success: true });
});
walletRoutes.put('/delete/many', requireAuth, async (req, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const updateRes = await userWalletMain
        .updateMany({ _id: { $in: _ids }, ...filter }, {
        $set: { isDeleted: true }
    }).catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=wallet.routes.js.map
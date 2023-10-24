/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { offsetLimitRelegator, requireAuth, roleAuthorisation, verifyObjectId } from '@open-stock/stock-universal-server';
import { makeInvoiceRelatedPdct, updateInvoiceRelated } from './invoicerelated';
import { getLogger } from 'log4js';
import { invoiceRelatedLean } from '../../../models/printables/related/invoicerelated.model';
import { userLean } from '@open-stock/stock-auth-server';
import { receiptLean } from '../../../models/printables/receipt.model';
/** */
const fileStorageLogger = getLogger('routes/FileStorage');
/** */
export const invoiceRelateRoutes = express.Router();
invoiceRelateRoutes.get('/getone/:id', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { id } = req.params;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const related = await invoiceRelatedLean
        .findById(id)
        .lean()
        .populate({ path: 'billingUserId', model: userLean })
        .populate({ path: 'payments', model: receiptLean });
    let returned;
    if (related) {
        returned = makeInvoiceRelatedPdct(related, related
            .billingUserId);
    }
    return res.status(200).send(returned);
});
invoiceRelateRoutes.get('/getall/:offset/:limit', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const relateds = await invoiceRelatedLean
        .find({})
        .skip(offset)
        .limit(limit)
        .lean()
        .populate({ path: 'billingUserId', model: userLean })
        .populate({ path: 'payments', model: receiptLean })
        .catch(err => {
        fileStorageLogger.error('getall - err: ', err);
        return null;
    });
    if (relateds) {
        const returned = relateds
            .map(val => makeInvoiceRelatedPdct(val, val
            .billingUserId));
        return res.status(200).send(returned);
    }
    else {
        return res.status(200).send([]);
    }
});
invoiceRelateRoutes.post('/search/:offset/:limit', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const relateds = await invoiceRelatedLean
        .find({ [searchKey]: { $regex: searchterm, $options: 'i' } })
        .skip(offset)
        .limit(limit)
        .lean()
        .populate({ path: 'billingUserId', model: userLean })
        .populate({ path: 'payments', model: receiptLean })
        .catch(err => {
        fileStorageLogger.error('getall - err: ', err);
        return null;
    });
    if (relateds) {
        const returned = relateds
            .map(val => makeInvoiceRelatedPdct(val, val
            .billingUserId));
        return res.status(200).send(returned);
    }
    else {
        return res.status(200).send([]);
    }
});
invoiceRelateRoutes.put('/update', requireAuth, roleAuthorisation('printables'), async (req, res) => {
    const { invoiceRelated } = req.body;
    const isValid = verifyObjectId(invoiceRelated.invoiceRelated);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    await updateInvoiceRelated(invoiceRelated);
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=invoicerelated.route.js.map
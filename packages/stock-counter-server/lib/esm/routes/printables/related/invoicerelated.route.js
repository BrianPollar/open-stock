/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { offsetLimitRelegator, requireAuth, roleAuthorisation, verifyObjectId } from '@open-stock/stock-universal-server';
import { makeInvoiceRelatedPdct, updateInvoiceRelated } from './invoicerelated';
import { getLogger } from 'log4js';
import { invoiceRelatedLean } from '../../../models/printables/related/invoicerelated.model';
import { userLean } from '@open-stock/stock-auth-server';
import { receiptLean } from '../../../models/printables/receipt.model';
/** Logger for file storage */
const fileStorageLogger = getLogger('routes/FileStorage');
/** Express router for invoice related routes */
export const invoiceRelateRoutes = express.Router();
/**
 * Get a single invoice related product by ID
 * @param id - The ID of the invoice related product to retrieve
 * @returns The retrieved invoice related product
 */
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
/**
 * Get all invoice related products with pagination
 * @param offset - The offset to start retrieving invoice related products from
 * @param limit - The maximum number of invoice related products to retrieve
 * @returns The retrieved invoice related products
 */
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
/**
 * Search for invoice related products with pagination
 * @param searchterm - The search term to use for searching invoice related products
 * @param searchKey - The key to search for the search term in
 * @param offset - The offset to start retrieving invoice related products from
 * @param limit - The maximum number of invoice related products to retrieve
 * @returns The retrieved invoice related products
 */
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
/**
 * Update an invoice related product
 * @param invoiceRelated - The updated invoice related product
 * @returns A success message if the update was successful
 */
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
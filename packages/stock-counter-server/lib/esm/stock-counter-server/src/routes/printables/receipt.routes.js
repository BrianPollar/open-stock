/**
 * Defines the routes for creating, retrieving, updating and deleting receipts.
 * @remarks
 * This file contains the following routes:
 * - POST /create - creates a new receipt
 * - GET /getone/:urId - retrieves a single receipt by its unique identifier (urId)
 * - GET /getall/:offset/:limit - retrieves all receipts with pagination
 * - PUT /deleteone - deletes a single receipt and its related documents
 * - POST /search/:offset/:limit - searches for receipts based on a search term and key
 */
import { addParentToLocals, makeCompanyBasedQuery, makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation } from '@open-stock/stock-universal-server';
import express from 'express';
// import { paymentInstallsLean } from '../../models/printables/paymentrelated/paymentsinstalls.model';
import { populateTrackEdit, populateTrackView, requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord } from '@open-stock/stock-auth-server';
import { receiptLean, receiptMain } from '../../models/printables/receipt.model';
import { populateInvoiceRelated } from '../../utils/query';
import { makePaymentInstall } from '../paymentrelated/paymentrelated';
import { deleteAllLinked, makeInvoiceRelatedPdct, relegateInvRelatedCreation, updateInvoiceRelated } from './related/invoicerelated';
/**
 * Router for handling receipt routes.
 */
export const receiptRoutes = express.Router();
receiptRoutes.post('/create/:companyIdParam', requireAuth, requireActiveCompany, requireCanUseFeature('receipt'), roleAuthorisation('receipts', 'create'), async (req, res, next) => {
    const { receipt, invoiceRelated } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    receipt.companyId = filter.companyId;
    invoiceRelated.companyId = filter.companyId;
    const count = await receiptMain
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    receipt.urId = makeUrId(Number(count[0]?.urId || '0'));
    const extraNotifDesc = 'Newly created receipt';
    const invoiceRelatedRes = await relegateInvRelatedCreation(res, invoiceRelated, filter.companyId, extraNotifDesc);
    if (!invoiceRelatedRes.success) {
        return res.status(invoiceRelatedRes.status).send(invoiceRelatedRes);
    }
    receipt.invoiceRelated = invoiceRelatedRes.id;
    await makePaymentInstall(res, receipt, invoiceRelatedRes.id, filter.companyId, invoiceRelated.creationType);
    // const newReceipt = new receiptMain(receipt);
    /* let errResponse: Isuccess;
    const saved = await newReceipt.save()
      .catch(err => {
        receiptRoutesLogger.error('create - err: ', err);
        errResponse = {
          success: false,
          status: 403
        };
        if (err && err.errors) {
          errResponse.err = stringifyMongooseErr(err.errors);
        } else {
          errResponse.err = `we are having problems connecting to our databases,
          try again in a while`;
        }
        return errResponse;
      });
  
    if (errResponse) {
      return res.status(403).send(errResponse);
    }
    await updateInvoiceRelated(invoiceRelated); */
    return next();
}, requireUpdateSubscriptionRecord('receipt'));
receiptRoutes.get('/getone/:urId/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('receipts', 'read'), async (req, res) => {
    const { urId } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const receipt = await receiptLean
        .findOne({ urId, ...filter })
        .lean()
        .populate([populateInvoiceRelated(), populateTrackEdit(), populateTrackView()]);
    let returned;
    if (receipt) {
        const relateds = makeInvoiceRelatedPdct(receipt.invoiceRelated, receipt.invoiceRelated
            .billingUserId);
        // ensure reciepts are properly being populated
        returned = { ...receipt, ...relateds, ...{
                _id: receipt._id,
                urId: receipt.urId
            } };
        addParentToLocals(res, receipt._id, receiptLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(returned);
});
receiptRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('receipts', 'read'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { filter } = makeCompanyBasedQuery(req);
    const all = await Promise.all([
        receiptLean
            .find(filter)
            .skip(offset)
            .limit(limit)
            .lean()
            .populate([populateInvoiceRelated(), populateTrackEdit(), populateTrackView()]),
        receiptLean.countDocuments(filter)
    ]);
    const returned = all[0]
        .map(val => {
        const related = makeInvoiceRelatedPdct(val.invoiceRelated, val.invoiceRelated
            .billingUserId);
        return { ...val, ...related, ...{
                _id: val._id,
                urId: val.urId
            } };
    });
    const response = {
        count: all[1],
        data: returned
    };
    for (const val of all[0]) {
        addParentToLocals(res, val._id, receiptLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
receiptRoutes.put('/deleteone/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('receipts', 'delete'), async (req, res) => {
    const { id, invoiceRelated, creationType, stage } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const deleted = await deleteAllLinked(invoiceRelated, creationType, stage, 'receipt', filter.companyId);
    if (Boolean(deleted)) {
        addParentToLocals(res, id, receiptLean.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
receiptRoutes.post('/search/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('receipts', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const all = await Promise.all([
        receiptLean
            .find({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate([populateInvoiceRelated(), populateTrackEdit(), populateTrackView()]),
        receiptLean.countDocuments({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
    ]);
    const returned = all[0]
        .map(val => makeInvoiceRelatedPdct(val.invoiceRelated, val.invoiceRelated
        .billingUserId));
    const response = {
        count: all[1],
        data: returned
    };
    for (const val of all[0]) {
        addParentToLocals(res, val._id, receiptLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
receiptRoutes.put('/update/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('receipts', 'update'), async (req, res) => {
    const { updatedReceipt, invoiceRelated } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const found = await receiptMain
        .findOne({ _id: updatedReceipt._id, ...filter })
        .lean();
    if (!found) {
        return res.status(404).send({ success: false, status: 404, err: 'not found' });
    }
    let savedErr;
    await receiptMain.updateOne({
        _id: updatedReceipt._id, ...filter
    }, {
        $set: {
            paymentMode: updatedReceipt.paymentMode || found.paymentMode,
            isDeleted: updatedReceipt.isDeleted || found.isDeleted
        }
    }).catch(err => {
        receiptRoutes.error('save error', err);
        savedErr = err;
        return null;
    });
    if (savedErr) {
        return res.status(500).send({ success: false });
    }
    addParentToLocals(res, found._id, receiptLean.collection.collectionName, 'makeTrackEdit');
    await updateInvoiceRelated(res, invoiceRelated, filter.companyId);
    return res.status(200).send({ success: true });
});
receiptRoutes.put('/deletemany/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('receipts', 'delete'), async (req, res) => {
    const { credentials } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    if (!credentials || credentials?.length < 1) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    /** await receiptMain
      .deleteMany({ _id: { $in: ids } });**/
    const promises = credentials
        .map(async (val) => {
        await deleteAllLinked(val.invoiceRelated, val.creationType, val.stage, 'receipt', filter.companyId);
        return new Promise(resolve => resolve(true));
    });
    await Promise.all(promises);
    for (const val of credentials) {
        addParentToLocals(res, val.id, receiptLean.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=receipt.routes.js.map
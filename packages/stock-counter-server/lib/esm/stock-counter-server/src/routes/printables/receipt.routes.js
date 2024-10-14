import { addParentToLocals, constructFiltersFromBody, generateUrId, handleMongooseErr, lookupSubFieldInvoiceRelatedFilter, makeCompanyBasedQuery, offsetLimitRelegator, requireAuth, roleAuthorisation, verifyObjectId } from '@open-stock/stock-universal-server';
import express from 'express';
// import { paymentInstallsLean } from '../../models/printables/paymentrelated/paymentsinstalls.model';
import { populateTrackEdit, populateTrackView, requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord } from '@open-stock/stock-auth-server';
import { Error } from 'mongoose';
import { receiptLean, receiptMain } from '../../models/printables/receipt.model';
import { populateInvoiceRelated } from '../../utils/query';
import { makePaymentInstall } from '../paymentrelated/paymentrelated';
import { deleteAllLinked, makeInvoiceRelatedPdct, relegateInvRelatedCreation, updateInvoiceRelated } from './related/invoicerelated';
/**
 * Router for handling receipt routes.
 */
export const receiptRoutes = express.Router();
receiptRoutes.post('/add', requireAuth, requireActiveCompany, requireCanUseFeature('receipt'), roleAuthorisation('receipts', 'create'), async (req, res, next) => {
    const { receipt, invoiceRelated } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    receipt.companyId = filter.companyId;
    invoiceRelated.companyId = filter.companyId;
    receipt.urId = await generateUrId(receiptMain);
    const extraNotifDesc = 'Newly created receipt';
    const invoiceRelatedRes = await relegateInvRelatedCreation(res, invoiceRelated, filter.companyId, extraNotifDesc);
    if (!invoiceRelatedRes.success || !invoiceRelatedRes._id) {
        return res.status(invoiceRelatedRes.status || 403).send(invoiceRelatedRes);
    }
    receipt.invoiceRelated = invoiceRelatedRes._id;
    await makePaymentInstall(res, receipt, invoiceRelatedRes._id, filter.companyId, invoiceRelated.creationType);
    // const newReceipt = new receiptMain(receipt);
    /*
  const savedRes = await newReceipt.save()
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
receiptRoutes.get('/one/:urIdOr_id', requireAuth, requireActiveCompany, roleAuthorisation('receipts', 'read'), async (req, res) => {
    const { urIdOr_id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const filterwithId = verifyObjectId(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const receipt = await receiptLean
        .findOne({ ...filterwithId, ...filter })
        .lean()
        .populate([populateInvoiceRelated(), populateTrackEdit(), populateTrackView()]);
    if (!receipt || !receipt.invoiceRelated) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const relateds = makeInvoiceRelatedPdct(receipt.invoiceRelated, receipt.invoiceRelated?.billingUserId);
    // ensure reciepts are properly being populated
    const returned = { ...receipt, ...relateds, ...{
            _id: receipt._id,
            urId: receipt.urId
        } };
    addParentToLocals(res, receipt._id, receiptLean.collection.collectionName, 'trackDataView');
    return res.status(200).send(returned);
});
receiptRoutes.get('/all/:offset/:limit', requireAuth, requireActiveCompany, roleAuthorisation('receipts', 'read'), async (req, res) => {
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
        .filter(val => val && val.invoiceRelated)
        .map(val => {
        const related = makeInvoiceRelatedPdct(val.invoiceRelated, val.invoiceRelated?.billingUserId);
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
receiptRoutes.put('/delete/one', requireAuth, requireActiveCompany, roleAuthorisation('receipts', 'delete'), async (req, res) => {
    const { _id } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const found = await receiptLean.findOne({ _id }).lean();
    if (!found) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const updateRes = await deleteAllLinked(found.invoiceRelated, 'receipt', filter.companyId);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    addParentToLocals(res, _id, receiptLean.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
receiptRoutes.post('/filter', requireAuth, requireActiveCompany, roleAuthorisation('receipts', 'read'), async (req, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
    const aggCursor = receiptLean
        .aggregate([
        ...lookupSubFieldInvoiceRelatedFilter(constructFiltersFromBody(req), offset, limit, propSort, returnEmptyArr)
    ]);
    const dataArr = [];
    for await (const data of aggCursor) {
        dataArr.push(data);
    }
    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;
    const returned = all
        .filter(val => val && val.invoiceRelated)
        .map(val => makeInvoiceRelatedPdct(val.invoiceRelated, val.invoiceRelated?.billingUserId));
    const response = {
        count,
        data: returned
    };
    for (const val of all) {
        addParentToLocals(res, val._id, receiptLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
receiptRoutes.put('/update', requireAuth, requireActiveCompany, roleAuthorisation('receipts', 'update'), async (req, res) => {
    const { updatedReceipt, invoiceRelated } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const found = await receiptMain
        .findOne({ _id: updatedReceipt._id, ...filter })
        .lean();
    if (!found) {
        return res.status(404).send({ success: false, status: 404, err: 'not found' });
    }
    const updateRes = await receiptMain.updateOne({
        _id: updatedReceipt._id, ...filter
    }, {
        $set: {
            paymentMode: updatedReceipt.paymentMode || found.paymentMode,
            isDeleted: updatedReceipt.isDeleted || found.isDeleted
        }
    }).catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    addParentToLocals(res, found._id, receiptLean.collection.collectionName, 'makeTrackEdit');
    await updateInvoiceRelated(res, invoiceRelated);
    return res.status(200).send({ success: true });
});
receiptRoutes.put('/delete/many', requireAuth, requireActiveCompany, roleAuthorisation('receipts', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const promises = _ids
        .map(async (val) => {
        const found = await receiptLean.findOne({ _id: val }).lean();
        if (found) {
            await deleteAllLinked(found.invoiceRelated, 'receipt', filter.companyId);
        }
        return new Promise(resolve => resolve(found?._id));
    });
    const filterdExist = await Promise.all(promises);
    for (const val of filterdExist.filter(value => value)) {
        addParentToLocals(res, val, receiptLean.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=receipt.routes.js.map
import { populateTrackEdit, populateTrackView, requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord } from '@open-stock/stock-auth-server';
import { addParentToLocals, constructFiltersFromBody, generateUrId, handleMongooseErr, lookupSubFieldInvoiceRelatedFilter, makeCompanyBasedQuery, offsetLimitRelegator, requireAuth, roleAuthorisation, verifyObjectId } from '@open-stock/stock-universal-server';
import express from 'express';
import { Error } from 'mongoose';
import { invoiceLean, invoiceMain } from '../../models/printables/invoice.model';
import { receiptLean } from '../../models/printables/receipt.model';
import { invoiceRelatedMain } from '../../models/printables/related/invoicerelated.model';
import { populateInvoiceRelated } from '../../utils/query';
import { makePaymentInstall } from '../paymentrelated/paymentrelated';
import { deleteAllLinked, makeInvoiceRelatedPdct, relegateInvRelatedCreation, updateInvoiceRelated } from './related/invoicerelated';
/**
 * Generates a new invoice ID based on the given query ID.
 * @param companyId The query ID used to generate the invoice ID.
 * @returns A Promise that resolves to the generated invoice ID.
 */
const makeinvoiceId = async (companyId) => {
    const count = await invoiceRelatedMain
        .find({ companyId, invoiceId: { $exists: true, $ne: null } })
        .sort({ _id: -1 }).limit(1).lean().select({ invoiceId: 1 });
    let incCount = count[0]?.invoiceId || 0;
    return ++incCount;
};
export const saveInvoice = async (res, invoice, invoiceRelated, companyId) => {
    invoice.companyId = companyId;
    invoiceRelated.companyId = companyId;
    invoiceRelated.invoiceId = await makeinvoiceId(companyId);
    const extraNotifDesc = 'Newly created invoice';
    const relatedId = await relegateInvRelatedCreation(res, invoiceRelated, companyId, extraNotifDesc);
    if (!relatedId.success) {
        return relatedId;
    }
    invoice.invoiceRelated = relatedId._id;
    invoice.companyId = companyId;
    const newInvoice = new invoiceMain(invoice);
    const savedRes = await newInvoice.save()
        .catch((err) => err);
    if (savedRes instanceof Error) {
        const errResponse = handleMongooseErr(savedRes);
        return {
            ...errResponse
        };
    }
    addParentToLocals(res, savedRes._id, invoiceLean.collection.collectionName, 'makeTrackEdit');
    // await updateInvoiceRelated(invoiceRelated); // !! WHY CALL THIS
    return { success: true, status: 200, _id: savedRes._id, invoiceRelatedId: relatedId._id };
};
/**
 * Router for handling invoice routes.
 */
export const invoiceRoutes = express.Router();
invoiceRoutes.post('/add', requireAuth, requireActiveCompany, requireCanUseFeature('invoice'), roleAuthorisation('invoices', 'create'), async (req, res, next) => {
    const { invoice, invoiceRelated } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    invoice.companyId = filter.companyId;
    invoice.urId = await generateUrId(invoiceMain);
    invoiceRelated.companyId = filter.companyId;
    const response = await saveInvoice(res, invoice, invoiceRelated, filter.companyId);
    if (!response.success) {
        return res.status(response.status || 403).send({ success: response.success });
    }
    return next();
}, requireUpdateSubscriptionRecord('invoice'));
invoiceRoutes.put('/update', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'update'), async (req, res) => {
    const { updatedInvoice, invoiceRelated } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    updatedInvoice.companyId = filter.companyId;
    invoiceRelated.companyId = filter.companyId;
    const { _id } = updatedInvoice;
    const invoice = await invoiceMain
        .findOne({ _id, ...filter })
        .lean();
    if (!invoice) {
        return res.status(404).send({ success: false });
    }
    await updateInvoiceRelated(res, invoiceRelated);
    const updateRes = await invoiceMain.updateOne({
        _id, ...filter
    }, {
        $set: {
            dueDate: updatedInvoice.dueDate || invoice.dueDate,
            isDeleted: updatedInvoice.isDeleted || invoice.isDeleted
        }
    })
        .catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    addParentToLocals(res, invoice._id, invoiceLean.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: true });
});
invoiceRoutes.get('/one/:urIdOr_id', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'read'), async (req, res) => {
    const { urIdOr_id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const filterwithId = verifyObjectId(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const invoice = await invoiceLean
        .findOne({ ...filterwithId, ...filter })
        .lean()
        .populate([populateInvoiceRelated(), populateTrackEdit(), populateTrackView()]);
    if (!invoice || !invoice.invoiceRelated) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const returned = makeInvoiceRelatedPdct(invoice.invoiceRelated, invoice.invoiceRelated
        .billingUserId, invoice.createdAt, { _id: invoice._id,
        urId: invoice.urId
    });
    // addParentToLocals(res, invoiceRelated._id, invoiceLean.collection.collectionName, 'trackDataView'); // TODO
    return res.status(200).send(returned);
});
invoiceRoutes.get('/all/:offset/:limit', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'read'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { filter } = makeCompanyBasedQuery(req);
    const all = await Promise.all([
        invoiceLean
            .find({ ...filter })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate([populateInvoiceRelated(), populateTrackEdit(), populateTrackView()]),
        invoiceLean.countDocuments({ ...filter })
    ]);
    const returned = all[0]
        .filter(val => val && val.invoiceRelated)
        .map(val => makeInvoiceRelatedPdct(val.invoiceRelated, val.invoiceRelated?.billingUserId, 
    // eslint-disable-next-line no-undefined
    undefined, {
        _id: val._id
    }));
    const response = {
        count: all[1],
        data: returned
    };
    for (const val of all[0]) {
        addParentToLocals(res, val._id, invoiceLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
invoiceRoutes.put('/delete/one', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'delete'), async (req, res) => {
    const { _id } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const found = await invoiceLean.findOne({ _id }).lean();
    if (!found) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const updateRes = await deleteAllLinked(found.invoiceRelated, 'invoice', filter.companyId);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    addParentToLocals(res, _id, invoiceLean.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
invoiceRoutes.post('/filter', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'read'), async (req, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
    const aggCursor = invoiceLean
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
        addParentToLocals(res, val._id, invoiceLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
invoiceRoutes.put('/delete/many', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const promises = _ids
        .map(async (val) => {
        const found = await invoiceLean.findOne({ _id: val }).lean();
        if (found) {
            await deleteAllLinked(found.invoiceRelated, 'invoice', filter.companyId);
        }
        return new Promise(resolve => resolve(found?._id));
    });
    const filterdExist = await Promise.all(promises);
    for (const val of filterdExist.filter(value => value)) {
        addParentToLocals(res, val, invoiceLean.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
// payments
invoiceRoutes.post('/createpayment', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'create'), async (req, res) => {
    const pay = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    pay.companyId = filter.companyId;
    pay.urId = await generateUrId(receiptLean);
    /* const newInvoicePaym = new receiptMain(pay);

  const savedRes = await newInvoicePaym.save().catch(err => {
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
  } */
    await makePaymentInstall(res, pay, pay.invoiceRelated, filter.companyId, pay.creationType);
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=invoice.routes.js.map
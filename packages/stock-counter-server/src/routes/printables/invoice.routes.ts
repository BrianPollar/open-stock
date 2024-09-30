import {
  populateTrackEdit, populateTrackView, requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord
} from '@open-stock/stock-auth-server';
import {
  IcustomRequest, IdataArrayResponse,
  IdeleteMany,
  IdeleteOne,
  IfilterAggResponse,
  IfilterProps, Iinvoice, IinvoiceRelated,
  Ireceipt, Isuccess, Iuser, TestimateStage, TinvoiceType
} from '@open-stock/stock-universal';
import {
  addParentToLocals, constructFiltersFromBody,
  generateUrId, lookupSubFieldInvoiceRelatedFilter,
  makeCompanyBasedQuery, offsetLimitRelegator,
  requireAuth, roleAuthorisation,
  stringifyMongooseErr
} from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { Tinvoice, invoiceLean, invoiceMain } from '../../models/printables/invoice.model';
import { Treceipt, receiptLean, receiptMain } from '../../models/printables/receipt.model';
import { invoiceRelatedMain } from '../../models/printables/related/invoicerelated.model';
import { populateInvoiceRelated } from '../../utils/query';
import { makePaymentInstall } from '../paymentrelated/paymentrelated';
import {
  deleteAllLinked,
  makeInvoiceRelatedPdct,
  relegateInvRelatedCreation, updateInvoiceRelated
} from './related/invoicerelated';

/** Logger for invoice routes */
const invoiceRoutesLogger = tracer.colorConsole({
  format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
  dateformat: 'HH:MM:ss.L',
  transport(data) {
    // eslint-disable-next-line no-console
    console.log(data.output);
    const logDir = path.join(process.cwd() + '/openstockLog/');

    fs.mkdir(logDir, { recursive: true }, (err) => {
      if (err) {
        if (err) {
          // eslint-disable-next-line no-console
          console.log('data.output err ', err);
        }
      }
    });
    fs.appendFile(logDir + '/counter-server.log', data.rawoutput + '\n', err => {
      if (err) {
        // eslint-disable-next-line no-console
        console.log('raw.output err ', err);
      }
    });
  }
});

/**
 * Generates a new invoice ID based on the given query ID.
 * @param companyId The query ID used to generate the invoice ID.
 * @returns A Promise that resolves to the generated invoice ID.
 */
const makeinvoiceId = async(companyId: string): Promise<number> => {
  const count = await invoiceRelatedMain
    .find({ companyId, invoiceId: { $exists: true, $ne: null } })
    .sort({ _id: -1 }).limit(1).lean().select({ invoiceId: 1 });
  let incCount = count[0]?.invoiceId || 0;

  return ++incCount;
};

export const saveInvoice = async(
  res,
  invoice: Iinvoice,
  invoiceRelated: Required<IinvoiceRelated>,
  companyId: string
): Promise<Isuccess & { _id?: string; invoiceRelatedId?: string }> => {
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
  let errResponse: Isuccess;
  const saved = await newInvoice.save()
    .catch(err => {
      invoiceRoutesLogger.error('create - err: ', err);
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

      return err;
    });

  if (errResponse) {
    return {
      ...errResponse
    };
  }

  if (saved && saved._id) {
    addParentToLocals(res, saved._id, invoiceLean.collection.collectionName, 'makeTrackEdit');
  }

  // await updateInvoiceRelated(invoiceRelated); // !! WHY CALL THIS

  return { success: true, status: 200, _id: (saved as {_id: string})._id, invoiceRelatedId: relatedId._id };
};

/**
 * Router for handling invoice routes.
 */
export const invoiceRoutes = express.Router();

invoiceRoutes.post(
  '/add',
  requireAuth,
  requireActiveCompany,
  requireCanUseFeature('invoice'),
  roleAuthorisation('invoices', 'create'),
  async(req: IcustomRequest<never, { invoice: Iinvoice; invoiceRelated: Required<IinvoiceRelated>}>, res, next) => {
    const { invoice, invoiceRelated } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    invoice.companyId = filter.companyId;
    invoice.urId = await generateUrId(invoiceMain);
    invoiceRelated.companyId = filter.companyId;
    const response = await saveInvoice(res, invoice, invoiceRelated, filter.companyId);

    if (!response.success) {
      return res.status(response.status).send({ success: response.success });
    }

    return next();
  },
  requireUpdateSubscriptionRecord('invoice')
);

invoiceRoutes.put(
  '/update',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('invoices', 'update'),
  async(req: IcustomRequest<never, { updatedInvoice: Iinvoice; invoiceRelated: Required<IinvoiceRelated>}>, res) => {
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
    let errResponse: Isuccess;
    const updated = await invoiceMain.updateOne({
      _id, ...filter
    }, {
      $set: {
        dueDate: updatedInvoice.dueDate || invoice.dueDate,
        isDeleted: updatedInvoice.isDeleted || invoice.isDeleted
      }
    })
      .catch(err => {
        invoiceRoutesLogger.error('update - err: ', err);
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

    addParentToLocals(res, invoice._id, invoiceLean.collection.collectionName, 'makeTrackEdit');

    return res.status(200).send({ success: Boolean(updated) });
  }
);

invoiceRoutes.get(
  '/one/:urId',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('invoices', 'read'),
  async(req: IcustomRequest<{ urId: string }, null>, res) => {
    const { urId } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const invoice = await invoiceLean
      .findOne({ urId, ...filter })
      .lean()
      .populate([populateInvoiceRelated(), populateTrackEdit(), populateTrackView()]);

    if (!invoice || !invoice.invoiceRelated) {
      return res.status(404).send({ success: false, err: 'not found' });
    }

    const returned = makeInvoiceRelatedPdct(
      invoice.invoiceRelated as Required<IinvoiceRelated>,
      (invoice.invoiceRelated as IinvoiceRelated)
        .billingUserId as unknown as Iuser,
      invoice.createdAt,
      { _id: invoice._id,
        urId: invoice.urId
      }
    );

    // addParentToLocals(res, invoiceRelated._id, invoiceLean.collection.collectionName, 'trackDataView'); // TODO

    return res.status(200).send(returned);
  }
);

invoiceRoutes.get(
  '/all/:offset/:limit',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('invoices', 'read'),
  async(req: IcustomRequest<{ offset: string; limit: string }, null>, res) => {
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
      .map(val => makeInvoiceRelatedPdct(
      val.invoiceRelated as Required<IinvoiceRelated>,
      (val.invoiceRelated as IinvoiceRelated)?.billingUserId as unknown as Iuser,
      null,
      {
        _id: val._id
      }
      ));
    const response: IdataArrayResponse<IinvoiceRelated> = {
      count: all[1],
      data: returned
    };

    for (const val of all[0]) {
      addParentToLocals(res, val._id, invoiceLean.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

invoiceRoutes.put(
  '/delete/one',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('invoices', 'delete'),
  async(req: IcustomRequest<never, IdeleteOne>, res) => {
    const { _id } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const found = await invoiceLean.findOne({ _id }).lean();

    if (!found) {
      return res.status(404).send({ success: false, err: 'not found' });
    }
    const deleted = await deleteAllLinked(found.invoiceRelated as string, 'invoice', filter.companyId);

    if (Boolean(deleted)) {
      addParentToLocals(res, _id, invoiceLean.collection.collectionName, 'trackDataDelete');

      return res.status(200).send({ success: Boolean(deleted) });
    } else {
      return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
  }
);

invoiceRoutes.post(
  '/filter',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('invoices', 'read'),
  async(req: IcustomRequest<never, IfilterProps>, res) => {
    const { propSort } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);

    const aggCursor = invoiceLean
      .aggregate<IfilterAggResponse<Tinvoice>>([
        ...lookupSubFieldInvoiceRelatedFilter(constructFiltersFromBody(req), propSort, offset, limit)
      ]);
    const dataArr: IfilterAggResponse<Tinvoice>[] = [];

    for await (const data of aggCursor) {
      dataArr.push(data);
    }

    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;

    const returned = all
      .filter(val => val && val.invoiceRelated)
      .map(val => makeInvoiceRelatedPdct(
      val.invoiceRelated as Required<IinvoiceRelated>,
      (val.invoiceRelated as IinvoiceRelated)?.billingUserId as unknown as Iuser
      ));

    const response: IdataArrayResponse<IinvoiceRelated> = {
      count,
      data: returned
    };

    for (const val of all) {
      addParentToLocals(res, val._id, invoiceLean.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

invoiceRoutes.put(
  '/delete/many',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('invoices', 'delete'),
  async(req: IcustomRequest<never, IdeleteMany>, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    const promises = _ids
      .map(async val => {
        const found = await invoiceLean.findOne({ _id: val }).lean();

        if (found) {
          await deleteAllLinked(found.invoiceRelated as string, 'invoice', filter.companyId);
        }

        return new Promise(resolve => resolve(found._id));
      });

    const filterdExist = await Promise.all(promises) as string[];

    for (const val of filterdExist) {
      addParentToLocals(res, val, invoiceLean.collection.collectionName, 'trackDataDelete');
    }

    return res.status(200).send({ success: true });
  }
);

// payments
invoiceRoutes.post(
  '/createpayment',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('invoices', 'create'),
  async(req: IcustomRequest<never, {
    companyId: string; urId: string; invoiceRelated: string; creationType: TinvoiceType;}>, res) => {
    const pay = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    pay.companyId = filter.companyId;

    pay.urId = await generateUrId(receiptLean);

    /* const newInvoicePaym = new receiptMain(pay);
  let errResponse: Isuccess;
  const saved = await newInvoicePaym.save().catch(err => {
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

    await makePaymentInstall(res, pay as Ireceipt, pay.invoiceRelated, filter.companyId, pay.creationType);

    return res.status(200).send({ success: true });
  }
);

// TODO remove define related caller
/* invoiceRoutes.put(
  '/updatepayment',
  requireAuth,
  requireActiveCompany, roleAuthorisation('invoices', 'update'), async(req: IcustomRequest<never, unknown>, res) => {
  const pay = req.body;
  const { companyId } = req.user;


  pay.companyId = companyId;
  const isValid = verifyObjectIds([pay._id, companyId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  await updateInvoiceRelated(invoiceRelated, companyId);

  const foundPay = await receiptMain
    .findByIdAndUpdate(pay._id);
  if (!foundPay) {
    return res.status(404).send({ success: false });
  }
  foundPay.amount = pay.amount || foundPay.amount;
  let errResponse: Isuccess;
  await foundPay.save().catch(err => {
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

  return res.status(200).send({ success: true });
}); */

// TODO remove this
invoiceRoutes.get(
  '/getonepayment/:urId',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('invoices', 'read'),
  async(req: IcustomRequest<never, null>, res) => {
    const { urId } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const invoicePay = await receiptLean
      .findOne({ urId, ...filter })
      .lean();

    return res.status(200).send(invoicePay);
  }
);

// TODO remove this
invoiceRoutes.get(
  '/getallpayments',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('invoices', 'read'),
  async(req: IcustomRequest<{ offset: string; limit: string }, null>, res) => {
    const { filter } = makeCompanyBasedQuery(req);
    const all = await Promise.all([
      receiptLean
        .find(filter)
        .lean(),
      receiptLean.countDocuments(filter)
    ]);
    const response: IdataArrayResponse<Treceipt> = {
      count: all[1],
      data: all[0]
    };

    return res.status(200).send(response);
  }
);


// TODO remove this
invoiceRoutes.put(
  '/deleteonepayment',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('invoices', 'delete'),
  async(req: IcustomRequest<never, {
     invoiceRelated: string; creationType: TinvoiceType; stage: TestimateStage;}>, res) => {
    const { invoiceRelated } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const deleted = await deleteAllLinked(invoiceRelated, 'invoice', filter.companyId);

    if (Boolean(deleted)) {
      return res.status(200).send({ success: Boolean(deleted) });
    } else {
      return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
  }
);

// TODO remove this
invoiceRoutes.put(
  '/deletemanypayments',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('invoices', 'delete'),
  async(req: IcustomRequest<never, { _ids: string[]}>, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    const deleted = await receiptMain
      .deleteMany({ _id: { $in: _ids }, ...filter })
      .catch(err => {
        invoiceRoutesLogger.error('deletemanypayments - err: ', err);

        return null;
      });

    if (Boolean(deleted)) {
      return res.status(200).send({ success: Boolean(deleted) });
    } else {
      return res.status(404).send({
        success: Boolean(deleted),
        err: 'could not delete selected items, try again in a while' });
    }
  }
);

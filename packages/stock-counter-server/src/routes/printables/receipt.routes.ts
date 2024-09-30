/**
 * Defines the routes for creating, retrieving, updating and deleting receipts.
 * @remarks
 * This file contains the following routes:
 * - POST /create - creates a new receipt
 * - GET /one/:urId - retrieves a single receipt by its unique identifier (urId)
 * - GET /all/:offset/:limit - retrieves all receipts with pagination
 * - PUT /delete/one - deletes a single receipt and its related documents
 * - POST /filter/:offset/:limit - searches for receipts based on a search term and key
 */

import {
  IcustomRequest, IdataArrayResponse,
  IdeleteMany,
  IdeleteOne,
  IfilterAggResponse, IfilterProps, IinvoiceRelated,
  Ireceipt, Iuser
} from '@open-stock/stock-universal';
import {
  addParentToLocals,
  constructFiltersFromBody,
  generateUrId,
  lookupSubFieldInvoiceRelatedFilter,
  makeCompanyBasedQuery, offsetLimitRelegator,
  requireAuth,
  roleAuthorisation
} from '@open-stock/stock-universal-server';
import express from 'express';
// import { paymentInstallsLean } from '../../models/printables/paymentrelated/paymentsinstalls.model';
import {
  populateTrackEdit, populateTrackView, requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord
} from '@open-stock/stock-auth-server';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { Treceipt, receiptLean, receiptMain } from '../../models/printables/receipt.model';
import { populateInvoiceRelated } from '../../utils/query';
import { makePaymentInstall } from '../paymentrelated/paymentrelated';
import {
  deleteAllLinked, makeInvoiceRelatedPdct, relegateInvRelatedCreation, updateInvoiceRelated
} from './related/invoicerelated';

/**
 * Logger for pickup location routes
 */
const receiptRoutesLogger = tracer.colorConsole({
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
 * Router for handling receipt routes.
 */
export const receiptRoutes = express.Router();

receiptRoutes.post(
  '/add',
  requireAuth,
  requireActiveCompany,
  requireCanUseFeature('receipt'),
  roleAuthorisation('receipts', 'create'),
  async(req: IcustomRequest<never, { receipt: Ireceipt; invoiceRelated: Required<IinvoiceRelated>}>, res, next) => {
    const { receipt, invoiceRelated } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    receipt.companyId = filter.companyId;
    invoiceRelated.companyId = filter.companyId;

    receipt.urId = await generateUrId(receiptMain);
    const extraNotifDesc = 'Newly created receipt';
    const invoiceRelatedRes = await relegateInvRelatedCreation(res, invoiceRelated, filter.companyId, extraNotifDesc);

    if (!invoiceRelatedRes.success) {
      return res.status(invoiceRelatedRes.status).send(invoiceRelatedRes);
    }

    receipt.invoiceRelated = invoiceRelatedRes._id;
    await makePaymentInstall(res, receipt, invoiceRelatedRes._id, filter.companyId, invoiceRelated.creationType);

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
  },
  requireUpdateSubscriptionRecord('receipt')
);

receiptRoutes.get(
  '/one/:urId',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('receipts', 'read'),
  async(req: IcustomRequest<{ urId: string }, null>, res) => {
    const { urId } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const receipt = await receiptLean
      .findOne({ urId, ...filter })
      .lean()
      .populate([populateInvoiceRelated(), populateTrackEdit(), populateTrackView()]);

    if (!receipt || !receipt.invoiceRelated) {
      return res.status(404).send({ success: false, err: 'not found' });
    }

    const relateds = makeInvoiceRelatedPdct(
      receipt.invoiceRelated as Required<IinvoiceRelated>,
      (receipt.invoiceRelated as IinvoiceRelated)?.billingUserId as unknown as Iuser
    );

    // ensure reciepts are properly being populated
    const returned = { ...receipt, ...relateds, ...{
      _id: receipt._id,
      urId: receipt.urId
    } };

    addParentToLocals(res, receipt._id, receiptLean.collection.collectionName, 'trackDataView');

    return res.status(200).send(returned);
  }
);

receiptRoutes.get(
  '/all/:offset/:limit',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('receipts', 'read'),
  async(req: IcustomRequest<{ offset: string; limit: string }, null>, res) => {
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
        const related = makeInvoiceRelatedPdct(
      val.invoiceRelated as Required<IinvoiceRelated>,
      (val.invoiceRelated as IinvoiceRelated)?.billingUserId as unknown as Iuser
        );

        return { ...val, ...related, ...{
          _id: val._id,
          urId: val.urId
        } };
      });
    const response: IdataArrayResponse<Treceipt> = {
      count: all[1],
      data: returned
    };

    for (const val of all[0]) {
      addParentToLocals(res, val._id, receiptLean.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

receiptRoutes.put(
  '/delete/one',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('receipts', 'delete'),
  async(req: IcustomRequest<never, IdeleteOne>, res) => {
    const { _id } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const found = await receiptLean.findOne({ _id }).lean();

    if (!found) {
      return res.status(404).send({ success: false, err: 'not found' });
    }
    const deleted = await deleteAllLinked(found.invoiceRelated as string, 'receipt', filter.companyId);

    if (Boolean(deleted)) {
      addParentToLocals(res, _id, receiptLean.collection.collectionName, 'trackDataDelete');

      return res.status(200).send({ success: Boolean(deleted) });
    } else {
      return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
  }
);

receiptRoutes.post(
  '/filter',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('receipts', 'read'),
  async(req: IcustomRequest<never, IfilterProps>, res) => {
    const { propSort } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);

    const aggCursor = receiptLean
      .aggregate<IfilterAggResponse<Treceipt>>([
        ...lookupSubFieldInvoiceRelatedFilter(constructFiltersFromBody(req), propSort, offset, limit)
      ]);
    const dataArr: IfilterAggResponse<Treceipt>[] = [];

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
      addParentToLocals(res, val._id, receiptLean.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

receiptRoutes.put(
  '/update',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('receipts', 'update'),
  async(req: IcustomRequest<never, { updatedReceipt: Treceipt; invoiceRelated: Required<IinvoiceRelated>}>, res) => {
    const { updatedReceipt, invoiceRelated } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    const found = await receiptMain
      .findOne({ _id: updatedReceipt._id, ...filter })
      .lean();

    if (!found) {
      return res.status(404).send({ success: false, status: 404, err: 'not found' });
    }

    let savedErr: string;

    await receiptMain.updateOne({
      _id: updatedReceipt._id, ...filter
    }, {
      $set: {
        paymentMode: updatedReceipt.paymentMode || found.paymentMode,
        isDeleted: updatedReceipt.isDeleted || found.isDeleted
      }
    }).catch(err => {
      receiptRoutesLogger.error('save error', err);
      savedErr = err;

      return null;
    });
    if (savedErr) {
      return res.status(500).send({ success: false });
    }

    addParentToLocals(res, found._id, receiptLean.collection.collectionName, 'makeTrackEdit');

    await updateInvoiceRelated(res, invoiceRelated);

    return res.status(200).send({ success: true });
  }
);

receiptRoutes.put(
  '/delete/many',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('receipts', 'delete'),
  async(req: IcustomRequest<never, IdeleteMany>, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    const promises = _ids
      .map(async val => {
        const found = await receiptLean.findOne({ _id: val }).lean();

        if (found) {
          await deleteAllLinked(found.invoiceRelated as string, 'receipt', filter.companyId);
        }

        return new Promise(resolve => resolve(found._id));
      });

    const filterdExist = await Promise.all(promises) as string[];

    for (const val of filterdExist) {
      addParentToLocals(res, val, receiptLean.collection.collectionName, 'trackDataDelete');
    }

    return res.status(200).send({ success: true });
  }
);

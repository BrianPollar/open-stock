

import {
  populateTrackEdit, populateTrackView, requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord
} from '@open-stock/stock-auth-server';
import {
  IcustomRequest, IdataArrayResponse,
  IdeleteMany,
  IdeleteOne,
  IfilterAggResponse, IfilterProps, IinvoiceRelated,
  Isuccess, Iuser
} from '@open-stock/stock-universal';
import {
  addParentToLocals,
  constructFiltersFromBody, generateUrId,
  lookupSubFieldInvoiceRelatedFilter, makeCompanyBasedQuery,
  offsetLimitRelegator, requireAuth, roleAuthorisation,
  stringifyMongooseErr
} from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import { Promise } from 'mongoose';
import path from 'path';
import * as tracer from 'tracer';
import { TdeliveryNote, deliveryNoteLean, deliveryNoteMain } from '../../models/printables/deliverynote.model';
import { populateInvoiceRelated } from '../../utils/query';
import {
  deleteAllLinked, makeInvoiceRelatedPdct,
  relegateInvRelatedCreation,
  updateInvoiceRelated
} from './related/invoicerelated';

/** Logger for delivery note routes */
const deliveryNoteRoutesLogger = tracer.colorConsole({
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
 * Express router for delivery note routes.
 */
export const deliveryNoteRoutes = express.Router();

deliveryNoteRoutes.post(
  '/add',
  requireAuth,
  requireActiveCompany,
  requireCanUseFeature('quotation'),
  roleAuthorisation('deliveryNotes', 'create'),
  async(req: IcustomRequest<never, { deliveryNote; invoiceRelated: Required<IinvoiceRelated>}>, res, next) => {
    const { deliveryNote, invoiceRelated } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    deliveryNote.companyId = filter.companyId;
    invoiceRelated.companyId = filter.companyId;

    deliveryNote.urId = await generateUrId(deliveryNoteMain);
    const extraNotifDesc = 'Newly generated delivery note';
    const invoiceRelatedRes = await relegateInvRelatedCreation(res, invoiceRelated, filter.companyId, extraNotifDesc);

    if (!invoiceRelatedRes.success) {
      return res.status(invoiceRelatedRes.status).send(invoiceRelatedRes);
    }
    deliveryNote.invoiceRelated = invoiceRelatedRes._id;
    const newDeliveryNote = new deliveryNoteMain(deliveryNote);
    let errResponse: Isuccess;

    const saved = await newDeliveryNote.save()
      .catch(err => {
        deliveryNoteRoutesLogger.error('create - err: ', err);
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
      return res.status(403).send(errResponse);
    }

    if (saved && saved._id) {
      addParentToLocals(res, saved._id, deliveryNoteLean.collection.collectionName, 'makeTrackEdit');
    }

    await updateInvoiceRelated(res, invoiceRelated);

    return next();
  },
  requireUpdateSubscriptionRecord('quotation')
);

deliveryNoteRoutes.get(
  '/one/:urId',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('deliveryNotes', 'read'),
  async(req: IcustomRequest<{ urId: string }, null>, res) => {
    const { urId } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const deliveryNote = await deliveryNoteLean
      .findOne({ urId, ...filter })
      .lean()
      .populate([populateInvoiceRelated(), populateTrackEdit(), populateTrackView()]);

    if (!deliveryNote || !deliveryNote.invoiceRelated) {
      return res.status(404).send({ success: false, err: 'not found' });
    }

    const returned = makeInvoiceRelatedPdct(
      deliveryNote.invoiceRelated as Required<IinvoiceRelated>,
      (deliveryNote.invoiceRelated as IinvoiceRelated)
        .billingUserId as unknown as Iuser,
      deliveryNote.createdAt,
      {
        _id: deliveryNote._id,
        urId: deliveryNote.urId
      }
    );

    addParentToLocals(res, deliveryNote._id, deliveryNoteLean.collection.collectionName, 'trackDataView');

    return res.status(200).send(returned);
  }
);

deliveryNoteRoutes.get(
  '/all/:offset/:limit',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('deliveryNotes', 'read'),
  async(req: IcustomRequest<{ offset: string; limit: string }, null>, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { filter } = makeCompanyBasedQuery(req);
    const all = await Promise.all([
      deliveryNoteLean
        .find(filter)
        .skip(offset)
        .limit(limit)
        .lean()
        .populate([populateInvoiceRelated(), populateTrackEdit(), populateTrackView()]),
      deliveryNoteLean.countDocuments(filter)
    ]);
    const returned = all[0]
      .filter(val => val && val.invoiceRelated)
      .map(val => makeInvoiceRelatedPdct(
      val.invoiceRelated as Required<IinvoiceRelated>,
      (val.invoiceRelated as IinvoiceRelated)
        .billingUserId as unknown as Iuser,
      (val).createdAt,
      {
        _id: val._id,
        urId: val.urId
      }
      ));
    const response: IdataArrayResponse<IinvoiceRelated> = {
      count: all[1],
      data: returned
    };

    for (const val of all[0]) {
      addParentToLocals(res, val._id, deliveryNoteLean.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

deliveryNoteRoutes.put(
  '/delete/one',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('deliveryNotes', 'delete'),
  async(req: IcustomRequest<never, IdeleteOne>, res) => {
    const { _id } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const found = await deliveryNoteLean.findOne({ _id }).lean();

    if (!found) {
      return res.status(404).send({ success: false, err: 'not found' });
    }
    const deleted = await deleteAllLinked(found.invoiceRelated as string, 'deliverynote', filter.companyId);

    if (Boolean(deleted)) {
      addParentToLocals(res, _id, deliveryNoteLean.collection.collectionName, 'trackDataDelete');

      return res.status(200).send({ success: Boolean(deleted) });
    } else {
      return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
  }
);

deliveryNoteRoutes.post(
  '/filter',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('deliveryNotes', 'read'),
  async(req: IcustomRequest<never, IfilterProps>, res) => {
    const { propSort } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);

    const aggCursor = deliveryNoteLean
      .aggregate<IfilterAggResponse<TdeliveryNote>>([
        ...lookupSubFieldInvoiceRelatedFilter(constructFiltersFromBody(req), propSort, offset, limit)
      ]);
    const dataArr: IfilterAggResponse<TdeliveryNote>[] = [];

    for await (const data of aggCursor) {
      dataArr.push(data);
    }

    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;

    const returned = all
      .filter(val => val && val.invoiceRelated)
      .map(val => makeInvoiceRelatedPdct(
      val.invoiceRelated as Required<IinvoiceRelated>,
      (val.invoiceRelated as IinvoiceRelated)
        .billingUserId as unknown as Iuser
      ));
    const response: IdataArrayResponse<IinvoiceRelated> = {
      count,
      data: returned
    };

    for (const val of all) {
      addParentToLocals(res, val._id, deliveryNoteLean.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

deliveryNoteRoutes.put(
  '/delete/many',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('deliveryNotes', 'delete'),
  async(req: IcustomRequest<never, IdeleteMany>, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    const promises = _ids
      .map(async _id => {
        const found = await deliveryNoteLean.findOne({ _id }).lean();

        if (found) {
          await deleteAllLinked(found.invoiceRelated as string, 'deliverynote', filter.companyId);
        }

        return new Promise(resolve => resolve(found._id));
      });

    const filterdExist = await Promise.all(promises) as string[];

    for (const val of filterdExist) {
      addParentToLocals(res, val, deliveryNoteLean.collection.collectionName, 'trackDataDelete');
    }

    return res.status(200).send({ success: true });
  }
);


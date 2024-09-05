

import { populateTrackEdit, populateTrackView, requireActiveCompany } from '@open-stock/stock-auth-server';
import { Icustomrequest, IdataArrayResponse, IinvoiceRelated, Iuser } from '@open-stock/stock-universal';
import { addParentToLocals, makeCompanyBasedQuery, offsetLimitRelegator, requireAuth, roleAuthorisation, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { invoiceRelatedLean } from '../../../models/printables/related/invoicerelated.model';
import { populateBillingUser, populatePayments } from '../../../utils/query';
import { makeInvoiceRelatedPdct, updateInvoiceRelated } from './invoicerelated';

/** Logger for file storage */
const fileStorageLogger = tracer.colorConsole({
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
 * Router for handling invoice related routes.
 */
export const invoiceRelateRoutes = express.Router();

/**
 * Get a single invoice related product by ID
 * @param id - The ID of the invoice related product to retrieve
 * @returns The retrieved invoice related product
 */
invoiceRelateRoutes.get('/getone/:id/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'read'), async(req, res) => {
  const { filter } = makeCompanyBasedQuery(req);
  const { id } = req.params;

  const related = await invoiceRelatedLean
    .findOne({ _id: id, ...filter })
    .lean()
    .populate([populateBillingUser(), populatePayments(), populateTrackEdit(), populateTrackView()]);
  let returned;

  if (related) {
    returned = makeInvoiceRelatedPdct(
      related as Required<IinvoiceRelated>,
        (related as unknown as IinvoiceRelated)
          .billingUserId as unknown as Iuser
    );

    addParentToLocals(res, related._id, 'invoicerelateds', 'trackDataView');
  }

  return res.status(200).send(returned);
});

/**
 * Get all invoice related products with pagination
 * @param offset - The offset to start retrieving invoice related products from
 * @param limit - The maximum number of invoice related products to retrieve
 * @returns The retrieved invoice related products
 */
invoiceRelateRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'read'), async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const { filter } = makeCompanyBasedQuery(req);
  const all = await Promise.all([
    invoiceRelatedLean
      .find({ ...filter })
      .skip(offset)
      .limit(limit)
      .lean()
      .populate([populateBillingUser(), populatePayments(), populateTrackEdit(), populateTrackView()])
      .catch(err => {
        fileStorageLogger.error('getall - err: ', err);

        return null;
      }),
    invoiceRelatedLean.countDocuments({ ...filter })
  ]);
  const response: IdataArrayResponse = {
    count: all[1],
    data: null
  };

  if (all[0]) {
    const returned = all[0]
      .map(val => makeInvoiceRelatedPdct(
        val as Required<IinvoiceRelated>,
        (val as IinvoiceRelated)
          .billingUserId as unknown as Iuser
      ));

    response.data = returned;

    for (const val of all[0]) {
      addParentToLocals(res, val._id, 'invoicerelateds', 'trackDataView');
    }

    return res.status(200).send(response);
  } else {
    return res.status(200).send(response);
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
invoiceRelateRoutes.post('/search/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'read'), async(req, res) => {
  const { searchterm, searchKey } = req.body;
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const { filter } = makeCompanyBasedQuery(req);
  const all = await Promise.all([
    invoiceRelatedLean
      .find({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
      .skip(offset)
      .limit(limit)
      .lean()
      .populate([populateBillingUser(), populatePayments(), populateTrackEdit(), populateTrackView()])
      .catch(err => {
        fileStorageLogger.error('getall - err: ', err);

        return null;
      }),
    invoiceRelatedLean.countDocuments({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
  ]);
  const response: IdataArrayResponse = {
    count: all[1],
    data: null
  };

  if (all[0]) {
    const returned = all[0]
      .map(val => makeInvoiceRelatedPdct(
        val as Required<IinvoiceRelated>,
        (val as IinvoiceRelated)
          .billingUserId as unknown as Iuser
      ));

    response.data = returned;

    return res.status(200).send(response);
  } else {
    return res.status(200).send(response);
  }
});

/**
 * Update an invoicereturned product
 * @param invoiceRelated - The updated invoice related product
 * @returns A success message if the update was successful
 */
invoiceRelateRoutes.put('/update/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('invoices', 'update'), async(req, res) => {
  const { invoiceRelated } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;

  invoiceRelated.companyId = queryId;
  const isValid = verifyObjectIds([invoiceRelated.invoiceRelated, queryId]);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  await updateInvoiceRelated(res, invoiceRelated, companyId);

  return res.status(200).send({ success: true });
});

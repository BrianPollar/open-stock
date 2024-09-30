"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiptRoutes = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
// import { paymentInstallsLean } from '../../models/printables/paymentrelated/paymentsinstalls.model';
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const receipt_model_1 = require("../../models/printables/receipt.model");
const query_1 = require("../../utils/query");
const paymentrelated_1 = require("../paymentrelated/paymentrelated");
const invoicerelated_1 = require("./related/invoicerelated");
/**
 * Logger for pickup location routes
 */
const receiptRoutesLogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = path_1.default.join(process.cwd() + '/openstockLog/');
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
exports.receiptRoutes = express_1.default.Router();
exports.receiptRoutes.post('/add', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('receipt'), (0, stock_universal_server_1.roleAuthorisation)('receipts', 'create'), async (req, res, next) => {
    const { receipt, invoiceRelated } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    receipt.companyId = filter.companyId;
    invoiceRelated.companyId = filter.companyId;
    receipt.urId = await (0, stock_universal_server_1.generateUrId)(receipt_model_1.receiptMain);
    const extraNotifDesc = 'Newly created receipt';
    const invoiceRelatedRes = await (0, invoicerelated_1.relegateInvRelatedCreation)(res, invoiceRelated, filter.companyId, extraNotifDesc);
    if (!invoiceRelatedRes.success) {
        return res.status(invoiceRelatedRes.status).send(invoiceRelatedRes);
    }
    receipt.invoiceRelated = invoiceRelatedRes._id;
    await (0, paymentrelated_1.makePaymentInstall)(res, receipt, invoiceRelatedRes._id, filter.companyId, invoiceRelated.creationType);
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
}, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('receipt'));
exports.receiptRoutes.get('/one/:urId', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('receipts', 'read'), async (req, res) => {
    const { urId } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const receipt = await receipt_model_1.receiptLean
        .findOne({ urId, ...filter })
        .lean()
        .populate([(0, query_1.populateInvoiceRelated)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()]);
    if (!receipt || !receipt.invoiceRelated) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const relateds = (0, invoicerelated_1.makeInvoiceRelatedPdct)(receipt.invoiceRelated, receipt.invoiceRelated?.billingUserId);
    // ensure reciepts are properly being populated
    const returned = { ...receipt, ...relateds, ...{
            _id: receipt._id,
            urId: receipt.urId
        } };
    (0, stock_universal_server_1.addParentToLocals)(res, receipt._id, receipt_model_1.receiptLean.collection.collectionName, 'trackDataView');
    return res.status(200).send(returned);
});
exports.receiptRoutes.get('/all/:offset/:limit', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('receipts', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        receipt_model_1.receiptLean
            .find(filter)
            .skip(offset)
            .limit(limit)
            .lean()
            .populate([(0, query_1.populateInvoiceRelated)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()]),
        receipt_model_1.receiptLean.countDocuments(filter)
    ]);
    const returned = all[0]
        .filter(val => val && val.invoiceRelated)
        .map(val => {
        const related = (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated?.billingUserId);
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
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, receipt_model_1.receiptLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.receiptRoutes.put('/delete/one', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('receipts', 'delete'), async (req, res) => {
    const { _id } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const found = await receipt_model_1.receiptLean.findOne({ _id }).lean();
    if (!found) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const deleted = await (0, invoicerelated_1.deleteAllLinked)(found.invoiceRelated, 'receipt', filter.companyId);
    if (Boolean(deleted)) {
        (0, stock_universal_server_1.addParentToLocals)(res, _id, receipt_model_1.receiptLean.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.receiptRoutes.post('/filter', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('receipts', 'read'), async (req, res) => {
    const { propSort } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const aggCursor = receipt_model_1.receiptLean
        .aggregate([
        ...(0, stock_universal_server_1.lookupSubFieldInvoiceRelatedFilter)((0, stock_universal_server_1.constructFiltersFromBody)(req), propSort, offset, limit)
    ]);
    const dataArr = [];
    for await (const data of aggCursor) {
        dataArr.push(data);
    }
    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;
    const returned = all
        .filter(val => val && val.invoiceRelated)
        .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated?.billingUserId));
    const response = {
        count,
        data: returned
    };
    for (const val of all) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, receipt_model_1.receiptLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.receiptRoutes.put('/update', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('receipts', 'update'), async (req, res) => {
    const { updatedReceipt, invoiceRelated } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const found = await receipt_model_1.receiptMain
        .findOne({ _id: updatedReceipt._id, ...filter })
        .lean();
    if (!found) {
        return res.status(404).send({ success: false, status: 404, err: 'not found' });
    }
    let savedErr;
    await receipt_model_1.receiptMain.updateOne({
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
    (0, stock_universal_server_1.addParentToLocals)(res, found._id, receipt_model_1.receiptLean.collection.collectionName, 'makeTrackEdit');
    await (0, invoicerelated_1.updateInvoiceRelated)(res, invoiceRelated);
    return res.status(200).send({ success: true });
});
exports.receiptRoutes.put('/delete/many', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('receipts', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const promises = _ids
        .map(async (val) => {
        const found = await receipt_model_1.receiptLean.findOne({ _id: val }).lean();
        if (found) {
            await (0, invoicerelated_1.deleteAllLinked)(found.invoiceRelated, 'receipt', filter.companyId);
        }
        return new Promise(resolve => resolve(found._id));
    });
    const filterdExist = await Promise.all(promises);
    for (const val of filterdExist) {
        (0, stock_universal_server_1.addParentToLocals)(res, val, receipt_model_1.receiptLean.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=receipt.routes.js.map
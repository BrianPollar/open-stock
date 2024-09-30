"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceRoutes = exports.saveInvoice = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const invoice_model_1 = require("../../models/printables/invoice.model");
const receipt_model_1 = require("../../models/printables/receipt.model");
const invoicerelated_model_1 = require("../../models/printables/related/invoicerelated.model");
const query_1 = require("../../utils/query");
const paymentrelated_1 = require("../paymentrelated/paymentrelated");
const invoicerelated_1 = require("./related/invoicerelated");
/** Logger for invoice routes */
const invoiceRoutesLogger = tracer.colorConsole({
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
 * Generates a new invoice ID based on the given query ID.
 * @param companyId The query ID used to generate the invoice ID.
 * @returns A Promise that resolves to the generated invoice ID.
 */
const makeinvoiceId = async (companyId) => {
    const count = await invoicerelated_model_1.invoiceRelatedMain
        .find({ companyId, invoiceId: { $exists: true, $ne: null } })
        .sort({ _id: -1 }).limit(1).lean().select({ invoiceId: 1 });
    let incCount = count[0]?.invoiceId || 0;
    return ++incCount;
};
const saveInvoice = async (res, invoice, invoiceRelated, companyId) => {
    invoice.companyId = companyId;
    invoiceRelated.companyId = companyId;
    invoiceRelated.invoiceId = await makeinvoiceId(companyId);
    const extraNotifDesc = 'Newly created invoice';
    const relatedId = await (0, invoicerelated_1.relegateInvRelatedCreation)(res, invoiceRelated, companyId, extraNotifDesc);
    if (!relatedId.success) {
        return relatedId;
    }
    invoice.invoiceRelated = relatedId._id;
    invoice.companyId = companyId;
    const newInvoice = new invoice_model_1.invoiceMain(invoice);
    let errResponse;
    const saved = await newInvoice.save()
        .catch(err => {
        invoiceRoutesLogger.error('create - err: ', err);
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
        }
        else {
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
        (0, stock_universal_server_1.addParentToLocals)(res, saved._id, invoice_model_1.invoiceLean.collection.collectionName, 'makeTrackEdit');
    }
    // await updateInvoiceRelated(invoiceRelated); // !! WHY CALL THIS
    return { success: true, status: 200, _id: saved._id, invoiceRelatedId: relatedId._id };
};
exports.saveInvoice = saveInvoice;
/**
 * Router for handling invoice routes.
 */
exports.invoiceRoutes = express_1.default.Router();
exports.invoiceRoutes.post('/add', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('invoice'), (0, stock_universal_server_1.roleAuthorisation)('invoices', 'create'), async (req, res, next) => {
    const { invoice, invoiceRelated } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    invoice.companyId = filter.companyId;
    invoice.urId = await (0, stock_universal_server_1.generateUrId)(invoice_model_1.invoiceMain);
    invoiceRelated.companyId = filter.companyId;
    const response = await (0, exports.saveInvoice)(res, invoice, invoiceRelated, filter.companyId);
    if (!response.success) {
        return res.status(response.status).send({ success: response.success });
    }
    return next();
}, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('invoice'));
exports.invoiceRoutes.put('/update', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'update'), async (req, res) => {
    const { updatedInvoice, invoiceRelated } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    updatedInvoice.companyId = filter.companyId;
    invoiceRelated.companyId = filter.companyId;
    const { _id } = updatedInvoice;
    const invoice = await invoice_model_1.invoiceMain
        .findOne({ _id, ...filter })
        .lean();
    if (!invoice) {
        return res.status(404).send({ success: false });
    }
    await (0, invoicerelated_1.updateInvoiceRelated)(res, invoiceRelated);
    let errResponse;
    const updated = await invoice_model_1.invoiceMain.updateOne({
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
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
        }
        else {
            errResponse.err = `we are having problems connecting to our databases, 
        try again in a while`;
        }
        return errResponse;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, invoice._id, invoice_model_1.invoiceLean.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: Boolean(updated) });
});
exports.invoiceRoutes.get('/one/:urId', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'read'), async (req, res) => {
    const { urId } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const invoice = await invoice_model_1.invoiceLean
        .findOne({ urId, ...filter })
        .lean()
        .populate([(0, query_1.populateInvoiceRelated)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()]);
    if (!invoice || !invoice.invoiceRelated) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const returned = (0, invoicerelated_1.makeInvoiceRelatedPdct)(invoice.invoiceRelated, invoice.invoiceRelated
        .billingUserId, invoice.createdAt, { _id: invoice._id,
        urId: invoice.urId
    });
    // addParentToLocals(res, invoiceRelated._id, invoiceLean.collection.collectionName, 'trackDataView'); // TODO
    return res.status(200).send(returned);
});
exports.invoiceRoutes.get('/all/:offset/:limit', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        invoice_model_1.invoiceLean
            .find({ ...filter })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate([(0, query_1.populateInvoiceRelated)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()]),
        invoice_model_1.invoiceLean.countDocuments({ ...filter })
    ]);
    const returned = all[0]
        .filter(val => val && val.invoiceRelated)
        .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated?.billingUserId, null, {
        _id: val._id
    }));
    const response = {
        count: all[1],
        data: returned
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, invoice_model_1.invoiceLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.invoiceRoutes.put('/delete/one', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'delete'), async (req, res) => {
    const { _id } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const found = await invoice_model_1.invoiceLean.findOne({ _id }).lean();
    if (!found) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const deleted = await (0, invoicerelated_1.deleteAllLinked)(found.invoiceRelated, 'invoice', filter.companyId);
    if (Boolean(deleted)) {
        (0, stock_universal_server_1.addParentToLocals)(res, _id, invoice_model_1.invoiceLean.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.invoiceRoutes.post('/filter', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'read'), async (req, res) => {
    const { propSort } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const aggCursor = invoice_model_1.invoiceLean
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
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, invoice_model_1.invoiceLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.invoiceRoutes.put('/delete/many', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const promises = _ids
        .map(async (val) => {
        const found = await invoice_model_1.invoiceLean.findOne({ _id: val }).lean();
        if (found) {
            await (0, invoicerelated_1.deleteAllLinked)(found.invoiceRelated, 'invoice', filter.companyId);
        }
        return new Promise(resolve => resolve(found._id));
    });
    const filterdExist = await Promise.all(promises);
    for (const val of filterdExist) {
        (0, stock_universal_server_1.addParentToLocals)(res, val, invoice_model_1.invoiceLean.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
// payments
exports.invoiceRoutes.post('/createpayment', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'create'), async (req, res) => {
    const pay = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    pay.companyId = filter.companyId;
    pay.urId = await (0, stock_universal_server_1.generateUrId)(receipt_model_1.receiptLean);
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
    await (0, paymentrelated_1.makePaymentInstall)(res, pay, pay.invoiceRelated, filter.companyId, pay.creationType);
    return res.status(200).send({ success: true });
});
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
exports.invoiceRoutes.get('/getonepayment/:urId', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'read'), async (req, res) => {
    const { urId } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const invoicePay = await receipt_model_1.receiptLean
        .findOne({ urId, ...filter })
        .lean();
    return res.status(200).send(invoicePay);
});
// TODO remove this
exports.invoiceRoutes.get('/getallpayments', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'read'), async (req, res) => {
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        receipt_model_1.receiptLean
            .find(filter)
            .lean(),
        receipt_model_1.receiptLean.countDocuments(filter)
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
// TODO remove this
exports.invoiceRoutes.put('/deleteonepayment', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'delete'), async (req, res) => {
    const { invoiceRelated } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const deleted = await (0, invoicerelated_1.deleteAllLinked)(invoiceRelated, 'invoice', filter.companyId);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
// TODO remove this
exports.invoiceRoutes.put('/deletemanypayments', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const deleted = await receipt_model_1.receiptMain
        .deleteMany({ _id: { $in: _ids }, ...filter })
        .catch(err => {
        invoiceRoutesLogger.error('deletemanypayments - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({
            success: Boolean(deleted),
            err: 'could not delete selected items, try again in a while'
        });
    }
});
//# sourceMappingURL=invoice.routes.js.map
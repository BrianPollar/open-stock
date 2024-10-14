"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceRoutes = exports.saveInvoice = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const mongoose_1 = require("mongoose");
const invoice_model_1 = require("../../models/printables/invoice.model");
const receipt_model_1 = require("../../models/printables/receipt.model");
const invoicerelated_model_1 = require("../../models/printables/related/invoicerelated.model");
const query_1 = require("../../utils/query");
const paymentrelated_1 = require("../paymentrelated/paymentrelated");
const invoicerelated_1 = require("./related/invoicerelated");
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
    const savedRes = await newInvoice.save()
        .catch((err) => err);
    if (savedRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
        return {
            ...errResponse
        };
    }
    (0, stock_universal_server_1.addParentToLocals)(res, savedRes._id, invoice_model_1.invoiceLean.collection.collectionName, 'makeTrackEdit');
    // await updateInvoiceRelated(invoiceRelated); // !! WHY CALL THIS
    return { success: true, status: 200, _id: savedRes._id, invoiceRelatedId: relatedId._id };
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
        return res.status(response.status || 403).send({ success: response.success });
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
    const updateRes = await invoice_model_1.invoiceMain.updateOne({
        _id, ...filter
    }, {
        $set: {
            dueDate: updatedInvoice.dueDate || invoice.dueDate,
            isDeleted: updatedInvoice.isDeleted || invoice.isDeleted
        }
    })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, invoice._id, invoice_model_1.invoiceLean.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: true });
});
exports.invoiceRoutes.get('/one/:urIdOr_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'read'), async (req, res) => {
    const { urIdOr_id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const filterwithId = (0, stock_universal_server_1.verifyObjectId)(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const invoice = await invoice_model_1.invoiceLean
        .findOne({ ...filterwithId, ...filter })
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
        .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated?.billingUserId, 
    // eslint-disable-next-line no-undefined
    undefined, {
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
    const updateRes = await (0, invoicerelated_1.deleteAllLinked)(found.invoiceRelated, 'invoice', filter.companyId);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, _id, invoice_model_1.invoiceLean.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
exports.invoiceRoutes.post('/filter', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('invoices', 'read'), async (req, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const aggCursor = invoice_model_1.invoiceLean
        .aggregate([
        ...(0, stock_universal_server_1.lookupSubFieldInvoiceRelatedFilter)((0, stock_universal_server_1.constructFiltersFromBody)(req), offset, limit, propSort, returnEmptyArr)
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
        return new Promise(resolve => resolve(found?._id));
    });
    const filterdExist = await Promise.all(promises);
    for (const val of filterdExist.filter(value => value)) {
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
    await (0, paymentrelated_1.makePaymentInstall)(res, pay, pay.invoiceRelated, filter.companyId, pay.creationType);
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=invoice.routes.js.map
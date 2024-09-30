"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRoutes = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_2 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const order_model_1 = require("../models/order.model");
const payment_1 = require("../utils/payment");
const query_1 = require("../utils/query");
const paymentrelated_1 = require("./paymentrelated/paymentrelated");
const invoicerelated_1 = require("./printables/related/invoicerelated");
/** Logger for order routes */
const orderRoutesLogger = tracer.colorConsole({
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
 * Express router for handling order routes.
 */
exports.orderRoutes = express_1.default.Router();
exports.orderRoutes.post('/makeorder', stock_universal_server_1.appendUserToReqIfTokenExist, async (req, res) => {
    const { order, payment, bagainCred, paymentRelated, invoiceRelated, userObj } = req.body;
    const companyId = order.companyId;
    order.companyId = companyId;
    payment.companyId = companyId;
    paymentRelated.companyId = companyId;
    invoiceRelated.companyId = companyId;
    let userDoc;
    if (!userObj._id) {
        const found = await stock_auth_server_1.userLean.findOne({ phone: userObj.phone }).lean();
        if (found) {
            userDoc = found;
        }
        else {
            userObj.urId = await (0, stock_universal_server_1.generateUrId)(stock_auth_server_1.user);
            const newUser = new stock_auth_server_1.user(userObj);
            let savedErr;
            userDoc = await newUser.save().catch(err => {
                orderRoutesLogger.error('save error', err);
                savedErr = err;
                return null;
            });
            if (savedErr) {
                return res.status(500).send({ success: false });
            }
            if (userDoc && userDoc._id) {
                (0, stock_universal_server_2.addParentToLocals)(res, userDoc._id, stock_auth_server_1.user.collection.collectionName, 'makeTrackEdit');
            }
        }
    }
    else {
        const isValid = (0, stock_universal_server_2.verifyObjectId)(userObj._id);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        const found = await stock_auth_server_1.userLean.findById(userObj._id).lean();
        if (!found) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        userDoc = found;
    }
    invoiceRelated.billingUser = userDoc.fname + ' ' + userDoc.lname;
    invoiceRelated.billingUserId = userDoc._id;
    // eslint-disable-next-line max-len
    invoiceRelated.billingUserPhoto = (typeof userDoc.profilePic === 'string') ? userDoc.profilePic : (userDoc.profilePic)?.url;
    const done = await (0, payment_1.paymentMethodDelegator)(res, paymentRelated, invoiceRelated, order.paymentMethod, order, payment, userDoc._id, companyId, bagainCred);
    return res.status(done.status).send({ success: done.success, data: done });
});
exports.orderRoutes.post('/paysubscription', stock_universal_server_2.requireAuth, async (req, res) => {
    // const { userId } = req.user;
    const { companyId } = req.user;
    const { order, payment, bagainCred, paymentRelated, invoiceRelated } = req.body;
    order.companyId = companyId;
    payment.companyId = companyId;
    paymentRelated.companyId = companyId;
    invoiceRelated.companyId = companyId;
    const done = await (0, payment_1.paymentMethodDelegator)(res, paymentRelated, invoiceRelated, order.paymentMethod, order, payment, companyId, companyId, bagainCred, 'subscription');
    return res.status(done.status).send({ success: done.success, data: done });
});
exports.orderRoutes.post('/add', stock_universal_server_2.requireAuth, async (req, res) => {
    const { order, paymentRelated, invoiceRelated } = req.body;
    const { companyId } = req.user;
    order.companyId = companyId;
    paymentRelated.companyId = companyId;
    invoiceRelated.companyId = companyId;
    const extraNotifDesc = 'Newly created order';
    const paymentRelatedRes = await (0, paymentrelated_1.relegatePaymentRelatedCreation)(res, paymentRelated, invoiceRelated, 'order', extraNotifDesc, companyId);
    orderRoutesLogger.debug('Order route - paymentRelatedRes', paymentRelatedRes);
    if (!paymentRelatedRes.success) {
        return res.status(paymentRelatedRes.status || 403).send(paymentRelatedRes);
    }
    order.paymentRelated = paymentRelatedRes._id;
    const invoiceRelatedRes = await (0, invoicerelated_1.relegateInvRelatedCreation)(res, invoiceRelated, companyId, extraNotifDesc, true);
    orderRoutesLogger.debug('Order route - invoiceRelatedRes', invoiceRelatedRes);
    if (!invoiceRelatedRes.success) {
        return res.status(invoiceRelatedRes.status || 403).send(invoiceRelatedRes);
    }
    order.invoiceRelated = invoiceRelatedRes._id;
    const newOrder = new order_model_1.orderMain(order);
    let errResponse;
    const saved = await newOrder.save()
        .catch(err => {
        orderRoutesLogger.error('create - err: ', err);
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = (0, stock_universal_server_2.stringifyMongooseErr)(err.errors);
        }
        else {
            errResponse.err = `we are having problems connecting to our databases, 
        try again in a while`;
        }
        return err;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    if (saved && saved._id) {
        (0, stock_universal_server_2.addParentToLocals)(res, saved._id, order_model_1.orderMain.collection.collectionName, 'makeTrackEdit');
    }
    return res.status(200).send({ success: Boolean(saved) });
});
exports.orderRoutes.put('/update', stock_universal_server_2.requireAuth, async (req, res) => {
    const { updatedOrder, paymentRelated } = req.body;
    const { filter } = (0, stock_universal_server_2.makeCompanyBasedQuery)(req);
    updatedOrder.companyId = filter.companyId;
    paymentRelated.companyId = filter.companyId;
    const { _id } = updatedOrder;
    const isValid = (0, stock_universal_server_2.verifyObjectIds)([_id, filter.companyId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const order = await order_model_1.orderMain
        .findOne({ _id, ...filter })
        .lean();
    if (!order) {
        return res.status(404).send({ success: false });
    }
    await (0, paymentrelated_1.updatePaymentRelated)(paymentRelated, filter.companyId);
    let errResponse;
    const updated = await order_model_1.orderMain.updateOne({
        _id, filter
    }, {
        $set: {
            deliveryDate: updatedOrder.deliveryDate || order.deliveryDate,
            isDeleted: updatedOrder.isDeleted || order.isDeleted
        }
    })
        .catch(err => {
        orderRoutesLogger.error('update - err: ', err);
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = (0, stock_universal_server_2.stringifyMongooseErr)(err.errors);
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
    (0, stock_universal_server_2.addParentToLocals)(res, _id, order_model_1.orderMain.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: Boolean(updated) });
});
exports.orderRoutes.get('/one/:_id', stock_universal_server_2.requireAuth, async (req, res) => {
    const { _id } = req.params;
    const { filter } = (0, stock_universal_server_2.makeCompanyBasedQuery)(req);
    const order = await order_model_1.orderLean
        .findOne({ _id, ...filter })
        .lean()
        .populate([(0, query_1.populatePaymentRelated)(), (0, query_1.populateInvoiceRelated)(true), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()]);
    if (!order) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const returned = (0, paymentrelated_1.makePaymentRelatedPdct)(order.paymentRelated, order.invoiceRelated, order.invoiceRelated
        .billingUserId, order);
    (0, stock_universal_server_2.addParentToLocals)(res, order._id, order_model_1.orderMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(returned);
});
exports.orderRoutes.get('/all/:offset/:limit', stock_universal_server_2.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_2.roleAuthorisation)('orders', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_2.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_2.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        order_model_1.orderLean
            .find(filter)
            .skip(offset)
            .limit(limit)
            .lean()
            .populate([(0, query_1.populatePaymentRelated)(), (0, query_1.populateInvoiceRelated)(true), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()]),
        order_model_1.orderLean.countDocuments(filter)
    ]);
    const returned = all[0]
        .map(val => (0, paymentrelated_1.makePaymentRelatedPdct)(val.paymentRelated, val.invoiceRelated, val.invoiceRelated
        .billingUserId, val));
    const response = {
        count: all[1],
        data: returned
    };
    for (const val of returned) {
        (0, stock_universal_server_2.addParentToLocals)(res, val._id, order_model_1.orderMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.orderRoutes.get('/getmyorders/:offset/:limit', stock_universal_server_2.requireAuth, async (req, res) => {
    const { userId } = req.user;
    const isValid = (0, stock_universal_server_2.verifyObjectId)(userId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const orders = await order_model_1.orderLean
        .find({ user: userId, ...(0, stock_universal_server_1.makePredomFilter)(req) })
        .lean()
        .populate([(0, query_1.populatePaymentRelated)(), (0, query_1.populateInvoiceRelated)(true), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()]);
    const returned = orders
        .map(val => (0, paymentrelated_1.makePaymentRelatedPdct)(val.paymentRelated, val.invoiceRelated, val.invoiceRelated
        .billingUserId, val));
    for (const val of orders) {
        (0, stock_universal_server_2.addParentToLocals)(res, val._id, order_model_1.orderMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(returned);
});
exports.orderRoutes.put('/delete/one', stock_universal_server_2.requireAuth, async (req, res) => {
    const { _id } = req.body;
    const { filter } = (0, stock_universal_server_2.makeCompanyBasedQuery)(req);
    const isValid = (0, stock_universal_server_2.verifyObjectIds)([_id, filter.companyId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const found = await order_model_1.orderLean.findOne({ _id }).lean();
    if (!found) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const deleted = await (0, paymentrelated_1.deleteAllPayOrderLinked)(found.paymentRelated, found.invoiceRelated, 'order', filter.companyId);
    // await orderMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        (0, stock_universal_server_2.addParentToLocals)(res, _id, order_model_1.orderMain.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.orderRoutes.put('/appendDelivery/:orderId/:status', stock_universal_server_2.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_2.roleAuthorisation)('orders', 'update'), async (req, res) => {
    const { orderId } = req.params;
    const { filter } = (0, stock_universal_server_2.makeCompanyBasedQuery)(req);
    const isValid = (0, stock_universal_server_2.verifyObjectId)(orderId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const order = await order_model_1.orderMain
        .findOne({ _id: orderId, ...filter })
        .lean();
    if (!order) {
        return res.status(404).send({ success: false });
    }
    let errResponse;
    await order_model_1.orderMain.updateOne({
        _id: orderId, ...filter
    }, {
        $set: {}
    }).catch(err => {
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = (0, stock_universal_server_2.stringifyMongooseErr)(err.errors);
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
    (0, stock_universal_server_2.addParentToLocals)(res, order._id, order_model_1.orderMain.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: true });
});
exports.orderRoutes.post('/filter', stock_universal_server_2.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_2.roleAuthorisation)('orders', 'read'), async (req, res) => {
    const { propSort } = req.body;
    const { offset, limit } = (0, stock_universal_server_2.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const aggCursor = order_model_1.orderLean
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
        .map(val => (0, paymentrelated_1.makePaymentRelatedPdct)(val.paymentRelated, val.invoiceRelated, val.invoiceRelated
        .billingUserId, val));
    const response = {
        count,
        data: returned
    };
    for (const val of all) {
        (0, stock_universal_server_2.addParentToLocals)(res, val._id, order_model_1.orderMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.orderRoutes.put('/delete/many', stock_universal_server_2.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_2.roleAuthorisation)('orders', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = (0, stock_universal_server_2.makeCompanyBasedQuery)(req);
    const promises = _ids
        .map(async (_id) => {
        const found = await order_model_1.orderLean.findOne({ _id }).lean();
        if (found) {
            await (0, paymentrelated_1.deleteAllPayOrderLinked)(found.paymentRelated, found.invoiceRelated, 'order', filter.companyId);
        }
        return new Promise(resolve => resolve(found._id));
    });
    const filterdExist = await Promise.all(promises);
    for (const val of filterdExist) {
        (0, stock_universal_server_2.addParentToLocals)(res, val, order_model_1.orderMain.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
exports.orderRoutes.get('/trackorder/:refereceId', async (req, res) => {
    const response = await (0, payment_1.trackOrder)(req.params.refereceId);
    if (!response.success) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    return res.status(200).send({ success: true, orderStatus: response.orderStatus });
});
//# sourceMappingURL=order.routes.js.map
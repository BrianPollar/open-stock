"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliveryNoteRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const deliverynote_model_1 = require("../../models/printables/deliverynote.model");
const query_1 = require("../../utils/query");
const invoicerelated_1 = require("./related/invoicerelated");
/** Logger for delivery note routes */
const deliveryNoteRoutesLogger = tracer.colorConsole({
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
 * Express router for delivery note routes.
 */
exports.deliveryNoteRoutes = express_1.default.Router();
/**
 * Route to create a delivery note
 * @name POST /create
 * @function
 * @memberof module:deliveryNoteRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing delivery note and invoice related data
 * @param {Object} req.body.deliveryNote - Delivery note data
 * @param {Object} req.body.invoiceRelated - Invoice related data
 * @param {Object} res - Express response object
 * @returns {Object} Success status and saved delivery note data
 */
exports.deliveryNoteRoutes.post('/create/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('quotation'), (0, stock_universal_server_1.roleAuthorisation)('deliveryNotes', 'create'), async (req, res, next) => {
    const { deliveryNote, invoiceRelated } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    deliveryNote.companyId = filter.companyId;
    invoiceRelated.companyId = filter.companyId;
    const count = await deliverynote_model_1.deliveryNoteMain
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    deliveryNote.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    const extraNotifDesc = 'Newly generated delivery note';
    const invoiceRelatedRes = await (0, invoicerelated_1.relegateInvRelatedCreation)(res, invoiceRelated, filter.companyId, extraNotifDesc);
    if (!invoiceRelatedRes.success) {
        return res.status(invoiceRelatedRes.status).send(invoiceRelatedRes);
    }
    deliveryNote.invoiceRelated = invoiceRelatedRes.id;
    const newDeliveryNote = new deliverynote_model_1.deliveryNoteMain(deliveryNote);
    let errResponse;
    const saved = await newDeliveryNote.save()
        .catch(err => {
        deliveryNoteRoutesLogger.error('create - err: ', err);
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
        return res.status(403).send(errResponse);
    }
    if (saved && saved._id) {
        (0, stock_universal_server_1.addParentToLocals)(res, saved._id, deliverynote_model_1.deliveryNoteLean.collection.collectionName, 'makeTrackEdit');
    }
    await (0, invoicerelated_1.updateInvoiceRelated)(res, invoiceRelated, filter.companyId);
    return next();
}, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('quotation'));
/**
 * Route to get a delivery note by UR ID
 * @name GET /getone/:urId
 * @function
 * @memberof module:deliveryNoteRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {string} req.params.urId - UR ID of the delivery note to retrieve
 * @param {Object} res - Express response object
 * @returns {Object} Delivery note data with related invoice data
 */
exports.deliveryNoteRoutes.get('/getone/:urId/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryNotes', 'read'), async (req, res) => {
    const { urId } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const deliveryNote = await deliverynote_model_1.deliveryNoteLean
        .findOne({ urId, ...filter })
        .lean()
        .populate([(0, query_1.populateInvoiceRelated)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()]);
    let returned;
    if (deliveryNote) {
        returned = (0, invoicerelated_1.makeInvoiceRelatedPdct)(deliveryNote.invoiceRelated, deliveryNote.invoiceRelated
            .billingUserId, deliveryNote.createdAt, {
            _id: deliveryNote._id,
            urId: deliveryNote.urId
        });
        (0, stock_universal_server_1.addParentToLocals)(res, deliveryNote._id, deliverynote_model_1.deliveryNoteLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(returned);
});
/**
 * Route to get all delivery notes with related invoice data
 * @name GET /getall/:offset/:limit
 * @function
 * @memberof module:deliveryNoteRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {string} req.params.offset - Offset for pagination
 * @param {string} req.params.limit - Limit for pagination
 * @param {Object} res - Express response object
 * @returns {Array} Array of delivery note data with related invoice data
 */
exports.deliveryNoteRoutes.get('/getall/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryNotes', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        deliverynote_model_1.deliveryNoteLean
            .find(filter)
            .skip(offset)
            .limit(limit)
            .lean()
            .populate([(0, query_1.populateInvoiceRelated)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()]),
        deliverynote_model_1.deliveryNoteLean.countDocuments(filter)
    ]);
    const returned = all[0]
        .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated
        .billingUserId, (val).createdAt, {
        _id: val._id,
        urId: val.urId
    }));
    const response = {
        count: all[1],
        data: returned
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, deliverynote_model_1.deliveryNoteLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
/**
 * Route to delete a delivery note and its related invoice data
 * @name PUT /deleteone
 * @function
 * @memberof module:deliveryNoteRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {string} req.body.id - ID of the delivery note to delete
 * @param {string} req.body.invoiceRelated - ID of the related invoice data to delete
 * @param {string} req.body.creationType - Type of creation for the related invoice data
 * @param {string} req.body.stage - Stage of the related invoice data
 * @param {Object} res - Express response object
 * @returns {Object} Success status of the deletion operation
 */
exports.deliveryNoteRoutes.put('/deleteone/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryNotes', 'delete'), async (req, res) => {
    const { id, invoiceRelated, creationType, stage } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const deleted = await (0, invoicerelated_1.deleteAllLinked)(invoiceRelated, creationType, stage, 'deliverynote', filter.companyId);
    if (Boolean(deleted)) {
        (0, stock_universal_server_1.addParentToLocals)(res, id, deliverynote_model_1.deliveryNoteLean.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
/**
 * Route to search for delivery notes by search term and key
 * @name POST /search/:offset/:limit
 * @function
 * @memberof module:deliveryNoteRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {string} req.params.limit - Limit for pagination
 * @param {string} req.params.offset - Offset for pagination
 * @param {Object} req.body - Request body containing search term and key
 * @param {string} req.body.searchterm - Search term
 * @param {string} req.body.searchKey - Search key
 * @param {Object} res - Express response object
 * @returns {Array} Array of delivery note data with related invoice data
 */
exports.deliveryNoteRoutes.post('/search/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryNotes', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const all = await Promise.all([
        deliverynote_model_1.deliveryNoteLean
            .find({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate([(0, query_1.populateInvoiceRelated)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()]),
        deliverynote_model_1.deliveryNoteLean.countDocuments({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
    ]);
    const returned = all[0]
        .map(val => (0, invoicerelated_1.makeInvoiceRelatedPdct)(val.invoiceRelated, val.invoiceRelated
        .billingUserId));
    const response = {
        count: all[1],
        data: returned
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, deliverynote_model_1.deliveryNoteLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.deliveryNoteRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryNotes', 'delete'), async (req, res) => {
    const { credentials } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    /** const ids = credentials
      .map(val => val.id);
    await deliveryNoteMain
      .deleteMany({ _id: { $in: ids } });**/
    const promises = credentials
        .map(async (val) => {
        await (0, invoicerelated_1.deleteAllLinked)(val.invoiceRelated, val.creationType, val.stage, 'deliverynote', filter.companyId);
        return new Promise(resolve => resolve(true));
    });
    await Promise.all(promises);
    for (const val of credentials) {
        (0, stock_universal_server_1.addParentToLocals)(res, val.id, deliverynote_model_1.deliveryNoteLean.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=deliverynote.routes.js.map
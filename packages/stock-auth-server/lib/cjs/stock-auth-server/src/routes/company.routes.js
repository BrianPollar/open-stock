"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCompany = exports.addCompany = exports.companyRoutes = void 0;
const tslib_1 = require("tslib");
/**
 * This file contains the authentication routes for the stock-auth-server package.
 * It exports the companyRoutes router and companyLoginRelegator function.
 * It also imports various controllers and models from the same package and other packages.
 * @packageDocumentation
 */
/* eslint-disable @typescript-eslint/no-var-requires */
const stock_notif_server_1 = require("@open-stock/stock-notif-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const company_model_1 = require("../models/company.model");
const user_model_1 = require("../models/user.model");
const query_1 = require("../utils/query");
const company_auth_1 = require("./company-auth");
const superadmin_routes_1 = require("./superadmin.routes");
const user_routes_1 = require("./user.routes");
// import { notifConfig } from '../../config/notif.config';
// import { createNotifications, NotificationController } from '../controllers/notifications.controller';
// const passport = require('passport');
/**
 * Router for company authentication routes.
 */
exports.companyRoutes = express_1.default.Router();
const addCompany = async (req, res) => {
    companyAuthLogger.info('Add company');
    const savedUser = req.body.user;
    const companyData = req.body.company;
    companyData.owner = savedUser._id;
    companyData.urId = await (0, stock_universal_server_1.generateUrId)(company_model_1.companyMain);
    const newCompany = new company_model_1.companyMain(companyData);
    let status = 200;
    let response = { success: true };
    const savedCompany = await newCompany.save().catch((err) => {
        status = 403;
        const errResponse = {
            success: false
        };
        if (err && err.errors) {
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
        }
        else {
            errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
        }
        response = errResponse;
        return err;
    });
    if (savedCompany && savedCompany._id) {
        (0, stock_universal_server_1.addParentToLocals)(res, savedCompany._id, company_model_1.companyMain.collection.collectionName, 'makeTrackEdit');
    }
    if (!response.err && savedCompany) {
        const stn = {
            companyId: savedCompany._id,
            invoices: true,
            payments: true,
            orders: true,
            jobCards: true,
            users: true
        };
        await (0, stock_notif_server_1.createNotifStn)(stn);
        response = {
            success: true,
            _id: savedCompany._id
        };
    }
    else {
        await user_model_1.user.deleteOne({ _id: savedUser._id });
    }
    return res.status(status).send(response);
};
exports.addCompany = addCompany;
const updateCompany = async (req, res) => {
    companyAuthLogger.info('Update company');
    const updatedCompany = req.body.company;
    const foundCompany = await company_model_1.companyMain
        .findOne({ _id: updatedCompany._id });
    if (!foundCompany) {
        return res.status(404).send({ success: false });
    }
    if (!foundCompany.urId) {
        foundCompany.urId = await (0, stock_universal_server_1.generateUrId)(company_model_1.companyMain);
    }
    delete updatedCompany._id;
    const keys = Object.keys(updatedCompany);
    keys.forEach(key => {
        if (key !== '_id' && key !== 'phone' && key !== 'email') {
            foundCompany[key] = updatedCompany[key] || foundCompany[key];
        }
    });
    const status = 200;
    let response = { success: true };
    await foundCompany.save().catch((err) => {
        const errResponse = {
            success: false
        };
        if (err && err.errors) {
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
        }
        else {
            errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
        }
        response = errResponse;
    });
    return res.status(status).send(response);
};
exports.updateCompany = updateCompany;
/**
 * Logger for company authentication routes.
 */
const companyAuthLogger = tracer.colorConsole({
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
        fs.appendFile(logDir + '/auth-server.log', data.rawoutput + '\n', err => {
            if (err) {
                // eslint-disable-next-line no-console
                console.log('raw.output err ', err);
            }
        });
    }
});
exports.companyRoutes.post('/add', stock_universal_server_1.requireAuth, superadmin_routes_1.requireSuperAdmin, user_routes_1.addUser, exports.addCompany);
exports.companyRoutes.get('/all/:offset/:limit', stock_universal_server_1.requireAuth, superadmin_routes_1.requireSuperAdmin, async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const currOffset = offset === 0 ? 0 : offset;
    const currLimit = limit === 0 ? 1000 : limit;
    const all = await Promise.all([
        company_model_1.companyLean
            .find({})
            .sort({ createdAt: 1 })
            .limit(Number(currLimit))
            .skip(Number(currOffset))
            .populate([(0, query_1.populateOwner)(), (0, query_1.populateTrackEdit)(), (0, query_1.populateTrackView)()])
            .lean(),
        company_model_1.companyLean.countDocuments()
    ]);
    const filteredCompanys = all[0].filter(data => !data.blocked);
    const response = {
        count: all[1],
        data: filteredCompanys
    };
    for (const val of filteredCompanys) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, company_model_1.companyMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.companyRoutes.get('/one/:_id', stock_universal_server_1.requireAuth, superadmin_routes_1.requireSuperAdmin, async (req, res) => {
    const found = await company_model_1.companyLean
        .findOne({ _id: req.params._id })
        .populate([(0, query_1.populateOwner)(), (0, query_1.populateTrackEdit)(), (0, query_1.populateTrackView)()])
        .lean();
    if (!found) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    (0, stock_universal_server_1.addParentToLocals)(res, found._id, company_model_1.companyMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(found);
});
exports.companyRoutes.post('/filter', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('users', 'read'), async (req, res) => {
    const { propSort } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const aggCursor = company_model_1.companyLean
        .aggregate([
        ...(0, stock_universal_server_1.lookupSubFieldUserFilter)((0, stock_universal_server_1.constructFiltersFromBody)(req), propSort, offset, limit)
    ]);
    const dataArr = [];
    for await (const data of aggCursor) {
        dataArr.push(data);
    }
    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;
    const response = {
        count,
        data: all
    };
    for (const val of all) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, company_model_1.companyMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.companyRoutes.put('/update', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('users', 'update'), user_routes_1.updateUserBulk, exports.updateCompany);
exports.companyRoutes.post('/update/img', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('users', 'update'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, user_routes_1.updateUserBulk, exports.updateCompany);
exports.companyRoutes.put('/delete/one', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('users', 'delete'), (0, user_routes_1.determineUserToRemove)(company_model_1.companyLean, []), user_routes_1.removeOneUser, async (req, res) => {
    const { _id } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const deleted = await company_model_1.companyMain
        .updateOne({ _id, ...filter }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        companyAuthLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        (0, stock_universal_server_1.addParentToLocals)(res, _id, company_model_1.companyMain.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(405).send({
            success: Boolean(deleted), err: 'could not delete selected items, try again in a while'
        });
    }
});
exports.companyRoutes.put('/delete/many', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('staffs', 'delete'), (0, user_routes_1.determineUsersToRemove)(company_model_1.companyLean, []), user_routes_1.removeManyUsers, async (req, res) => {
    const { _ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const deleted = await company_model_1.companyMain
        .updateMany({ _id: { $in: _ids }, ...filter }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        companyAuthLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        for (const val of _ids) {
            (0, stock_universal_server_1.addParentToLocals)(res, val, company_model_1.companyMain.collection.collectionName, 'trackDataDelete');
        }
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({
            success: Boolean(deleted), err: 'could not delete selected items, try again in a while'
        });
    }
});
//# sourceMappingURL=company.routes.js.map
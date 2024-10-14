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
const mongoose_1 = require("mongoose");
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
    stock_universal_server_1.mainLogger.info('Add company');
    if (!req.body.user || !req.body.company) {
        return res.status(401).send({ success: false, err: 'unauthorised' });
    }
    const savedUser = req.body.user;
    const companyData = req.body.company;
    companyData.owner = savedUser._id;
    companyData.urId = await (0, stock_universal_server_1.generateUrId)(company_model_1.companyMain);
    const newCompany = new company_model_1.companyMain(companyData);
    const status = 200;
    let response = { success: true };
    const savedCompany = await newCompany.save().catch((err) => err);
    if (savedCompany instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedCompany);
        return res.status(errResponse.status).send(errResponse);
    }
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
    stock_universal_server_1.mainLogger.info('Update company');
    if (!req.body.company) {
        return res.status(401).send({ success: false, err: 'unauthorised' });
    }
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
    const savedRes = await foundCompany.save().catch((err) => err);
    if (savedRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    return res.status(200).send({ success: true });
};
exports.updateCompany = updateCompany;
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
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const aggCursor = company_model_1.companyLean
        .aggregate([
        ...(0, stock_universal_server_1.lookupSubFieldUserFilter)((0, stock_universal_server_1.constructFiltersFromBody)(req), offset, limit, propSort, returnEmptyArr)
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
    const updateRes = await company_model_1.companyMain
        .updateOne({ _id, ...filter }, {
        $set: { isDeleted: true }
    })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, _id, company_model_1.companyMain.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
exports.companyRoutes.put('/delete/many', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('staffs', 'delete'), (0, user_routes_1.determineUsersToRemove)(company_model_1.companyLean, []), user_routes_1.removeManyUsers, async (req, res) => {
    const { _ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const updateRes = await company_model_1.companyMain
        .updateMany({ _id: { $in: _ids }, ...filter }, {
        $set: { isDeleted: true }
    })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    for (const val of _ids) {
        (0, stock_universal_server_1.addParentToLocals)(res, val, company_model_1.companyMain.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=company.routes.js.map
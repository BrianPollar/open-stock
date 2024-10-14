"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const mongoose_1 = require("mongoose");
const expense_model_1 = require("../models/expense.model");
/**
 * Router for handling expense routes.
 */
exports.expenseRoutes = express_1.default.Router();
exports.expenseRoutes.post('/add', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('expense'), (0, stock_universal_server_1.roleAuthorisation)('expenses', 'create'), async (req, res, next) => {
    const expense = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    expense.companyId = filter.companyId;
    expense.urId = await (0, stock_universal_server_1.generateUrId)(expense_model_1.expenseMain);
    const newExpense = new expense_model_1.expenseMain(expense);
    const savedRes = await newExpense.save()
        .catch((err) => err);
    if (savedRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, savedRes._id, expense_model_1.expenseMain.collection.collectionName, 'makeTrackEdit');
    return next();
}, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('expense'));
exports.expenseRoutes.put('/update', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('expenses', 'update'), async (req, res) => {
    const updatedExpense = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    updatedExpense.companyId = filter.companyId;
    const expense = await expense_model_1.expenseMain
        .findOne({ _id: updatedExpense._id, ...filter })
        .lean();
    if (!expense) {
        return res.status(404).send({ success: false });
    }
    const updateRes = await expense_model_1.expenseMain.updateOne({
        _id: updatedExpense._id, ...filter
    }, {
        $set: {
            name: updatedExpense.name || expense.name,
            person: updatedExpense.person || expense.person,
            cost: updatedExpense.cost || expense.cost,
            category: updatedExpense.category || expense.category,
            items: updatedExpense.items || expense.items,
            note: updatedExpense.note || expense.note,
            isDeleted: updatedExpense.isDeleted || expense.isDeleted
        }
    })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, updatedExpense._id, expense_model_1.expenseMain.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: true });
});
exports.expenseRoutes.get('/one/:urIdOr_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('expenses', 'read'), async (req, res) => {
    const { urIdOr_id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const filterwithId = (0, stock_universal_server_1.verifyObjectId)(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const expense = await expense_model_1.expenseLean
        .findOne({ ...filterwithId, ...filter })
        .lean();
    if (!expense) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    (0, stock_universal_server_1.addParentToLocals)(res, expense._id, expense_model_1.expenseMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(expense);
});
exports.expenseRoutes.get('/all/:offset/:limit', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('expenses', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        expense_model_1.expenseLean
            .find(filter)
            .skip(offset)
            .limit(limit)
            .lean(),
        expense_model_1.expenseLean.countDocuments(filter)
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, expense_model_1.expenseMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.expenseRoutes.delete('/delete/one/:_id', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('expenses', 'delete'), async (req, res) => {
    const { _id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    // const deleted = await expenseMain.findOneAndDelete({ _id, companyId });
    const updateRes = await expense_model_1.expenseMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, _id, expense_model_1.expenseMain.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
exports.expenseRoutes.post('/filter', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('expenses', 'read'), async (req, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const filter = (0, stock_universal_server_1.constructFiltersFromBody)(req);
    const aggCursor = expense_model_1.expenseLean.aggregate([
        {
            $match: {
                $and: [
                    // { status: 'pending' },
                    ...filter
                ]
            }
        },
        ...(0, stock_universal_server_1.lookupTrackEdit)(),
        ...(0, stock_universal_server_1.lookupTrackView)(),
        ...(0, stock_universal_server_1.lookupFacet)(offset, limit, propSort, returnEmptyArr)
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
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, expense_model_1.expenseMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.expenseRoutes.put('/delete/many', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('expenses', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([..._ids]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const updateRes = await expense_model_1.expenseMain
        .updateMany({ _id: { $in: _ids }, ...filter }, {
        $set: { isDeleted: true }
    })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    for (const val of _ids) {
        (0, stock_universal_server_1.addParentToLocals)(res, val, expense_model_1.expenseMain.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=expense.routes.js.map
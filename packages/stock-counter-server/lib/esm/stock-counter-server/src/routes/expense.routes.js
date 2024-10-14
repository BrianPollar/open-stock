import { requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord } from '@open-stock/stock-auth-server';
import { addParentToLocals, constructFiltersFromBody, generateUrId, handleMongooseErr, lookupFacet, lookupTrackEdit, lookupTrackView, makeCompanyBasedQuery, offsetLimitRelegator, requireAuth, roleAuthorisation, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import { Error } from 'mongoose';
import { expenseLean, expenseMain } from '../models/expense.model';
/**
 * Router for handling expense routes.
 */
export const expenseRoutes = express.Router();
expenseRoutes.post('/add', requireAuth, requireActiveCompany, requireCanUseFeature('expense'), roleAuthorisation('expenses', 'create'), async (req, res, next) => {
    const expense = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    expense.companyId = filter.companyId;
    expense.urId = await generateUrId(expenseMain);
    const newExpense = new expenseMain(expense);
    const savedRes = await newExpense.save()
        .catch((err) => err);
    if (savedRes instanceof Error) {
        const errResponse = handleMongooseErr(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    addParentToLocals(res, savedRes._id, expenseMain.collection.collectionName, 'makeTrackEdit');
    return next();
}, requireUpdateSubscriptionRecord('expense'));
expenseRoutes.put('/update', requireAuth, requireActiveCompany, roleAuthorisation('expenses', 'update'), async (req, res) => {
    const updatedExpense = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    updatedExpense.companyId = filter.companyId;
    const expense = await expenseMain
        .findOne({ _id: updatedExpense._id, ...filter })
        .lean();
    if (!expense) {
        return res.status(404).send({ success: false });
    }
    const updateRes = await expenseMain.updateOne({
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
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    addParentToLocals(res, updatedExpense._id, expenseMain.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: true });
});
expenseRoutes.get('/one/:urIdOr_id', requireAuth, requireActiveCompany, roleAuthorisation('expenses', 'read'), async (req, res) => {
    const { urIdOr_id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const filterwithId = verifyObjectId(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const expense = await expenseLean
        .findOne({ ...filterwithId, ...filter })
        .lean();
    if (!expense) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    addParentToLocals(res, expense._id, expenseMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(expense);
});
expenseRoutes.get('/all/:offset/:limit', requireAuth, requireActiveCompany, roleAuthorisation('expenses', 'read'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { filter } = makeCompanyBasedQuery(req);
    const all = await Promise.all([
        expenseLean
            .find(filter)
            .skip(offset)
            .limit(limit)
            .lean(),
        expenseLean.countDocuments(filter)
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        addParentToLocals(res, val._id, expenseMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
expenseRoutes.delete('/delete/one/:_id', requireAuth, requireActiveCompany, roleAuthorisation('expenses', 'delete'), async (req, res) => {
    const { _id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    // const deleted = await expenseMain.findOneAndDelete({ _id, companyId });
    const updateRes = await expenseMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } })
        .catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    addParentToLocals(res, _id, expenseMain.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
expenseRoutes.post('/filter', requireAuth, requireActiveCompany, roleAuthorisation('expenses', 'read'), async (req, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
    const filter = constructFiltersFromBody(req);
    const aggCursor = expenseLean.aggregate([
        {
            $match: {
                $and: [
                    // { status: 'pending' },
                    ...filter
                ]
            }
        },
        ...lookupTrackEdit(),
        ...lookupTrackView(),
        ...lookupFacet(offset, limit, propSort, returnEmptyArr)
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
        addParentToLocals(res, val._id, expenseMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
expenseRoutes.put('/delete/many', requireAuth, requireActiveCompany, roleAuthorisation('expenses', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const isValid = verifyObjectIds([..._ids]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const updateRes = await expenseMain
        .updateMany({ _id: { $in: _ids }, ...filter }, {
        $set: { isDeleted: true }
    })
        .catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    for (const val of _ids) {
        addParentToLocals(res, val, expenseMain.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=expense.routes.js.map
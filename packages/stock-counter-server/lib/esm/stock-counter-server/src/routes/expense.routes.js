import { requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord } from '@open-stock/stock-auth-server';
import { addParentToLocals, constructFiltersFromBody, generateUrId, lookupLimit, lookupOffset, lookupSort, lookupTrackEdit, lookupTrackView, makeCompanyBasedQuery, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { expenseLean, expenseMain } from '../models/expense.model';
/** Logger for expense routes */
const expenseRoutesLogger = tracer.colorConsole({
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
 * Router for handling expense routes.
 */
export const expenseRoutes = express.Router();
expenseRoutes.post('/add', requireAuth, requireActiveCompany, requireCanUseFeature('expense'), roleAuthorisation('expenses', 'create'), async (req, res, next) => {
    const expense = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    expense.companyId = filter.companyId;
    expense.urId = await generateUrId(expenseMain);
    const newExpense = new expenseMain(expense);
    let errResponse;
    const saved = await newExpense.save()
        .catch(err => {
        expenseRoutesLogger.error('create - err: ', err);
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = stringifyMongooseErr(err.errors);
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
        addParentToLocals(res, saved._id, expenseMain.collection.collectionName, 'makeTrackEdit');
    }
    if (!Boolean(saved)) {
        return res.status(403).send('unknown error occered');
    }
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
    let errResponse;
    const updated = await expenseMain.updateOne({
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
        .catch(err => {
        expenseRoutesLogger.error('update - err: ', err);
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = stringifyMongooseErr(err.errors);
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
    addParentToLocals(res, updatedExpense._id, expenseMain.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: Boolean(updated) });
});
expenseRoutes.get('/one/:_id', requireAuth, requireActiveCompany, roleAuthorisation('expenses', 'read'), async (req, res) => {
    const { _id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const expense = await expenseLean
        .findOne({ _id, ...filter })
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
    const deleted = await expenseMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        addParentToLocals(res, _id, expenseMain.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
expenseRoutes.post('/filter', requireAuth, requireActiveCompany, roleAuthorisation('expenses', 'read'), async (req, res) => {
    const { propSort } = req.body;
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
        {
            $facet: {
                data: [...lookupSort(propSort), ...lookupOffset(offset), ...lookupLimit(limit)],
                total: [{ $count: 'count' }]
            }
        },
        {
            $unwind: {
                path: '$total',
                preserveNullAndEmptyArrays: true
            }
        }
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
    /* const deleted = await expenseMain
    .deleteMany({ _id: { $in: _ids }, companyId })
    .catch(err => {
      expenseRoutesLogger.error('deletemany - err: ', err);

      return null;
    }); */
    const deleted = await expenseMain
        .updateMany({ _id: { $in: _ids }, ...filter }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        expenseRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        for (const val of _ids) {
            addParentToLocals(res, val, expenseMain.collection.collectionName, 'trackDataDelete');
        }
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({
            success: Boolean(deleted), err: 'could not delete selected items, try again in a while'
        });
    }
});
//# sourceMappingURL=expense.routes.js.map
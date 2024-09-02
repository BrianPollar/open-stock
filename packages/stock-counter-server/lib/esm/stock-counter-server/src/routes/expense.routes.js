/* eslint-disable @typescript-eslint/no-misused-promises */
import { requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord } from '@open-stock/stock-auth-server';
import { addParentToLocals, makeCompanyBasedQuery, makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectIds } from '@open-stock/stock-universal-server';
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
/**
 * Create a new expense
 * @name POST /create
 * @function
 * @memberof module:expenseRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
expenseRoutes.post('/create/:companyIdParam', requireAuth, requireActiveCompany, requireCanUseFeature('expense'), roleAuthorisation('expenses', 'create'), async (req, res, next) => {
    const expense = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    expense.companyId = filter.companyId;
    const count = await expenseMain
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    expense.urId = makeUrId(Number(count[0]?.urId || '0'));
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
/**
 * Update an existing expense
 * @name PUT /update
 * @function
 * @memberof module:expenseRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
expenseRoutes.put('/update/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('expenses', 'update'), async (req, res) => {
    const updatedExpense = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    let ids;
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
/**
 * Get a single expense by ID
 * @name GET /getone/:id
 * @function
 * @memberof module:expenseRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
expenseRoutes.get('/getone/:id/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('expenses', 'read'), async (req, res) => {
    const { id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const expense = await expenseLean
        .findOne({ _id: id, ...filter })
        .lean();
    if (expense) {
        addParentToLocals(res, expense._id, expenseMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(expense);
});
/**
 * Get all expenses with pagination
 * @name GET /getall/:offset/:limit
 * @function
 * @memberof module:expenseRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
expenseRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('expenses', 'read'), async (req, res) => {
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
/**
 * Delete a single expense by ID
 * @name DELETE /deleteone/:id
 * @function
 * @memberof module:expenseRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
expenseRoutes.delete('/deleteone/:id/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('expenses', 'delete'), async (req, res) => {
    const { id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    // const deleted = await expenseMain.findOneAndDelete({ _id: id, companyId });
    const deleted = await expenseMain.updateOne({ _id: id, ...filter }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        addParentToLocals(res, id, expenseMain.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
/**
 * Search expenses by a search term and key
 * @name POST /search/:offset/:limit
 * @function
 * @memberof module:expenseRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
expenseRoutes.post('/search/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('expenses', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const all = await Promise.all([
        expenseLean
            .find({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .skip(offset)
            .limit(limit)
            .lean(),
        expenseLean.countDocuments({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
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
/**
 * Delete multiple expenses by ID
 * @name PUT /deletemany
 * @function
 * @memberof module:expenseRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
expenseRoutes.put('/deletemany/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('expenses', 'delete'), async (req, res) => {
    const { ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const isValid = verifyObjectIds([...ids]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    /* const deleted = await expenseMain
      .deleteMany({ _id: { $in: ids }, companyId })
      .catch(err => {
        expenseRoutesLogger.error('deletemany - err: ', err);
  
        return null;
      }); */
    const deleted = await expenseMain
        .updateMany({ _id: { $in: ids }, ...filter }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        expenseRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        for (const val of ids) {
            addParentToLocals(res, val, expenseMain.collection.collectionName, 'trackDataDelete');
        }
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=expense.routes.js.map
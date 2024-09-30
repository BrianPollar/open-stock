import { requireActiveCompany } from '@open-stock/stock-auth-server';
import { addParentToLocals, generateUrId, makeCompanyBasedQuery, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { expenseLean } from '../../../models/expense.model';
import { expenseReportLean, expenseReportMain } from '../../../models/printables/report/expenesreport.model';
/** Logger for expense report routes */
const expenseReportRoutesLogger = tracer.colorConsole({
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
 * Expense report routes.
 */
export const expenseReportRoutes = express.Router();
expenseReportRoutes.post('/add', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'create'), async (req, res) => {
    const expenseReport = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    expenseReport.companyId = filter.companyId;
    expenseReport.urId = await generateUrId(expenseReportMain);
    const newExpenseReport = new expenseReportMain(expenseReport);
    let errResponse;
    const saved = await newExpenseReport.save().catch(err => {
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
    if (saved && saved._id) {
        addParentToLocals(res, saved._id, expenseReportLean.collection.collectionName, 'makeTrackEdit');
    }
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    return res.status(200).send({ success: true });
});
expenseReportRoutes.get('/one/:urId', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'read'), async (req, res) => {
    const { urId } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const expenseReport = await expenseReportLean
        .findOne({ urId, ...filter })
        .lean()
        .populate({ path: 'expenses', model: expenseLean });
    if (!expenseReport) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    addParentToLocals(res, expenseReport._id, expenseReportLean.collection.collectionName, 'trackDataView');
    return res.status(200).send(expenseReport);
});
expenseReportRoutes.get('/all/:offset/:limit', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'read'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { filter } = makeCompanyBasedQuery(req);
    const all = await Promise.all([
        expenseReportLean
            .find(filter)
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({ path: 'expenses', model: expenseLean })
            .catch(() => {
            return [];
        }),
        expenseReportLean.countDocuments(filter)
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        addParentToLocals(res, val._id, expenseReportLean.collection.collectionName, 'trackDataView');
    }
    res.status(200).send(response);
    return res.end();
});
expenseReportRoutes.delete('/delete/one/:_id', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'delete'), async (req, res) => {
    const { _id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    // const deleted = await expenseReportMain.findOneAndDelete({ _id, ...filter });
    const deleted = await expenseReportMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        addParentToLocals(res, _id, expenseReportLean.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
expenseReportRoutes.post('/filter', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
    /* TODO const aggCursor = invoiceLean
  .aggregate<IfilterAggResponse<soth>>([
    ...lookupSubFieldInvoiceRelatedFilter(constructFiltersFromBody(req), propSort, offset, limit)
  ]);
  const dataArr: IfilterAggResponse<soth>[] = [];

  for await (const data of aggCursor) {
    dataArr.push(data);
  }

  const all = dataArr[0]?.data || [];
  const count = dataArr[0]?.total?.count || 0;
  */
    const all = await Promise.all([
        expenseReportLean
            .find({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .lean()
            .skip(offset)
            .limit(limit)
            .populate({ path: 'expenses', model: expenseLean }),
        expenseReportLean.countDocuments({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        addParentToLocals(res, val._id, expenseReportLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
expenseReportRoutes.put('/delete/many', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    /* const deleted = await expenseReportMain
    .deleteMany({ ...filter, _id: { $in: _ids } })
    .catch(err => {
      expenseReportRoutesLogger.error('deletemany - err: ', err);

      return null;
    }); */
    const deleted = await expenseReportMain
        .updateMany({ ...filter, _id: { $in: _ids } }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        expenseReportRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        for (const val of _ids) {
            addParentToLocals(res, val, expenseReportLean.collection.collectionName, 'trackDataDelete');
        }
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({
            success: Boolean(deleted),
            err: 'could not delete selected items, try again in a while'
        });
    }
});
//# sourceMappingURL=expensereport.routes.js.map
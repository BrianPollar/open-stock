import { requireActiveCompany } from '@open-stock/stock-auth-server';
import { addParentToLocals, generateUrId, handleMongooseErr, makeCompanyBasedQuery, offsetLimitRelegator, requireAuth, roleAuthorisation, verifyObjectId } from '@open-stock/stock-universal-server';
import express from 'express';
import { Error } from 'mongoose';
import { expenseLean } from '../../../models/expense.model';
import { expenseReportLean, expenseReportMain } from '../../../models/printables/report/expenesreport.model';
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
    const savedRes = await newExpenseReport.save().catch((err) => err);
    if (savedRes instanceof Error) {
        const errResponse = handleMongooseErr(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    if (savedRes && savedRes._id) {
        addParentToLocals(res, savedRes._id, expenseReportLean.collection.collectionName, 'makeTrackEdit');
    }
    return res.status(200).send({ success: true });
});
expenseReportRoutes.get('/one/:urIdOr_id', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'read'), async (req, res) => {
    const { urIdOr_id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const filterwithId = verifyObjectId(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const expenseReport = await expenseReportLean
        .findOne({ ...filterwithId, ...filter })
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
    const updateRes = await expenseReportMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } })
        .catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    addParentToLocals(res, _id, expenseReportLean.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
expenseReportRoutes.post('/filter', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'read'), async (req, res) => {
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
            .find({ ...filter })
            .lean()
            .skip(offset)
            .limit(limit)
            .populate({ path: 'expenses', model: expenseLean }),
        expenseReportLean.countDocuments({ ...filter })
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
    const updateRes = await expenseReportMain
        .updateMany({ ...filter, _id: { $in: _ids } }, {
        $set: { isDeleted: true }
    })
        .catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    for (const val of _ids) {
        addParentToLocals(res, val, expenseReportLean.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=expensereport.routes.js.map
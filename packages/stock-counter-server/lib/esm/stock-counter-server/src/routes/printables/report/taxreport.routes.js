import { requireActiveCompany } from '@open-stock/stock-auth-server';
import { addParentToLocals, generateUrId, makeCompanyBasedQuery, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { paymentLean } from '../../../models/payment.model';
import { estimateLean } from '../../../models/printables/estimate.model';
import { taxReportLean, taxReportMain } from '../../../models/printables/report/taxreport.model';
/** Logger for tax report routes */
const taxReportRoutesLogger = tracer.colorConsole({
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
 * Router for tax report routes.
 */
export const taxReportRoutes = express.Router();
taxReportRoutes.post('/add', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'create'), async (req, res) => {
    const taxReport = req.body.taxReport;
    const { filter } = makeCompanyBasedQuery(req);
    taxReport.companyId = filter.companyId;
    taxReport.urId = await generateUrId(taxReportMain);
    const newTaxReport = new taxReportMain(taxReport);
    let errResponse;
    const saved = await newTaxReport.save()
        .catch(err => {
        taxReportRoutesLogger.error('create - err: ', err);
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
        addParentToLocals(res, saved._id, taxReportMain.collection.collectionName, 'makeTrackEdit');
    }
    return res.status(200).send({ success: true });
});
taxReportRoutes.get('/one/:urId', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'read'), async (req, res) => {
    const { urId } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const taxReport = await taxReportLean
        .findOne({ urId, ...filter })
        .lean()
        .populate({ path: 'estimates', model: estimateLean })
        .populate({ path: 'payments', model: paymentLean });
    if (!taxReport) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    addParentToLocals(res, taxReport._id, taxReportMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(taxReport);
});
taxReportRoutes.get('/all/:offset/:limit', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'read'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { filter } = makeCompanyBasedQuery(req);
    const all = await Promise.all([
        taxReportLean
            .find({ ...filter })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({ path: 'estimates', model: estimateLean })
            .populate({ path: 'payments', model: paymentLean }),
        taxReportLean.countDocuments({ ...filter })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        addParentToLocals(res, val._id, taxReportMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
taxReportRoutes.delete('/delete/one/:_id', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'delete'), async (req, res) => {
    const { _id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    // const deleted = await taxReportMain.findOneAndDelete({ _id, ...filter });
    const deleted = await taxReportMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        addParentToLocals(res, _id, taxReportMain.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
taxReportRoutes.post('/filter', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
    /*
  const aggCursor = invoiceLean
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
        taxReportLean
            .find({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({ path: 'estimates', model: estimateLean })
            .populate({ path: 'payments', model: paymentLean }),
        taxReportLean.countDocuments({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        addParentToLocals(res, val._id, taxReportMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
taxReportRoutes.put('/delete/many', requireAuth, requireActiveCompany, roleAuthorisation('reports', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    /* const deleted = await taxReportMain
    .deleteMany({ ...filter, _id: { $in: _ids } })
    .catch(err => {
      taxReportRoutesLogger.error('deletemany - err: ', err);

      return null;
    }); */
    const deleted = await taxReportMain
        .updateMany({ ...filter, _id: { $in: _ids } }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        taxReportRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        for (const val of _ids) {
            addParentToLocals(res, val, taxReportMain.collection.collectionName, 'trackDataDelete');
        }
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({
            success: Boolean(deleted), err: 'could not delete selected items, try again in a while'
        });
    }
});
//# sourceMappingURL=taxreport.routes.js.map
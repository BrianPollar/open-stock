/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { createMockTaxReport, createMockTaxReports } from '../../../../../tests/stock-counter-mocks';
/**
 * Router for tax report routes.
 */
export const taxReportRoutesDummy = express.Router();
taxReportRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
taxReportRoutesDummy.get('/getone/:urId/:companyIdParam', (req, res) => {
    res.status(200).send(createMockTaxReport());
});
taxReportRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    res.status(200).send(createMockTaxReports(Number(req.params.limit)));
});
taxReportRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
taxReportRoutesDummy.post('/search/:limit/:offset/:companyIdParam', (req, res) => {
    res.status(200).send(createMockTaxReports(Number(req.params.limit)));
});
taxReportRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=taxreport.routes.js.map
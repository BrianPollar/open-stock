import express from 'express';
import { createMockProfitAndLossReport, createMockProfitAndLossReports } from '../../../../../mocks/stock-counter-mocks';
/**
 * Router for profit and loss report.
 */
export const profitAndLossReportRoutesDummy = express.Router();
profitAndLossReportRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
profitAndLossReportRoutesDummy.get('/getone/:urId/:companyIdParam', (req, res) => {
    res.status(200).send(createMockProfitAndLossReport());
});
profitAndLossReportRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: createMockProfitAndLossReports(Number(req.params.limit))
    };
    res.status(200).send(response);
});
profitAndLossReportRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
profitAndLossReportRoutesDummy.post('/search/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: createMockProfitAndLossReports(Number(req.params.limit))
    };
    res.status(200).send(response);
});
profitAndLossReportRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=profitandlossreport.routes.js.map
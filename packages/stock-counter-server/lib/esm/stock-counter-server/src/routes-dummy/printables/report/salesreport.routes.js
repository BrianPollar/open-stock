import express from 'express';
import { createMockSalesReport, createMockSalesReports } from '../../../../../tests/stock-counter-mocks';
/**
 * Express router for sales report routes.
 */
export const salesReportRoutesDummy = express.Router();
salesReportRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
salesReportRoutesDummy.get('/getone/:urId/:companyIdParam', (req, res) => {
    res.status(200).send(createMockSalesReport());
});
salesReportRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: createMockSalesReports(Number(req.params.limit))
    };
    res.status(200).send(response);
});
salesReportRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
salesReportRoutesDummy.post('/search/:limit/:offset/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: createMockSalesReports(Number(req.params.limit))
    };
    res.status(200).send(response);
});
salesReportRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=salesreport.routes.js.map
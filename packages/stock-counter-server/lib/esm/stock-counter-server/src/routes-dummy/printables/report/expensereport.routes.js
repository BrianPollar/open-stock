/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { createMockExpenseReport, createMockExpenseReports } from '../../../../../tests/stock-counter-mocks';
/**
 * Expense report routes.
 */
export const expenseReportRoutesDummy = express.Router();
expenseReportRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
expenseReportRoutesDummy.get('/getone/:urId/:companyIdParam', (req, res) => {
    res.status(200).send(createMockExpenseReport());
});
expenseReportRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    res.status(200).send(createMockExpenseReports(Number(req.params.limit)));
});
expenseReportRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
    return res.status(200).send({ success: true });
});
expenseReportRoutesDummy.post('/search/:offset/:limit/:companyIdParam', (req, res) => {
    res.status(200).send(createMockExpenseReports(Number(req.params.limit)));
});
expenseReportRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=expensereport.routes.js.map
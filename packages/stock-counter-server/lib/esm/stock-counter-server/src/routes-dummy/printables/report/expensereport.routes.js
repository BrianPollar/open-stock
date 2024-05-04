import express from 'express';
import { createMockExpenseReport, createMockExpenseReports } from '../../../../../mocks/stock-counter-mocks';
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
    const response = {
        count: req.params.limit,
        data: createMockExpenseReports(Number(req.params.limit))
    };
    res.status(200).send(response);
});
expenseReportRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
    return res.status(200).send({ success: true });
});
expenseReportRoutesDummy.post('/search/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: createMockExpenseReports(Number(req.params.limit))
    };
    res.status(200).send(response);
});
expenseReportRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=expensereport.routes.js.map
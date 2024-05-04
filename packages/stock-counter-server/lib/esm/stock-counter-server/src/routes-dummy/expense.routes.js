import express from 'express';
import { createMockExpense, createMockExpenses } from '../../../mocks/stock-counter-mocks';
/**
 * Router for handling expense routes.
 */
export const expenseRoutesDummy = express.Router();
expenseRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
expenseRoutesDummy.put('/update/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
expenseRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
    res.status(200).send(createMockExpense());
});
expenseRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: createMockExpenses(Number(req.params.limit))
    };
    res.status(200).send(response);
});
expenseRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
expenseRoutesDummy.post('/search/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: createMockExpenses(Number(req.params.limit))
    };
    res.status(200).send(response);
});
expenseRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=expense.routes.js.map
import express from 'express';
import { createMockExpense, createMockExpenses } from '../../../tests/stock-counter-mocks';

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
  res.status(200).send(createMockExpenses(Number(req.params.limit)));
});

expenseRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

expenseRoutesDummy.post('/search/:limit/:offset/:companyIdParam', (req, res) => {
  res.status(200).send(createMockExpenses(Number(req.params.limit)));
});

expenseRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});


import express from 'express';
import { createMockFaq, createMockFaqAnswers, createMockFaqs } from '../../../tests/stock-counter-mocks';

/**
 * Router for FAQ routes.
 */
export const faqRoutesDummy = express.Router();

faqRoutesDummy.post('/create/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

faqRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
  res.status(200).send(createMockFaq());
});

faqRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
  res.status(200).send(createMockFaqs(Number(req.params.limit)));
});

faqRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

faqRoutesDummy.post('/createans/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

faqRoutesDummy.get('/getallans/:faqId/:companyIdParam', (req, res) => {
  res.status(200).send(createMockFaqAnswers(10));
});

faqRoutesDummy.delete('/deleteoneans/:id/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

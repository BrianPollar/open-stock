import express from 'express';
import { createMockSubscriptionPackages } from '../../../../tests/stock-counter-mocks';

export const subscriptionPackageRoutesDummy = express.Router();

subscriptionPackageRoutesDummy.post('/create/:companyIdParam', (req, res) => {
  return res.status(200).send({ success: true, status: 200 });
});

subscriptionPackageRoutesDummy.get('/getall', (req, res) => {
  const subscriptionPackages = createMockSubscriptionPackages(10);
  return res.status(200).send(subscriptionPackages);
});

subscriptionPackageRoutesDummy.put('/deleteone/:id', (req, res) => {
  return res.status(200).send({ success: true });
});


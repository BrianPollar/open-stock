
import express from 'express';
import { createMockCompany } from '../../../tests/stock-auth-mocks';

/**
 * Router for super admin routes.
 */
export const superAdminRoutesDummy = express.Router();


superAdminRoutesDummy.post('/login', (req, res) => {
  const nowResponse = {
    success: true,
    user: createMockCompany(),
    token: 'token'
  };
  return res.status(200).send(nowResponse);
});



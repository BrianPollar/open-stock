
import { IdataArrayResponse } from '@open-stock/stock-universal';
import express from 'express';
import { createMockCompany, createMockCompanys, createMockUser } from '../../../mocks/stock-auth-mocks';

export const companyAuthRoutesDummy = express.Router();

companyAuthRoutesDummy.get('/authexpress/:companyIdParam', (req, res) => {
  const nowResponse = {
    success: true,
    user: createMockCompany(),
    token: 'token'
  };

  return res.status(200).send(nowResponse);
});

companyAuthRoutesDummy.post('recover', (req, res) => {
  const response = {
    success: true,
    message: 'Recovery email sent',
    type: '_link'
  };

  res.status(200).send(response);
});

companyAuthRoutesDummy.post('/confirm', (req, res) => {
  const response = {
    success: true,
    msg: 'Password reset successful',
    user: createMockUser()
  };

  res.status(200).send(response);
});

companyAuthRoutesDummy.put('/resetpaswd', (req, res) => {
  const response = {
    success: true,
    msg: 'Password reset successful',
    user: createMockUser()
  };

  res.status(200).send(response);
});

companyAuthRoutesDummy.post('/updateprofileimg/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

companyAuthRoutesDummy.put('/blockunblock/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

companyAuthRoutesDummy.post('/addcompanyimg/:companyIdParam', (req, res) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  res.status(200).send({ success: true, _id: 'id' });
});

companyAuthRoutesDummy.get('/getonecompany/:urId/:companyIdParam', (req, res) => {
  const company = createMockCompany();

  return res.status(200).send(company);
});

companyAuthRoutesDummy.get('/getcompanys/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockCompanys(req.params.limit)
  };

  return res.status(200).send(response);
});

companyAuthRoutesDummy.put('/updatecompanybulk/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

companyAuthRoutesDummy.post('/updatecompanybulkimg/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

companyAuthRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});


companyAuthRoutesDummy.put('/deleteimages/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});



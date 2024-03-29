
import { IdataArrayResponse } from '@open-stock/stock-universal';
import express from 'express';
import { createMockUser, createMockUsers } from '../../../tests/stock-auth-mocks';

/**
 * Router for authentication routes.
 */
export const userAuthRoutesDummy = express.Router();


userAuthRoutesDummy.get('/authexpress/:companyIdParam', (req, res) => {
  const nowResponse = {
    success: true,
    user: createMockUser(),
    token: 'token'
  };
  return res.status(200).send(nowResponse);
});

userAuthRoutesDummy.post('/login', (req, res) => {
  const nowResponse = {
    success: true,
    user: createMockUser(),
    token: 'token'
  };
  return res.status(200).send(nowResponse);
});

userAuthRoutesDummy.post('/signup', (req, res) => {
  const response = {
    status: 200,
    success: true,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _id: '_id',
    phone: '077477484999'
  };
  res.status(200).send(response);
});

userAuthRoutesDummy.post('recover', (req, res) => {
  const response = {
    success: true,
    message: 'Recovery email sent',
    type: '_link'
  };
  res.status(200).send(response);
});

userAuthRoutesDummy.post('/confirm', (req, res) => {
  const response = {
    success: true,
    msg: 'Password reset successful',
    user: createMockUser()
  };
  res.status(200).send(response);
});

userAuthRoutesDummy.put('/resetpaswd', (req, res) => {
  const response = {
    success: true,
    msg: 'Password reset successful',
    user: createMockUser()
  };
  res.status(200).send(response);
});

userAuthRoutesDummy.post('/manuallyverify/:userId/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

userAuthRoutesDummy.post('/sociallogin', (req, res) => {
  const response = {
    success: true,
    user: createMockUser()
  };
  res.status(200).send(response);
});

userAuthRoutesDummy.put('/updateprofile/:formtype/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

userAuthRoutesDummy.post('/updateprofileimg/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

userAuthRoutesDummy.put('/updatepermissions/:userId/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

userAuthRoutesDummy.put('/blockunblock/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

userAuthRoutesDummy.put('/addupdateaddr/:userId/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

userAuthRoutesDummy.get('/getoneuser/:urId/:companyIdParam', (req, res) => {
  res.status(200).send(createMockUser());
});

userAuthRoutesDummy.get('/getusers/:where/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockUsers(req.params.limit)
  };
  res.status(200).send(response);
});

userAuthRoutesDummy.post('/adduser/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

userAuthRoutesDummy.post('/adduserimg/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

userAuthRoutesDummy.put('/updateuserbulk/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

userAuthRoutesDummy.post('/updateuserbulkimg/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

userAuthRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

userAuthRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

userAuthRoutesDummy.put('/deleteimages/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

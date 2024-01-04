
import express from 'express';
import { createMockUser } from '../../../tests/stock-auth-mocks';

/**
 * Router for authentication routes.
 */
export const authRoutesDummy = express.Router();


authRoutesDummy.get('/authexpress/:companyIdParam', (req, res) => {
  const nowResponse = {
    success: true,
    user: createMockUser(),
    token: 'token'
  };
  return res.status(200).send(nowResponse);
});

authRoutesDummy.post('/login', (req, res) => {
  const nowResponse = {
    success: true,
    user: createMockUser(),
    token: 'token'
  };
  return res.status(200).send(nowResponse);
});

authRoutesDummy.post('/signup', (req, res) => {
  const response = {
    status: 200,
    success: true,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _id: '_id',
    phone: '077477484999'
  };
  res.status(200).send(response);
});

authRoutesDummy.post('recover', (req, res) => {
  const response = {
    success: true,
    message: 'Recovery email sent',
    type: '_link'
  };
  res.status(200).send(response);
});

authRoutesDummy.post('/confirm', (req, res) => {
  const response = {
    success: true,
    msg: 'Password reset successful',
    user: createMockUser()
  };
  res.status(200).send(response);
});

authRoutesDummy.put('/resetpaswd', (req, res) => {
  const response = {
    success: true,
    msg: 'Password reset successful',
    user: createMockUser()
  };
  res.status(200).send(response);
});

authRoutesDummy.post('/manuallyverify/:userId/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

authRoutesDummy.post('/sociallogin', (req, res) => {
  const response = {
    success: true,
    user: createMockUser()
  };
  res.status(200).send(response);
});

authRoutesDummy.put('/updateprofile/:formtype/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

authRoutesDummy.post('/updateprofileimg/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

authRoutesDummy.put('/updatepermissions/:userId/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

authRoutesDummy.put('/blockunblock/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

authRoutesDummy.put('/addupdateaddr/:userId/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

authRoutesDummy.get('/getoneuser/:urId/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

authRoutesDummy.get('/getusers/:where/:offset/:limit/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

authRoutesDummy.post('/adduser/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

authRoutesDummy.post('/adduserimg/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

authRoutesDummy.put('/updateuserbulk/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

authRoutesDummy.post('/updateuserbulkimg/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

authRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

authRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

authRoutesDummy.put('/deleteimages/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

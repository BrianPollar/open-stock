/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Icompany, Icustomrequest, IdataArrayResponse, IsubscriptionPackage, Iuser } from '@open-stock/stock-universal';
import { offsetLimitRelegator, requireAuth, roleAuthorisation, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import { IpayDetails } from 'pesapal3';
import * as tracer from 'tracer';
import { companyLean } from '../../models/company.model';
import { TcompanySubscription, companySubscriptionLean, companySubscriptionMain } from '../../models/subscriptions/company-subscription.model';
import { userLean } from '../../models/user.model';
import { pesapalPaymentInstance } from '../../stock-auth-server';
import { requireActiveCompany } from '../company-auth';

/** Logger for companySubscription routes */
const companySubscriptionRoutesLogger = tracer.colorConsole(
  {
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
      // eslint-disable-next-line no-console
      console.log(data.output);
      const logDir = path.join(process.cwd() + '/openstockLog/');
      fs.mkdir(logDir, { recursive: true }, (err) => {
        if (err) {
          if (err) {
            // eslint-disable-next-line no-console
            console.log('data.output err ', err);
          }
        }
      });
      fs.appendFile(logDir + '/auth-server.log', data.rawoutput + '\n', err => {
        if (err) {
          // eslint-disable-next-line no-console
          console.log('raw.output err ', err);
        }
      });
    }
  });


const firePesapalRelegator = async(subctn: IsubscriptionPackage, savedSub: TcompanySubscription, company: Icompany, currUser: Iuser) => {
  const payDetails = {
    id: savedSub._id.toString(),
    currency: 'USD',
    amount: subctn.ammount,
    description: 'Complete payments for subscription ,' + subctn.name,
    callback_url: pesapalPaymentInstance.config.pesapalCallbackUrl,
    cancellation_url: '',
    notification_id: '',
    billing_address: {
      email_address: currUser.email,
      phone_number: currUser.phone.toString(),
      country_code: 'UG',
      first_name: company.displayName,
      middle_name: '',
      last_name: '',
      line_1: '',
      line_2: '',
      city: '',
      state: '',
      // postal_code: paymentRelated.shippingAddress,
      zip_code: ''
    }
  } as unknown as IpayDetails;
  const response = await pesapalPaymentInstance.submitOrder(payDetails, subctn._id, 'Complete product payment') ;
  if (!response.success) {
    return { success: false, err: response.err };
  }
  const companySub = await companySubscriptionMain.findByIdAndUpdate(savedSub._id);
  companySub.pesaPalorderTrackingId = response.pesaPalOrderRes.order_tracking_id;
  let savedErr: string;
  await companySub.save().catch(err => {
    companySubscriptionRoutesLogger.error('save error', err);
    savedErr = err;
    return null;
  });
  if (savedErr) {
    return { success: false };
  }
  return {
    success: true,
    pesaPalOrderRes: {
      redirect_url: response.pesaPalOrderRes.redirect_url
    }
  };
};


export const getDays = (duration: number) => {
  let response: number;
  switch (duration) {
    case 1:
      response = 30;
      break;
    case 2:
      response = 60;
      break;
    case 3:
      response = 60;
      break;
    case 6:
      response = 6 * 30;
      break;
    case 12:
      response = 12 * 30;
      break;
  }
  return response;
};
/**
 * Router for handling companySubscription-related routes.
 */
export const companySubscriptionRoutes = express.Router();

companySubscriptionRoutes.post('/subscribe/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('subscriptions', 'create'), async(req, res) => {
  companySubscriptionRoutesLogger.info('making companySubscriptionRoutes');
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const subscriptionPackage = req.body;
  let response;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectId(queryId);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const startDate = new Date();
  const now = new Date();
  const endDate = now.setDate(now.getDate() + getDays(subscriptionPackage.duration));

  const companySubObj = {
    name: subscriptionPackage.name,
    ammount: subscriptionPackage.ammount,
    duration: subscriptionPackage.duration,
    companyId: queryId,
    active: true,
    subscriprionId: subscriptionPackage._id,
    startDate,
    endDate,
    pesaPalorderTrackingId: '',
    status: companyId === 'superAdmin' ? 'paid' : 'pending',
    features: subscriptionPackage.features
  };

  const newCompSub = new companySubscriptionMain(companySubObj);
  let savedErr: string;
  const savedSub = await newCompSub.save().catch(err => {
    companySubscriptionRoutesLogger.error('save error', err);
    savedErr = err;
    return null;
  });
  if (savedErr) {
    return res.status(500).send({ success: false });
  }

  if (companyId !== 'superAdmin') {
    const company = await companyLean.findById(companyId).lean();
    if (!company) {
      await companySubscriptionMain.deleteOne({ _id: savedSub._id });
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const currUser = await userLean.findOne({ _id: company.owner }).lean();
    if (!currUser) {
      await companySubscriptionMain.deleteOne({ _id: savedSub._id });
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    response = await firePesapalRelegator(subscriptionPackage, savedSub, company, currUser);
    if (!response.success) {
      await companySubscriptionMain.deleteOne({ _id: savedSub._id });
      return res.status(401).send({ success: false, status: 401, err: response.err });
    }
  }

  return res.status(200).send({ success: true, data: response });
});

companySubscriptionRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const { companyId } = (req as Icustomrequest).user;
  let query;
  if (companyId !== 'superAdmin') {
    query = { companyId };
  } else {
    query = { status: 'paid' };
  }
  const all = await Promise.all([
    companySubscriptionLean
      .find(query)
      .skip(offset)
      .limit(limit)
      .lean(),
    companySubscriptionLean.countDocuments(query)
  ]);
  const response: IdataArrayResponse = {
    count: all[1],
    data: all[0]
  };
  return res.status(200).send(response);
});

companySubscriptionRoutes.put('/deleteone/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('subscriptions', 'delete'), async(req, res) => {
  const { id } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectIds([id, queryId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const deleted = await companySubscriptionMain.findOneAndDelete({ _id: id, companyId: queryId });
  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});

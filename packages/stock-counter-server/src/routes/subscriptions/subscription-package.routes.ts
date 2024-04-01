/* eslint-disable @typescript-eslint/no-misused-promises */
import { Icustomrequest } from '@open-stock/stock-universal';
import { requireAuth, roleAuthorisation } from '@open-stock/stock-universal-server';
import express from 'express';
import { getLogger } from 'log4js';
import { subscriptionPackageLean, subscriptionPackageMain } from '../../models/subscriptions/subscription-package.model';

/** Logger for subscriptionPackage routes */
const subscriptionPackageRoutesLogger = getLogger('routes/subscriptionPackageRoutes');

/**
 * Router for handling subscriptionPackage-related routes.
 */
export const subscriptionPackageRoutes = express.Router();

subscriptionPackageRoutes.post('/create', requireAuth, roleAuthorisation('users', 'create'), async(req, res) => {
  const { subscriptionPackages } = req.body;
  const newPkg = new subscriptionPackageMain(subscriptionPackages);
  await newPkg.save();
  return res.status(200).send({ success: true, status: 200 });
});


subscriptionPackageRoutes.post('/uodateone', requireAuth, roleAuthorisation('users', 'create'), async(req, res) => {
  const { subscriptionPackage } = req.body;
  const subPackage = await subscriptionPackageLean
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .findOneAndUpdate({ _id: subscriptionPackage._id });
  subPackage.name = subscriptionPackage.name || subPackage.name;
  subPackage.ammount = subscriptionPackage.ammount || subPackage.ammount;
  subPackage.duration = subscriptionPackage.duration || subPackage.duration;
  subPackage.active = subscriptionPackage.active || subPackage.active;
  subPackage.features = subscriptionPackage.features || subPackage.features;
  await subPackage.save();
  return res.status(200).send({ success: true, status: 200 });
});

subscriptionPackageRoutes.get('/getall', async(req, res) => {
  const { companyId } = (req as Icustomrequest).user;
  const subscriptionPackages = await subscriptionPackageLean
    .find({ companyId })
    .lean();
  return res.status(200).send(subscriptionPackages);
});

subscriptionPackageRoutes.put('/deleteone/:id', requireAuth, roleAuthorisation('users', 'delete'), async(req, res) => {
  const { id } = req.params;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const deleted = await subscriptionPackageMain.findOneAndDelete({ _id: id });
  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});


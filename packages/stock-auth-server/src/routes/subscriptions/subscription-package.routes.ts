import { IcustomRequest, IsubscriptionPackage } from '@open-stock/stock-universal';
import {
  addParentToLocals,
  handleMongooseErr,
  mainLogger,
  makePredomFilter,
  requireAuth
} from '@open-stock/stock-universal-server';
import express from 'express';
import { Error } from 'mongoose';
import {
  subscriptionPackageLean, subscriptionPackageMain
} from '../../models/subscriptions/subscription-package.model';
import { requireSuperAdmin } from '../superadmin.routes';

/**
 * Router for handling subscriptionPackage-related routes.
 */
export const subscriptionPackageRoutes = express.Router();

subscriptionPackageRoutes.post(
  '/create',
  requireAuth,
  requireSuperAdmin,
  async(req: IcustomRequest<never, unknown>, res) => {
    mainLogger.info('Create subscription');
    const subscriptionPackages = req.body;
    const newPkg = new subscriptionPackageMain(subscriptionPackages);

    const savedRes = await newPkg.save().catch((err: Error) => {
      mainLogger.error('save error', err);

      return err;
    });

    if (savedRes instanceof Error) {
      const errResponse = handleMongooseErr(savedRes);

      return res.status(errResponse.status).send(errResponse);
    }

    if (savedRes._id) {
      addParentToLocals(res, savedRes._id, subscriptionPackageMain.collection.collectionName, 'makeTrackEdit');
    }


    return res.status(200).send({ success: true, status: 200 });
  }
);


subscriptionPackageRoutes.put(
  '/updateone',
  requireAuth,
  requireSuperAdmin,
  async(req: IcustomRequest<never, IsubscriptionPackage>, res) => {
    mainLogger.info('Update subscription');
    const subscriptionPackage = req.body;
    const subPackage = await subscriptionPackageMain
      .findOne({ _id: subscriptionPackage._id })
      .lean();

    if (!subPackage) {
      return res.status(404).send({ success: false });
    }

    const updateRes = await subscriptionPackageMain.updateOne({
      _id: subscriptionPackage._id
    }, {
      name: subscriptionPackage.name || subPackage.name,
      ammount: subscriptionPackage.ammount || subPackage.ammount,
      duration: subscriptionPackage.duration || subPackage.duration,
      active: subscriptionPackage.active || subPackage.active,
      features: subscriptionPackage.features || subPackage.features
    }).catch((err: Error) => {
      mainLogger.error('save error', err);

      return err;
    });

    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, subscriptionPackage._id, subscriptionPackageMain.collection.collectionName, 'makeTrackEdit');

    return res.status(200).send({ success: true, status: 200 });
  }
);

subscriptionPackageRoutes.get('/all', async(req: IcustomRequest<never, null>, res) => {
  mainLogger.info('Get all subscription');
  const subscriptionPackages = await subscriptionPackageLean
    .find({ ...makePredomFilter(req) })
    .lean();

  for (const val of subscriptionPackages) {
    addParentToLocals(res, val._id, subscriptionPackageMain.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(subscriptionPackages);
});

subscriptionPackageRoutes.put('/delete/one/:_id', requireAuth, async(req: IcustomRequest<never, unknown>, res) => {
  const { _id } = req.params;

  const updateRes = await subscriptionPackageMain.updateOne({ _id }, { $set: { isDeleted: true } })
    .catch((err: Error) => err);

  if (updateRes instanceof Error) {
    const errResponse = handleMongooseErr(updateRes);

    return res.status(errResponse.status).send(errResponse);
  }

  addParentToLocals(res, _id, subscriptionPackageMain.collection.collectionName, 'trackDataDelete');

  return res.status(200).send({ success: true });
});


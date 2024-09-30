import { IcustomRequest, IsubscriptionPackage } from '@open-stock/stock-universal';
import { addParentToLocals, makePredomFilter, requireAuth } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import {
  subscriptionPackageLean, subscriptionPackageMain
} from '../../models/subscriptions/subscription-package.model';
import { requireSuperAdmin } from '../superadmin.routes';

/** Logger for subscriptionPackage routes */
const subscriptionPackageRoutesLogger = tracer.colorConsole({
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

/**
 * Router for handling subscriptionPackage-related routes.
 */
export const subscriptionPackageRoutes = express.Router();

subscriptionPackageRoutes.post(
  '/create',
  requireAuth,
  requireSuperAdmin,
  async(req: IcustomRequest<never, unknown>, res) => {
    subscriptionPackageRoutesLogger.info('Create subscription');
    const subscriptionPackages = req.body;
    const newPkg = new subscriptionPackageMain(subscriptionPackages);
    let savedErr: string;

    const saved = await newPkg.save().catch(err => {
      subscriptionPackageRoutesLogger.error('save error', err);
      savedErr = err;

      return err;
    });

    if (savedErr) {
      return res.status(500).send({ success: false });
    }

    if (saved && saved._id) {
      addParentToLocals(res, saved._id, subscriptionPackageMain.collection.collectionName, 'makeTrackEdit');
    }


    return res.status(200).send({ success: true, status: 200 });
  }
);


subscriptionPackageRoutes.put(
  '/updateone',
  requireAuth,
  requireSuperAdmin,
  async(req: IcustomRequest<never, IsubscriptionPackage>, res) => {
    subscriptionPackageRoutesLogger.info('Update subscription');
    const subscriptionPackage = req.body;
    const subPackage = await subscriptionPackageMain
      .findOne({ _id: subscriptionPackage._id })
      .lean();

    let savedErr: string;

    await subscriptionPackageMain.updateOne({
      _id: subscriptionPackage._id
    }, {
      name: subscriptionPackage.name || subPackage.name,
      ammount: subscriptionPackage.ammount || subPackage.ammount,
      duration: subscriptionPackage.duration || subPackage.duration,
      active: subscriptionPackage.active || subPackage.active,
      features: subscriptionPackage.features || subPackage.features
    }).catch(err => {
      subscriptionPackageRoutesLogger.error('save error', err);
      savedErr = err;

      return null;
    });
    if (savedErr) {
      return res.status(500).send({ success: false });
    }

    addParentToLocals(res, subscriptionPackage._id, subscriptionPackageMain.collection.collectionName, 'makeTrackEdit');

    return res.status(200).send({ success: true, status: 200 });
  }
);

subscriptionPackageRoutes.get('/all', async(req: IcustomRequest<never, null>, res) => {
  subscriptionPackageRoutesLogger.info('Get all subscription');
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
  // const deleted = await subscriptionPackageMain.findOneAndDelete({ _id });
  const deleted = await subscriptionPackageMain.updateOne({ _id }, { $set: { isDeleted: true } });

  if (Boolean(deleted)) {
    addParentToLocals(res, _id, subscriptionPackageMain.collection.collectionName, 'trackDataDelete');

    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});


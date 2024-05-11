import { requireAuth } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { subscriptionPackageLean, subscriptionPackageMain } from '../../models/subscriptions/subscription-package.model';
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
subscriptionPackageRoutes.post('/create', requireAuth, requireSuperAdmin, async (req, res) => {
    subscriptionPackageRoutesLogger.info('Create subscription');
    const subscriptionPackages = req.body;
    const newPkg = new subscriptionPackageMain(subscriptionPackages);
    let savedErr;
    await newPkg.save().catch(err => {
        subscriptionPackageRoutesLogger.error('save error', err);
        savedErr = err;
        return null;
    });
    if (savedErr) {
        return res.status(500).send({ success: false });
    }
    return res.status(200).send({ success: true, status: 200 });
});
subscriptionPackageRoutes.put('/updateone', requireAuth, requireSuperAdmin, async (req, res) => {
    const subscriptionPackage = req.body;
    const subPackage = await subscriptionPackageLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ _id: subscriptionPackage._id });
    subPackage.name = subscriptionPackage.name || subPackage.name;
    subPackage.ammount = subscriptionPackage.ammount || subPackage.ammount;
    subPackage.duration = subscriptionPackage.duration || subPackage.duration;
    subPackage.active = subscriptionPackage.active || subPackage.active;
    subPackage.features = subscriptionPackage.features || subPackage.features;
    let savedErr;
    await subPackage.save().catch(err => {
        subscriptionPackageRoutesLogger.error('save error', err);
        savedErr = err;
        return null;
    });
    if (savedErr) {
        return res.status(500).send({ success: false });
    }
    return res.status(200).send({ success: true, status: 200 });
});
subscriptionPackageRoutes.get('/getall', async (req, res) => {
    const subscriptionPackages = await subscriptionPackageLean
        .find({})
        .lean();
    return res.status(200).send(subscriptionPackages);
});
subscriptionPackageRoutes.put('/deleteone/:id', requireAuth, requireSuperAdmin, async (req, res) => {
    const { id } = req.params;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await subscriptionPackageMain.findOneAndDelete({ _id: id });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
//# sourceMappingURL=subscription-package.routes.js.map
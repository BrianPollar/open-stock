/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { getLogger } from 'log4js';
import { requireAuth, roleAuthorisation } from '@open-stock/stock-universal-server';
import { subscriptionPackageLean, subscriptionPackageMain } from '../../models/subscriptions/subscription-package.model';
/** Logger for subscriptionPackage routes */
const subscriptionPackageRoutesLogger = getLogger('routes/subscriptionPackageRoutes');
/**
 * Router for handling subscriptionPackage-related routes.
 */
export const subscriptionPackageRoutes = express.Router();
subscriptionPackageRoutes.post('/create/:companyIdParam', requireAuth, roleAuthorisation('users', 'create'), async (req, res) => {
    const { subscriptionPackages } = req.body;
    const newPkg = new subscriptionPackageMain(subscriptionPackages);
    await newPkg.save();
    return res.status(200).send({ success: true, status: 200 });
});
subscriptionPackageRoutes.get('/getall', requireAuth, roleAuthorisation('users', 'create'), async (req, res) => {
    const { companyId } = req.user;
    const subscriptionPackages = await subscriptionPackageLean
        .find({ companyId })
        .lean();
    return res.status(200).send(subscriptionPackages);
});
subscriptionPackageRoutes.put('/deleteone/:id', requireAuth, roleAuthorisation('users', 'delete'), async (req, res) => {
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
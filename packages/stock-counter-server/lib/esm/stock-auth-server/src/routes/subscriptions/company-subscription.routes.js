/* eslint-disable @typescript-eslint/no-misused-promises */
import { companySubscriptionLean, companySubscriptionMain } from '@open-stock/stock-auth-server/src/models/subscriptions/company-subscription.model';
import { offsetLimitRelegator, requireAuth, roleAuthorisation, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import { getLogger } from 'log4js';
import { userLean } from '../../models/user.model';
import { requireActiveCompany } from '../company-auth';
/** Logger for companySubscription routes */
const companySubscriptionRoutesLogger = getLogger('routes/companySubscriptionRoutes');
/**
 * Router for handling companySubscription-related routes.
 */
export const companySubscriptionRoutes = express.Router();
companySubscriptionRoutes.post('/subscribe/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('users', 'create'), async (req, res) => {
    const { companySubscription } = req.body;
    const newCompSub = new companySubscriptionMain(companySubscription);
    await newCompSub.save();
    return res.status(200).send({ success: true, status: 200 });
});
companySubscriptionRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const all = await Promise.all([
        companySubscriptionLean
            .find({ companyId: queryId })
            .populate({ path: 'user', model: userLean })
            .skip(offset)
            .limit(limit)
            .lean(),
        companySubscriptionLean.countDocuments({ companyId: queryId })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
companySubscriptionRoutes.put('/deleteone/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('users', 'delete'), async (req, res) => {
    const { id } = req.body;
    const { companyId } = req.user;
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
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
//# sourceMappingURL=company-subscription.routes.js.map
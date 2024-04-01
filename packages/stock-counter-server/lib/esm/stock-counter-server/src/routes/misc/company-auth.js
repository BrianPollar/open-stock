import { companySubscriptionLean } from '../../models/subscriptions/company-subscription.model';
export const requireCanUseFeature = (feature) => {
    return async (req, res, next) => {
        const { companyId } = req.user;
        const subsctn = await companySubscriptionLean.findOne({ companyId, active: true })
            .lean();
        if (!subsctn) {
            return res.status(401)
                .send('unauthorised');
        }
        const found = subsctn.features.find(val => val.name === feature);
        if (!found || found.limitSize === 0 || found.remainingSize === 0) {
            return res.status(401)
                .send('unauthorised');
        }
        return next();
    };
};
export const requireActiveCompany = (req, res, next) => {
    const { companyPermissions } = req.user;
    // no company
    if (companyPermissions && !companyPermissions.active) {
        return res.status(401)
            .send('unauthorised');
    }
    return next();
};
export const requireakeRecord = (feature) => {
    return async (req, res, next) => {
        const { companyId } = req.user;
        const subsctn = await companySubscriptionLean.findOneAndUpdate({ companyId, active: true });
        if (!subsctn) {
            return res.status(401)
                .send('unauthorised');
        }
        const features = subsctn.features;
        const foundIndex = features.findIndex(val => val.name === feature);
        features[foundIndex].remainingSize--;
        await subsctn.save();
        return next();
    };
};
//# sourceMappingURL=company-auth.js.map
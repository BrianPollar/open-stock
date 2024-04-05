/* eslint-disable @typescript-eslint/no-misused-promises */
import { offsetLimitRelegator } from '@open-stock/stock-universal-server';
import express from 'express';
import { createMockCompanySubscriptions } from '../../../../tests/stock-counter-mocks';
export const companySubscriptionRoutesDummy = express.Router();
companySubscriptionRoutesDummy.post('/subscribe/:companyIdParam', (req, res) => {
    return res.status(200).send({ success: true, status: 200 });
});
companySubscriptionRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    const { offset } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const companySubscriptions = createMockCompanySubscriptions(offset);
    const response = {
        count: req.params.limit,
        data: companySubscriptions
    };
    return res.status(200).send(response);
});
companySubscriptionRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=company-subscription.routes.js.map
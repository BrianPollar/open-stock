import express from 'express';
import { createMockReview, createMockReviews } from '../../../tests/stock-counter-mocks';
/**
 * Express router for review routes
 */
export const reviewRoutesDummy = express.Router();
reviewRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
reviewRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
    res.status(200).send(createMockReview());
});
reviewRoutesDummy.get('/getall/:id/:companyIdParam', (req, res) => {
    const response = {
        count: 10,
        data: createMockReviews(10)
    };
    res.status(200).send(response);
});
reviewRoutesDummy.delete('/deleteone/:id/:itemId/:rating/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=review.routes.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.faqRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const stock_counter_mocks_1 = require("../../../tests/stock-counter-mocks");
/**
 * Router for FAQ routes.
 */
exports.faqRoutesDummy = express_1.default.Router();
exports.faqRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.faqRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockFaq)());
});
exports.faqRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: (0, stock_counter_mocks_1.createMockFaqs)(Number(req.params.limit))
    };
    res.status(200).send(response);
});
exports.faqRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.faqRoutesDummy.post('/createans/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
exports.faqRoutesDummy.get('/getallans/:faqId/:companyIdParam', (req, res) => {
    res.status(200).send((0, stock_counter_mocks_1.createMockFaqAnswers)(10));
});
exports.faqRoutesDummy.delete('/deleteoneans/:id/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=faq.routes.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnOnValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const returnOnValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (errors.isEmpty()) {
        // in case request params meet the validation criteria
        return next();
    }
    res.status(422).json({ err: errors.array(), success: false });
};
exports.returnOnValidationErrors = returnOnValidationErrors;
//# sourceMappingURL=validator.js.map
import { validationResult } from 'express-validator';
export const returnOnValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        // in case request params meet the validation criteria
        return next();
    }
    res.status(422).json({ err: errors.array(), success: false });
};
//# sourceMappingURL=validator.js.map
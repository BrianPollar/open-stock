"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyMongooseErr = void 0;
/** */
const stringifyMongooseErr = (errors) => {
    const errorsStrArr = Object.keys(errors).map(key => {
        let err = '';
        if (errors[key].kind === 'unique') {
            err = errors[key].message;
        }
        else {
            err = key + ' ' + errors[key].message;
        }
        return err;
    });
    return errorsStrArr.join(', ');
};
exports.stringifyMongooseErr = stringifyMongooseErr;
//# sourceMappingURL=mongooseerrors.constant.js.map
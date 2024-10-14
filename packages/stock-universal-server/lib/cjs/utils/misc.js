"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUrId = exports.generateCustomIdFromObjectId = exports.isValidUrId = exports.checkDeletePermanentltVal = void 0;
const nanoid_1 = require("nanoid");
/**
 * Checks if a value is greater than 300.
 * This is used to check if a document should be deleted permanently.
 * @param val - The value to check.
 * @returns {boolean} - The result of the check.
 */
const checkDeletePermanentltVal = (val) => {
    return val > 300;
};
exports.checkDeletePermanentltVal = checkDeletePermanentltVal;
const isValidUrId = (urId) => {
    return urId.lastIndexOf('-') && Number(urId.slice(urId.lastIndexOf('-') + 1));
};
exports.isValidUrId = isValidUrId;
const generateCustomIdFromObjectId = (objectId, lastUrId) => {
    const idToStr = objectId.toString();
    const last4 = idToStr.slice(idToStr.length - 5);
    const indexOfDash = lastUrId.lastIndexOf('-');
    let increment = Number(lastUrId.slice(indexOfDash + 1));
    increment++;
    return last4 + '-' + increment;
};
exports.generateCustomIdFromObjectId = generateCustomIdFromObjectId;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateUrId = async (model, length = 10) => {
    const urId = (0, nanoid_1.nanoid)(length);
    const found = await model.findOne({ urId }).sort({ urId: -1 });
    if (found) {
        return (0, exports.generateUrId)(model, found.urId.length + 1);
    }
    return urId;
};
exports.generateUrId = generateUrId;
//# sourceMappingURL=misc.js.map
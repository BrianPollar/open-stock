"use strict";
// This function exports a function that relegates offset and limit values.
//
// **Parameters:**
//
// * `offset`: The offset value.
// * `limit`: The limit value.
//
// **Returns:**
//
// An object with the offset and limit values relegated.
Object.defineProperty(exports, "__esModule", { value: true });
exports.offsetLimitRelegator = void 0;
/**
 * Creates an offset-limit object with default values.
 * If the offset is 0, it is set to 0.
 * If the limit is 0, it is set to 10000.
 * @param offset - The offset value.
 * @param limit - The limit value.
 * @returns An object with offset and limit properties.
 */
const offsetLimitRelegator = (offset, limit) => {
    const numOffset = Number(offset);
    const numLimit = Number(limit);
    return {
        // If the offset is 0, then set it to 0.
        offset: (!numOffset || numOffset === 0) ? 0 : numOffset,
        // If the limit is 0, then set it to 10000.
        // TODO this will cause an error if the limit is greater than 10000 find an option
        limit: (!numLimit || numLimit === 0) ? 10000 : numLimit
    };
};
exports.offsetLimitRelegator = offsetLimitRelegator;
// **Comments:**
//
// * This function is used to relegate offset and limit values to a maximum of 10000.
// * This is done to prevent users from requesting too much data at once.
//# sourceMappingURL=offsetlimitrelegator.js.map
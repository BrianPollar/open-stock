"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseAuto = void 0;
/**
 * This abstract class defines the properties of a database auto object.
 */
class DatabaseAuto {
    /**
     * The constructor for the class.
     * @param data - The data object used to initialize the class properties.
     */
    constructor(data) {
        this._id = data._id;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}
exports.DatabaseAuto = DatabaseAuto;
//# sourceMappingURL=base.define.js.map
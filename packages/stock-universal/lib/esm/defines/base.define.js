/**
 * This abstract class defines the properties of a database auto object.
 */
export class DatabaseAuto {
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
//# sourceMappingURL=base.define.js.map
/**
 * This abstract class defines the properties of a database auto object.
 */
export abstract class DatabaseAuto {
  /**
   * The `_id` property is a unique identifier for the object.
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id?: string;

  /**
   * The `createdAt` property is the date and time the object was created.
   */
  createdAt?: Date;

  /**
   * The `updatedAt` property is the date and time the object was updated.
   */
  updatedAt?: Date;

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

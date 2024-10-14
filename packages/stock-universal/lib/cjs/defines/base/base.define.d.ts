import { ItrackEdit, ItrackView } from '../../types/general-types';
/**
 * This abstract class defines the properties of a database auto object.
 */
export declare abstract class DatabaseAuto {
    /**
     * The `_id` property is a unique identifier for the object.
     */
    _id: string;
    /**
     * The `createdAt` property is the date and time the object was created.
     */
    createdAt: Date;
    /**
     * The `updatedAt` property is the date and time the object was updated.
     */
    updatedAt: Date;
    trackEdit?: ItrackEdit;
    trackView?: ItrackView;
    /**
     * The constructor for the class.
     * @param data - The data object used to initialize the class properties.
     */
    constructor(data: any);
}

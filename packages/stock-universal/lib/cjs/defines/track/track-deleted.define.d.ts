import { ItrackDeleted } from '../../types/general-types';
import { Isuccess } from '../../types/return-types';
import { DatabaseAuto } from '../base/base.define';
import { IparentData } from './track-view.define';
export declare class TrackDeleted extends DatabaseAuto {
    parent: string | IparentData;
    deletedAt?: string;
    constructor(data: ItrackDeleted);
    /**
     * Get all trackDeleteds, paginated.
     *
     * @param offset - The offset from which to return the trackDeleteds.
     * @param limit - The maximum number of trackDeleteds to return.
     * @returns An object containing the total count of trackDeleteds and an array of the trackDeleteds.
     */
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        trackDeleteds: TrackDeleted[];
    }>;
    /**
     * Deletes a trackDeleted by id.
     *
     * @param _id - The id of the trackDeleted to delete.
     * @returns A boolean indicating whether the trackDeleted was successfully deleted.
     */
    static deleteOne(_id: string): Promise<Isuccess>;
}

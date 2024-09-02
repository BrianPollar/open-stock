import { ItrackEdit, Iuser, IuserActionTrack } from '../../interfaces/general.interface';
import { Isuccess } from '../../interfaces/return.interface';
import { DatabaseAuto } from '../base/base.define';
import { IparentData } from './track-view.define';
export declare class TrackEdit extends DatabaseAuto {
    parent: string | IparentData;
    createdBy: Iuser;
    users: IuserActionTrack[];
    deletedBy: Iuser;
    /**
     * Constructor for TrackEdit
     * @param data the data to initialize the TrackEdit object
     */
    constructor(data: ItrackEdit);
    /**
     * Get a track edit document by parent id
     * @param parent the parent id to query
     * @returns a TrackEdit object
     */
    static getByParent(parent: string): Promise<TrackEdit>;
    /**
     * Get track edits made by a user
     * @param userId the id of the user to query
     * @param offset the offset of the results to return
     * @param limit the maximum number of results to return
     * @returns a promise resolving to an object containing the count of all track edits made by the user and an array of track edits
     */
    static getByUser(userId: string, offset?: number, limit?: number): Promise<{
        count: number;
        trackEdits: TrackEdit[];
    }>;
    /**
     * Get all track edits
     * @param offset the offset of the results to return
     * @param limit the maximum number of results to return
     * @returns a promise resolving to an object containing the count of all track edits and an array of track edits
     */
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        trackEdits: TrackEdit[];
    }>;
    /**
     * Delete a track edit
     * @param id the id of the track edit to delete
     * @returns a promise resolving to an object containing a boolean indicating success
     */
    static deleteOne(id: string): Promise<Isuccess>;
}

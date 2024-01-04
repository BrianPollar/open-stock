import { Model } from 'mongoose';
import { IfileMeta } from '@open-stock/stock-universal';
/**
 * Represents the fileMeta model.
 */
export declare let fileMeta: Model<IfileMeta>;
/**
 * Represents the fileMetaLean variable.
 */
export declare let fileMetaLean: Model<IfileMeta>;
/**
 * Creates an file meta model with the given database URL, main flag, and lean flag.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the main email token model.
 * @param lean Whether to create the lean email token model.
 */
export declare const createFileMetaModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;

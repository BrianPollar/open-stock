import mongoose from 'mongoose';
/** */
export declare const makeNewConnection: (uri: string, coonType: any) => Promise<mongoose.Connection>;
/** */
export declare const disconnectMongoose: () => Promise<void>;

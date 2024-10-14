import { connectDatabase, isDbConnected, mainConnection, mainConnectionLean } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
const loginAtempsSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, index: true },
    ip: { type: String, index: true },
    successful: { type: Boolean, default: true }
}, { timestamps: true, collection: 'loginatempts' });
/**
 * Represents the login attempts model.
 */
export let loginAtempts;
/**
 * Represents a variable that holds a lean model of login attempts.
 */
export let loginAtemptsLean;
/**
 * Creates a login attempts model with the given database URL.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection model.
 * @param lean Whether to create the lean connection model.
 */
export const createLoginAtemptsModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!isDbConnected) {
        await connectDatabase(dbUrl, dbOptions);
    }
    if (main) {
        loginAtempts = mainConnection
            .model('loginAtempts', loginAtempsSchema);
    }
    if (lean) {
        loginAtemptsLean = mainConnectionLean
            .model('loginAtempts', loginAtempsSchema);
    }
};
//# sourceMappingURL=loginattemps.model.js.map
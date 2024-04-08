import { Schema } from 'mongoose';
import { connectAuthDatabase, isAuthDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const loginAtempsSchema = new Schema({
    userId: { type: String, index: true },
    ip: { type: String, index: true },
    successful: { type: Boolean, default: true }
}, { timestamps: true });
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
    if (!isAuthDbConnected) {
        await connectAuthDatabase(dbUrl, dbOptions);
    }
    if (main) {
        loginAtempts = mainConnection.model('loginAtempts', loginAtempsSchema);
    }
    if (lean) {
        loginAtemptsLean = mainConnectionLean.model('loginAtempts', loginAtempsSchema);
    }
};
//# sourceMappingURL=loginattemps.model.js.map
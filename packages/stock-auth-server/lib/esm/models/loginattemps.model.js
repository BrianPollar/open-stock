import { Schema } from 'mongoose';
import { connectAuthDatabase, isAuthDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const loginAtempsSchema = new Schema({
    userId: { type: String, index: true },
    ip: { type: String, index: true },
    successful: { type: Boolean, default: true }
}, { timestamps: true });
export let loginAtempts;
export let loginAtemptsLean;
/** */
export const createLoginAtemptsModel = async (dbUrl, main = true, lean = true) => {
    if (!isAuthDbConnected) {
        await connectAuthDatabase(dbUrl);
    }
    if (main) {
        loginAtempts = mainConnection.model('loginAtempts', loginAtempsSchema);
    }
    if (lean) {
        loginAtemptsLean = mainConnectionLean.model('loginAtempts', loginAtempsSchema);
    }
};
//# sourceMappingURL=loginattemps.model.js.map
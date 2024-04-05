"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIfAdmin = exports.login = exports.defineAdmin = void 0;
const log4js_1 = require("log4js");
const adminLogger = (0, log4js_1.getLogger)('controllers/AdminauthController');
/**
 * Defines an admin object with the name "admin" and sets its admin permissions for various actions.
 * @returns An admin object with the name "admin" and admin permissions for various actions.
 */
const defineAdmin = () => {
    return {
        name: 'admin',
        admin: true,
        permissions: {
            buyer: false,
            companyAdminAccess: true
        }
    };
};
exports.defineAdmin = defineAdmin;
/**
 * Takes a password and adminServerPasswd as parameters and returns a promise that resolves to an admin login response object.
 * It compares the provided password with the encrypted adminServerPasswd and returns success if they match.
 * @param password - The password to check against the encrypted adminServerPasswd.
 * @param adminServerPasswd - The encrypted admin password.
 * @returns A promise that resolves to an admin login response object.
 */
const login = (password, adminServerPasswd) => new Promise(resolve => {
    adminLogger.info('Admin login attempted');
    if (password !== adminServerPasswd) {
        adminLogger.error('Admin login err, wrong password');
        resolve({ success: false });
    }
    else if (password === adminServerPasswd) {
        adminLogger.info('Admin login success');
        resolve({
            success: true,
            user: (0, exports.defineAdmin)()
        });
    }
});
exports.login = login;
/**
 * Takes emailPhone, password, processadminID, and adminServerPasswd as parameters and returns a promise that resolves to an admin login response object.
 * It checks if the provided emailPhone matches the processadminID and then calls the login function to check the password.
 * @param emailPhone - The email or phone number of the admin user.
 * @param password - The password to check against the encrypted adminServerPasswd.
 * @param processadminID - The admin ID to check against the emailPhone.
 * @param adminServerPasswd - The encrypted admin password.
 * @returns A promise that resolves to an admin login response object.
 */
const checkIfAdmin = async (emailPhone, password, processadminId, adminServerPasswd) => {
    adminLogger.info('checking if admin');
    let response;
    if (emailPhone !== processadminId) {
        response = { success: false };
    }
    else if (emailPhone === processadminId) {
        response = await (0, exports.login)(password, adminServerPasswd);
    }
    else {
        response = { success: false };
    }
    adminLogger.debug('response for checkIfAdmin', response);
    return response;
};
exports.checkIfAdmin = checkIfAdmin;
//# sourceMappingURL=admin.controller.js.map
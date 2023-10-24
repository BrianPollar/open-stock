import { getLogger } from 'log4js';
const adminLogger = getLogger('controllers/AdminauthController');
/** defineAdmin  function defines an admin object with the name "admin" and sets its admin permissions for various actions.*/
export const defineAdmin = () => ({
    name: 'admin',
    admin: true,
    permissions: {
        orders: true,
        payments: true,
        users: true,
        items: true,
        faqs: true,
        videos: true,
        printables: true,
        buyer: false
    }
});
/** login  function takes a password and adminServerPasswd as parameters and returns a promise that resolves to an admin login response object. It compares the provided password with the encrypted adminServerPasswd and returns success if they match.*/
export const login = (password, adminServerPasswd) => new Promise(resolve => {
    adminLogger.info('Admin login attempted');
    if (password !== adminServerPasswd) {
        adminLogger.error('Admin login err, wrong password');
        resolve({ success: false });
    }
    else if (password === adminServerPasswd) {
        adminLogger.info('Admin login success');
        resolve({
            success: true,
            user: defineAdmin()
        });
    }
});
/** checkIfAdmin  function takes emailPhone, password, processadminID, and adminServerPasswd as parameters and returns a promise that resolves to an admin login response object. It checks if the provided emailPhone matches the processadminID and then calls the login function to check the password. */
export const checkIfAdmin = async (emailPhone, password, processadminID, adminServerPasswd) => {
    adminLogger.info('checking if admin');
    let response;
    if (emailPhone !== processadminID) {
        response = { success: false };
    }
    else if (emailPhone === processadminID) {
        response = await login(password, adminServerPasswd);
    }
    else {
        response = { success: false };
    }
    adminLogger.debug('response for checkIfAdmin', response);
    return response;
};
//# sourceMappingURL=admin.controller.js.map
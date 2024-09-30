"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCompanyBasedQuery = exports.makePredomFilter = void 0;
const verify_1 = require("../utils/verify");
/**
   * Makes a filter to be used in a query. The filter is as follows:
   * If the user is a superadmin, or if the user has the modifyDeleted permission,
   * then the filter is { isDeleted: true }.
   * Otherwise, the filter is { isDeleted: false }.
   * @param {Icustomrequest} req The request to use.
   * @returns {object} The filter to use in the query.
   */
const makePredomFilter = (req) => {
    const { superAdimPerms, companyId } = req.user || {};
    return {
        $or: [
            { isDeleted: Boolean(superAdimPerms?.modifyDeleted) || companyId === 'superAdmin' },
            { isDeleted: false }, { isDeleted: null }
        ]
    };
};
exports.makePredomFilter = makePredomFilter;
/**
   * Makes a filter to be used in a query. The filter is as follows:
   * If the user is a superadmin, or if the user has the modifyDeleted permission,
   * then the filter is { isDeleted: true }.
   * Otherwise, the filter is { isDeleted: false }.
   * If the user is a superadmin and the companyIdParam is 'all' or 'undefined',
   * then the filter is { companyId: 'superAdmin', ...makePredomFilter(req) }.
   * Otherwise, the filter is {  ...makePredomFilter(req) }.
   * @param {Icustomrequest} req The request to use.
   * @param {boolean} [usePramaId] (optional) Whether to use the companyIdParam as the queryId.
   * @returns {object} The filter to use in the query and whether the queryId is valid.
   */
const makeCompanyBasedQuery = (req, usePramaId = false) => {
    const { companyIdParam } = req.body || {};
    let queryId = companyIdParam;
    let filter;
    if (!usePramaId) {
        const { companyId, superAdimPerms } = req.user || {};
        queryId = Boolean(superAdimPerms?.byPassActiveCompany) ? companyIdParam : companyId;
        if (!superAdimPerms?.byPassActiveCompany) {
            queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
        }
        if ((companyId === 'superAdmin' || superAdimPerms?.byPassActiveCompany) &&
            (companyIdParam === 'all' || companyIdParam === 'undefined' || !companyIdParam)) {
            filter = {
                ...(0, exports.makePredomFilter)(req)
            };
        }
        else {
            filter = {
                ...(0, exports.makePredomFilter)(req)
            };
        }
    }
    else {
        filter = {
            ...(0, exports.makePredomFilter)(req)
        };
    }
    return {
        sucess: (0, verify_1.verifyObjectId)(queryId),
        filter
    };
};
exports.makeCompanyBasedQuery = makeCompanyBasedQuery;
//# sourceMappingURL=filter.js.map
import { verifyObjectId } from '../utils/verify';
/**
   * Makes a filter to be used in a query. The filter is as follows:
   * If the user is a superadmin, or if the user has the modifyDeleted permission,
   * then the filter is { isDeleted: true }.
   * Otherwise, the filter is { isDeleted: false }.
   * @param {Icustomrequest} req The request to use.
   * @returns {object} The filter to use in the query.
   */
export const makePredomFilter = (req) => {
    const { superAdimPerms, companyId } = req.user || {};
    return {
        $or: [{ isDeleted: Boolean(superAdimPerms?.modifyDeleted) || companyId === 'superAdmin' }, { isDeleted: false }, { isDeleted: null }]
    };
};
/**
   * Makes a filter to be used in a query. The filter is as follows:
   * If the user is a superadmin, or if the user has the modifyDeleted permission,
   * then the filter is { isDeleted: true }.
   * Otherwise, the filter is { isDeleted: false }.
   * If the user is a superadmin and the companyIdParam is 'all' or 'undefined',
   * then the filter is { companyId: 'superAdmin', ...makePredomFilter(req) }.
   * Otherwise, the filter is { companyId: queryId, ...makePredomFilter(req) }.
   * @param {Icustomrequest} req The request to use.
   * @param {boolean} [usePramaId] (optional) Whether to use the companyIdParam as the queryId.
   * @returns {object} The filter to use in the query and whether the queryId is valid.
   */
export const makeCompanyBasedQuery = (req, usePramaId = false) => {
    const { companyIdParam } = req.params || {};
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
                ...makePredomFilter(req)
            };
        }
        else {
            filter = {
                companyId: queryId,
                ...makePredomFilter(req)
            };
        }
    }
    else {
        filter = {
            companyId: queryId,
            ...makePredomFilter(req)
        };
    }
    return {
        sucess: verifyObjectId(queryId),
        filter
    };
};
//# sourceMappingURL=filter.js.map
/**
   * Makes a filter to be used in a query. The filter is as follows:
   * If the user is a superadmin, or if the user has the modifyDeleted permission,
   * then the filter is { isDeleted: true }.
   * Otherwise, the filter is { isDeleted: false }.
   * @param {Icustomrequest} req The request to use.
   * @returns {object} The filter to use in the query.
   */
export declare const makePredomFilter: (req: any) => {
    $or: {
        isDeleted: boolean;
    }[];
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
export declare const makeCompanyBasedQuery: (req: any, usePramaId?: boolean) => {
    sucess: boolean;
    filter: any;
};

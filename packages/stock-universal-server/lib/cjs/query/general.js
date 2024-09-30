"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructFiltersFromBody = exports.lookupTrackView = exports.lookupTrackEdit = exports.lookupSubFieldItemsRelatedFilter = exports.lookupSubFieldUserFilter = exports.lookupSubFieldPaymentRelatedFilter = exports.lookupSubFieldInvoiceRelatedFilter = exports.lookupSort = exports.lookupLimit = exports.lookupOffset = exports.matchAllFields = exports.lookupCoverPic = exports.lookupProfilePic = exports.lookupItems = exports.lookupBillingUser = exports.lookupPaymentRelated = exports.lookupInvoiceRelated = exports.lookupPayments = exports.lookupUser = exports.lookupPhotos = exports.matchUser = exports.matchCompany = void 0;
const filter_1 = require("./filter");
/**
   * Returns a MongoDB aggregation pipeline that adds a field "companyId" that is converted
   * from a string to an ObjectId, and then matches the documents where the "companyId" field is equal to the given id.
   * @param _id the id to match
   * @returns a MongoDB aggregation pipeline.
   */
const matchCompany = (id) => {
    return [
        {
            $addFields: {
                companyId: { $toObjectId: '$companyId' }
            }
        },
        {
            $match: { companyId: { $eq: id } }
        }
    ];
};
exports.matchCompany = matchCompany;
/**
   * Returns a MongoDB aggregation pipeline that adds a field "userId" that is converted
   * from a string to an ObjectId, and then matches the documents where the "userId" field is equal to the given id.
   * @param _id the id to match
   * @returns a MongoDB aggregation pipeline
   */
const matchUser = (id) => {
    return [
        {
            $addFields: {
                userId: { $toObjectId: '$userId' }
            }
        },
        {
            $match: { userId: { $eq: id } }
        }
    ];
};
exports.matchUser = matchUser;
/**
   * Returns a MongoDB aggregation pipeline that adds a field "photos" that is converted
   * from a string to an ObjectId, and then performs a lookup on the "filemetas" collection to
   * populate the field with the actual documents.
   * @returns a MongoDB aggregation pipeline.
   */
const lookupPhotos = () => {
    return [
        {
            $addFields: {
                photos: { $toObjectId: '$photos' }
            }
        },
        {
            $lookup: {
                from: 'filemetas',
                localField: 'photos',
                foreignField: '_id',
                as: 'photos'
            }
        }
    ];
};
exports.lookupPhotos = lookupPhotos;
/**
   * Returns a MongoDB aggregation pipeline that adds a field "user" that is converted f
   * rom a string to an ObjectId, and then performs a lookup on the "users" collection to populate the
   * field with the actual documents. The pipeline also includes a lookup on the "photos" field to populate
   * the photos field with the actual documents.
   * @returns a MongoDB aggregation pipeline.
   */
const lookupUser = () => {
    return [
        {
            $addFields: {
                user: { $toObjectId: '$user' }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
                pipeline: [
                    ...(0, exports.lookupPhotos)()
                ]
            }
        },
        {
            $unwind: {
                path: '$user',
                preserveNullAndEmptyArrays: true
            }
        }
    ];
};
exports.lookupUser = lookupUser;
/**
   * Returns a MongoDB aggregation pipeline that adds a field "payments" that is populated f
   * rom the "receipts" collection.
   * @returns a MongoDB aggregation pipeline.
   */
const lookupPayments = () => {
    return [
        {
            $lookup: {
                from: 'receipts',
                localField: 'payments',
                foreignField: '_id',
                as: 'payments',
                pipeline: []
            }
        }
    ];
};
exports.lookupPayments = lookupPayments;
/**
   * Returns a MongoDB aggregation pipeline that adds a field "invoiceRelated" that is populated
   * from the "invoicerelateds" collection.
   * The pipeline includes a lookup on the "payments" field to populate it with the
   * actual documents, and a lookup on the "billingUser" field to populate it with the actual documents.
   * @returns a MongoDB aggregation pipeline.
   */
const lookupInvoiceRelated = () => {
    return [
        {
            $addFields: {
                invoiceRelated: { $toObjectId: '$invoiceRelated' } // convert to object id for lookup
            }
        },
        {
            $lookup: {
                from: 'invoicerelateds',
                localField: 'invoiceRelated',
                foreignField: '_id',
                as: 'invoiceRelated',
                pipeline: [
                    ...(0, exports.lookupPayments)(),
                    ...(0, exports.lookupBillingUser)()
                ]
            }
        },
        {
            $unwind: {
                path: '$invoiceRelated',
                preserveNullAndEmptyArrays: true
            }
        }
    ];
};
exports.lookupInvoiceRelated = lookupInvoiceRelated;
/**
   * Returns a MongoDB aggregation pipeline that adds a field "paymentRelated"
   * that is populated from the "paymentrelateds" collection.
   * The pipeline includes a lookup on the "items" field to populate it with the actual
   * documents, and a lookup on the "user" field to populate it with the actual documents.
   * @returns a MongoDB aggregation pipeline.
   */
const lookupPaymentRelated = () => {
    return [
        {
            $addFields: {
                paymentRelated: { $toObjectId: '$paymentRelated' } // convert to object id for lookup
            }
        },
        {
            $lookup: {
                from: 'paymentrelateds',
                localField: 'paymentRelated',
                foreignField: '_id',
                as: 'paymentRelated',
                pipeline: [
                    ...(0, exports.lookupItems)(),
                    ...(0, exports.lookupUser)()
                ]
            }
        },
        { $unwind: { path: '$paymentRelated',
                preserveNullAndEmptyArrays: true
            }
        }
    ];
};
exports.lookupPaymentRelated = lookupPaymentRelated;
/**
   * Returns a MongoDB aggregation pipeline that adds a field "billingUserId"
   * that is populated from the "users" collection.
   * @returns a MongoDB aggregation pipeline.
   */
const lookupBillingUser = () => {
    return [
        {
            $addFields: {
                billingUserId: { $toObjectId: '$billingUserId' }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'billingUserId',
                foreignField: '_id',
                as: 'billingUserId'
            }
        },
        {
            $unwind: {
                path: '$billingUserId',
                preserveNullAndEmptyArrays: true
            }
        }
    ];
};
exports.lookupBillingUser = lookupBillingUser;
const lookupItems = () => {
    return [
        {
            $addFields: {
                items: { $toObjectId: '$items' }
            }
        },
        {
            $lookup: {
                from: 'items',
                localField: 'items',
                foreignField: '_id',
                as: 'items',
                pipeline: [
                    ...(0, exports.lookupPhotos)()
                ]
            }
        }
    ];
};
exports.lookupItems = lookupItems;
const lookupProfilePic = () => {
    return [];
};
exports.lookupProfilePic = lookupProfilePic;
const lookupCoverPic = () => {
    return [];
};
exports.lookupCoverPic = lookupCoverPic;
const matchAllFields = () => {
};
exports.matchAllFields = matchAllFields;
const lookupOffset = (offset) => {
    return [{
            $skip: offset
        }];
};
exports.lookupOffset = lookupOffset;
const lookupLimit = (limit) => {
    return [{
            $limit: limit
        }];
};
exports.lookupLimit = lookupLimit;
const lookupSort = (sort) => {
    if (!sort || !sort.length) {
        return [];
    }
    const toObject = sort.reduce((acc, obj) => {
        const key0 = Object.keys(obj)[0];
        const value = Object.values(obj)[0] === 'desc' ? -1 : 1;
        acc[key0] = value;
        return acc;
    }, {});
    return [{
            $sort: toObject
        }];
};
exports.lookupSort = lookupSort;
// filters sub field based on $and
const lookupSubFieldInvoiceRelatedFilter = (filter, sort, offset, limit) => {
    return [
        {
            $addFields: {
                invoiceRelated: { $toObjectId: '$invoiceRelated' }
            }
        },
        {
            $lookup: {
                from: 'invoicerelateds',
                as: 'invoiceRelated',
                let: { invoiceRelated: '$invoiceRelated' },
                pipeline: [
                    {
                        $match: {
                            $and: [
                                { $expr: { $eq: ['$$invoiceRelated', '$_id'] } },
                                // { status: 'pending' },
                                ...filter
                            ]
                        }
                    },
                    { $limit: 1 },
                    {
                        $addFields: {
                            billingUserId: { $toObjectId: '$billingUserId' }
                        }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'billingUserId',
                            foreignField: '_id',
                            as: 'billingUserId'
                        }
                    },
                    {
                        $unwind: {
                            path: '$billingUserId',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    ...(0, exports.lookupPayments)()
                ]
            }
        },
        ...(0, exports.lookupTrackEdit)(),
        ...(0, exports.lookupTrackView)(),
        { $match: { invoiceRelated: { $ne: [] } } },
        {
            $addFields: {
                invoiceRelated: { $arrayElemAt: ['$invoiceRelated', 0] }
            }
        },
        {
            $facet: {
                data: [...(0, exports.lookupSort)(sort), ...(0, exports.lookupOffset)(offset), ...(0, exports.lookupLimit)(limit)],
                total: [{ $count: 'count' }]
            }
        },
        {
            $unwind: {
                path: '$total',
                preserveNullAndEmptyArrays: true
            }
        }
    ];
};
exports.lookupSubFieldInvoiceRelatedFilter = lookupSubFieldInvoiceRelatedFilter;
const lookupSubFieldPaymentRelatedFilter = (filter, sort, offset, limit) => {
    return [
        {
            $addFields: {
                paymentRelated: { $toObjectId: '$paymentRelated' }
            }
        },
        {
            $lookup: {
                from: 'paymentrelateds',
                as: 'paymentRelated',
                let: { paymentRelated: '$paymentRelated' },
                pipeline: [
                    {
                        $match: {
                            $and: [
                                { $expr: { $eq: ['$$paymentRelated', '$_id'] } },
                                // { status: 'pending' }
                                ...filter
                            ]
                        }
                    },
                    { $limit: 1 },
                    {
                        $addFields: {
                            billingUserId: { $toObjectId: '$billingUserId' }
                        }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'billingUserId',
                            foreignField: '_id',
                            as: 'billingUserId'
                        }
                    },
                    {
                        $unwind: {
                            path: '$billingUserId',
                            preserveNullAndEmptyArrays: true
                        }
                    }
                ]
            }
        },
        ...(0, exports.lookupTrackEdit)(),
        ...(0, exports.lookupTrackView)(),
        { $match: { paymentRelated: { $ne: [] } } },
        {
            $addFields: {
                paymentRelated: { $arrayElemAt: ['$paymentRelated', 0] }
            }
        },
        {
            $facet: {
                data: [...(0, exports.lookupSort)(sort), ...(0, exports.lookupOffset)(offset), ...(0, exports.lookupLimit)(limit)],
                total: [{ $count: 'count' }]
            }
        },
        {
            $unwind: {
                path: '$total',
                preserveNullAndEmptyArrays: true
            }
        }
    ];
};
exports.lookupSubFieldPaymentRelatedFilter = lookupSubFieldPaymentRelatedFilter;
const lookupSubFieldUserFilter = (filter, sort, offset, limit) => {
    return [
        {
            $addFields: {
                user: { $toObjectId: '$user' }
            }
        },
        {
            $lookup: {
                from: 'users',
                as: 'user',
                let: { user: '$user' },
                pipeline: [
                    {
                        $match: {
                            $and: [
                                { $expr: { $eq: ['$$user', '$_id'] } },
                                // { status: 'pending' }
                                ...filter
                            ]
                        }
                    },
                    { $limit: 1 },
                    ...(0, exports.lookupPhotos)()
                ]
            }
        },
        ...(0, exports.lookupTrackEdit)(),
        ...(0, exports.lookupTrackView)(),
        { $match: { paymentRelated: { $ne: [] } } },
        {
            $addFields: {
                user: { $arrayElemAt: ['$user', 0] }
            }
        },
        {
            $facet: {
                data: [...(0, exports.lookupSort)(sort), ...(0, exports.lookupOffset)(offset), ...(0, exports.lookupLimit)(limit)],
                total: [{ $count: 'count' }]
            }
        },
        {
            $unwind: {
                path: '$total',
                preserveNullAndEmptyArrays: true
            }
        }
    ];
};
exports.lookupSubFieldUserFilter = lookupSubFieldUserFilter;
const lookupSubFieldItemsRelatedFilter = (filter, sort, offset, limit) => {
    return [
        {
            $addFields: {
                items: { $toObjectId: '$items' }
            }
        },
        {
            $lookup: {
                from: 'items',
                as: 'items',
                let: { items: '$items' },
                pipeline: [
                    {
                        $match: {
                            $and: [
                                { $expr: { $eq: ['$$items', '$_id'] } },
                                // { status: 'pending' }
                                ...filter
                            ]
                        }
                    }
                    // { $limit: 1 },
                ]
            }
        },
        ...(0, exports.lookupTrackEdit)(),
        ...(0, exports.lookupTrackView)(),
        { $match: { items: { $ne: [] } } },
        /* {
          $addFields: {
            paymentRelated: { $arrayElemAt: ['$paymentRelated', 0] }
          }
        }, */
        {
            $facet: {
                data: [...(0, exports.lookupSort)(sort), ...(0, exports.lookupOffset)(offset), ...(0, exports.lookupLimit)(limit)],
                total: [{ $count: 'count' }]
            }
        },
        {
            $unwind: {
                path: '$total',
                preserveNullAndEmptyArrays: true
            }
        }
    ];
};
exports.lookupSubFieldItemsRelatedFilter = lookupSubFieldItemsRelatedFilter;
const lookupTrackEdit = () => {
    return [
        {
            $addFields: {
                trackEdit: { $toObjectId: '$trackEdit' }
            }
        },
        {
            $lookup: {
                from: 'trackedits',
                localField: 'trackEdit',
                foreignField: '_id',
                as: 'trackEdit'
            }
        },
        {
            $unwind: {
                path: '$trackEdit',
                preserveNullAndEmptyArrays: true
            }
        }
    ];
};
exports.lookupTrackEdit = lookupTrackEdit;
const lookupTrackView = () => {
    return [
        {
            $addFields: {
                trackView: { $toObjectId: '$trackView' }
            }
        },
        {
            $lookup: {
                from: 'trackviews',
                localField: 'trackView',
                foreignField: '_id',
                as: 'trackView'
            }
        },
        {
            $unwind: {
                path: '$trackView',
                preserveNullAndEmptyArrays: true
            }
        }
    ];
};
exports.lookupTrackView = lookupTrackView;
/*
db.items.aggregate<IfilterAggResponse<soth>>([
  {
    $addFields: {
      companyId: { $toObjectId: '$companyId' }
    }
  },
  {
    $lookup: {
      from: 'companies',
      localField: 'companyId',
      foreignField: '_id',
      as: 'inventory_docs',
      pipeline: [
        {
          $addFields: {
            owner: { $toObjectId: '$owner' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'owner',
            foreignField: '_id',
            as: 'owner'
          }
        },
        {
          $set: {
            owner: { $arrayElemAt: ['$owner', 0] }
          }
        }
      ]
    }
  },
  {
    $set: {
      inventory_docs2: { $arrayElemAt: ['$inventory_docs.str', 0] }
    }
  }
]);

*/
const constructFiltersFromBody = (req, preferPredom = false, subProps) => {
    const { searchterm, searchKey, propFilter, comparisonFilter } = req.body;
    let filter;
    if (preferPredom) {
        filter = (0, filter_1.makePredomFilter)(req);
    }
    else {
        const prop = (0, filter_1.makeCompanyBasedQuery)(req);
        filter = prop.filter;
    }
    const filteredPropFilter = propFilter.filter(val => subProps.includes(val.prop));
    const filtererdComparisonFilters = comparisonFilter.filter(val => subProps.includes(val.name));
    let filters3 = [{ filter }];
    if (searchterm && searchKey) {
        filters3 = [...filters3, { [searchKey]: { $regex: searchterm, $options: 'i' } }];
    }
    if (filteredPropFilter && filteredPropFilter.length > 0) {
        filters3 = [...filters3, ...filteredPropFilter];
    }
    if (filtererdComparisonFilters && filtererdComparisonFilters.length > 0) {
        const compFil = filtererdComparisonFilters.map(val => {
            return {
                [val.name]: { ['$' + val.direction]: val.value }
            };
        });
        filters3 = [...filters3, ...compFil];
    }
    return filters3;
};
exports.constructFiltersFromBody = constructFiltersFromBody;
//# sourceMappingURL=general.js.map
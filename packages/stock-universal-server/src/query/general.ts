import { IcustomRequest, IfilterProps, IpropFilter, IpropSort } from '@open-stock/stock-universal';
import { PipelineStage } from 'mongoose';
import { makeCompanyBasedQuery, makePredomFilter } from './filter';


/**
   * Returns a MongoDB aggregation pipeline that adds a field "companyId" that is converted
   * from a string to an ObjectId, and then matches the documents where the "companyId" field is equal to the given id.
   * @param _id the id to match
   * @returns a MongoDB aggregation pipeline.
   */
export const matchCompany = (id: string): PipelineStage[] => {
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


/**
   * Returns a MongoDB aggregation pipeline that adds a field "userId" that is converted
   * from a string to an ObjectId, and then matches the documents where the "userId" field is equal to the given id.
   * @param _id the id to match
   * @returns a MongoDB aggregation pipeline
   */
export const matchUser = (id: string): PipelineStage[] => {
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


/**
   * Returns a MongoDB aggregation pipeline that adds a field "photos" that is converted
   * from a string to an ObjectId, and then performs a lookup on the "filemetas" collection to
   * populate the field with the actual documents.
   * @returns a MongoDB aggregation pipeline.
   */
export const lookupPhotos = () => {
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


/**
   * Returns a MongoDB aggregation pipeline that adds a field "user" that is converted f
   * rom a string to an ObjectId, and then performs a lookup on the "users" collection to populate the
   * field with the actual documents. The pipeline also includes a lookup on the "photos" field to populate
   * the photos field with the actual documents.
   * @returns a MongoDB aggregation pipeline.
   */
export const lookupUser = () => {
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
          ...lookupPhotos()
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

/**
   * Returns a MongoDB aggregation pipeline that adds a field "payments" that is populated f
   * rom the "receipts" collection.
   * @returns a MongoDB aggregation pipeline.
   */
export const lookupPayments = () => {
  return [
    {
      $lookup: {
        from: 'receipts',
        localField: 'payments',
        foreignField: '_id',
        as: 'payments',
        pipeline: [
        ]
      }
    }
  ];
};

/**
   * Returns a MongoDB aggregation pipeline that adds a field "invoiceRelated" that is populated
   * from the "invoicerelateds" collection.
   * The pipeline includes a lookup on the "payments" field to populate it with the
   * actual documents, and a lookup on the "billingUser" field to populate it with the actual documents.
   * @returns a MongoDB aggregation pipeline.
   */
export const lookupInvoiceRelated = () => {
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
          ...lookupPayments(),
          ...lookupBillingUser()
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

/**
   * Returns a MongoDB aggregation pipeline that adds a field "paymentRelated"
   * that is populated from the "paymentrelateds" collection.
   * The pipeline includes a lookup on the "items" field to populate it with the actual
   * documents, and a lookup on the "user" field to populate it with the actual documents.
   * @returns a MongoDB aggregation pipeline.
   */
export const lookupPaymentRelated = (): PipelineStage[] => {
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
          ...lookupItems(),
          ...lookupUser()
        ]
      }
    },
    { $unwind:
      { path: '$paymentRelated',
        preserveNullAndEmptyArrays: true
      }
    }
  ];
};

/**
   * Returns a MongoDB aggregation pipeline that adds a field "billingUserId"
   * that is populated from the "users" collection.
   * @returns a MongoDB aggregation pipeline.
   */
export const lookupBillingUser = (): PipelineStage[] => {
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

export const lookupItems = () => {
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
          ...lookupPhotos()
        ]
      }
    }
  ];
};

export const lookupProfilePic = (): PipelineStage[] => {
  return [];
};

export const lookupCoverPic = (): PipelineStage[] => {
  return [];
};

export const matchAllFields = () => {

};

export const lookupOffset = (offset: number) => {
  return [{
    $skip: offset
  }];
};

export const lookupLimit = (limit: number) => {
  return [{
    $limit: limit
  }];
};


export const lookupSort = (sort?: IpropSort) => {
  if (!sort) {
    return [];
  }

  const keys = Object.keys(sort);
  const toObject = keys.reduce((acc, obj) => {
    const value = Object.values(sort)[0] === 'desc' ? -1 : 1;

    acc[obj] = value;

    return acc;
  }, {} as { [key: string]: 1 | -1 });

  /* const toObject = sort.reduce((acc, obj) => {
    const key0 = Object.keys(obj)[0];
    const value = Object.values(obj)[0] === 'desc' ? -1 : 1;

    acc[key0] = value;

    return acc;
  }, {} as { [key: string]: 1 | -1 }); */

  return [{
    $sort: toObject
  }];
};

// filters sub field based on $and
export const lookupSubFieldInvoiceRelatedFilter = (
  filter: IpropFilter[],
  offset: number,
  limit: number,
  sort?: IpropSort,
  returnEmptyArr = false
): PipelineStage[] => {
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
          ...lookupPayments()
        ]
      }
    },
    ...lookupTrackEdit(),
    ...lookupTrackView(),
    { $match: { invoiceRelated: { $ne: [] } } },
    {
      $addFields: {
        invoiceRelated: { $arrayElemAt: ['$invoiceRelated', 0] }
      }
    },
    ...lookupFacet(offset, limit, sort, returnEmptyArr)
  ];
};

export const lookupSubFieldPaymentRelatedFilter = (
  filter: IpropFilter[],
  offset: number,
  limit: number,
  sort?: IpropSort,
  returnEmptyArr = false
): PipelineStage[] => {
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
    ...lookupTrackEdit(),
    ...lookupTrackView(),
    { $match: { paymentRelated: { $ne: [] } } },
    {
      $addFields: {
        paymentRelated: { $arrayElemAt: ['$paymentRelated', 0] }
      }
    },
    ...lookupFacet(offset, limit, sort, returnEmptyArr)
  ];
};


export const lookupSubFieldUserFilter = (
  filter: IpropFilter[],
  offset: number,
  limit: number,
  sort?: IpropSort,
  returnEmptyArr = false
): PipelineStage[] => {
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
          ...lookupPhotos()
        ]
      }
    },
    ...lookupTrackEdit(),
    ...lookupTrackView(),
    { $match: { paymentRelated: { $ne: [] } } },
    {
      $addFields: {
        user: { $arrayElemAt: ['$user', 0] }
      }
    },
    ...lookupFacet(offset, limit, sort, returnEmptyArr)
  ];
};


export const lookupSubFieldItemsRelatedFilter = (
  filter: IpropFilter[],
  offset: number,
  limit: number,
  sort?: IpropSort,
  returnEmptyArr = false
): PipelineStage[] => {
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
    ...lookupTrackEdit(),
    ...lookupTrackView(),
    { $match: { items: { $ne: [] } } },

    /* {
      $addFields: {
        paymentRelated: { $arrayElemAt: ['$paymentRelated', 0] }
      }
    }, */
    ...lookupFacet(offset, limit, sort, returnEmptyArr)
  ];
};


export const lookupFacet = (
  offset: number,
  limit: number,
  propSort?: IpropSort,
  returnEmptyArr = false
): PipelineStage[] => {
  return [
    {
      $facet: {
        data: returnEmptyArr ? [] : [...lookupSort(propSort), ...lookupOffset(offset), ...lookupLimit(limit)],
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

export const lookupTrackEdit = () => {
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

export const lookupTrackView = (): PipelineStage[] => {
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


export const constructFiltersFromBody = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: IcustomRequest<any, IfilterProps>,
  preferPredom = false,
  subProps?: string[]
) => {
  const { searchterm, searchKey, comparisonFilter, propFilter } = req.body;
  let filter;

  if (preferPredom) {
    filter = makePredomFilter(req);
  } else {
    const prop = makeCompanyBasedQuery(req);

    filter = prop.filter;
  }

  let filters3: unknown[] = [{ filter }];

  if (searchterm && searchKey) {
    filters3 = [ { [searchKey]: { $regex: searchterm, $options: 'i' } }, ...filters3 ];
  }

  if (propFilter) {
    const propFilterKeys = Object.keys(propFilter);

    for (const key of propFilterKeys) {
      if (subProps && !subProps.includes(key)) {
        delete propFilter[key];
      // check if the property value is of type array
      } else if (Array.isArray(propFilter[key])) {
        if (!propFilter[key] || (propFilter[key] as string[])?.length < 1) {
          delete propFilter[key];
        } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
          propFilter[key] = { $in: propFilter[key] } as any;
        }
      }
    }

    if (propFilterKeys && propFilterKeys.length > 0) {
      filters3 = [ propFilter, ...filters3 ];
    }
  }

  /* const comparisonFilterKeys = Object.keys(comparisonFilter);

  for (const key of comparisonFilterKeys) {
    if (subProps && !subProps.includes(key)) {
      delete comparisonFilter[key];
    }
  } */

  // const filteredPropFilter = propFilter.filter(val => subProps.includes(val.prop));


  if (comparisonFilter) {
    const filtererdComparisonFilters = comparisonFilter
      .filter(val => (subProps ? subProps
        .includes(val.field) && filedValues.includes(val.operator) && val.fieldValue : true));


    if (filtererdComparisonFilters && filtererdComparisonFilters.length > 0) {
      const compFil = filtererdComparisonFilters.map(val => {
        return {
          [val.field]: { ['$' + val.operator]: val.fieldValue }
        };
      });

      filters3 = [ ...compFil, ...filters3 ];
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return filters3 as any[];
};


const filedValues = ['eq', 'gt', 'gte', 'lt', 'lte'];

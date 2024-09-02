

/**
   * Returns a MongoDB aggregation pipeline that adds a field "companyId" that is converted from a string to an ObjectId, and then matches the documents where the "companyId" field is equal to the given id.
   * @param id the id to match
   * @returns a MongoDB aggregation pipeline.
   */
export const matchCompany = (id: string) => {
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
   * Returns a MongoDB aggregation pipeline that adds a field "userId" that is converted from a string to an ObjectId, and then matches the documents where the "userId" field is equal to the given id.
   * @param id the id to match
   * @returns a MongoDB aggregation pipeline
   */
export const matchUser = (id: string) => {
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
   * Returns a MongoDB aggregation pipeline that adds a field "photos" that is converted from a string to an ObjectId, and then performs a lookup on the "filemetas" collection to populate the field with the actual documents.
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
   * Returns a MongoDB aggregation pipeline that adds a field "user" that is converted from a string to an ObjectId, and then performs a lookup on the "users" collection to populate the field with the actual documents. The pipeline also includes a lookup on the "photos" field to populate the photos field with the actual documents.
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
    { $unwind: '$user' }
  ];
};

/**
   * Returns a MongoDB aggregation pipeline that adds a field "payments" that is populated from the "receipts" collection.
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
   * Returns a MongoDB aggregation pipeline that adds a field "invoiceRelated" that is populated from the "invoicerelateds" collection.
   * The pipeline includes a lookup on the "payments" field to populate it with the actual documents, and a lookup on the "billingUser" field to populate it with the actual documents.
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
    { $unwind: '$invoiceRelated' }
  ];
};

/**
   * Returns a MongoDB aggregation pipeline that adds a field "paymentRelated" that is populated from the "paymentrelateds" collection.
   * The pipeline includes a lookup on the "items" field to populate it with the actual documents, and a lookup on the "user" field to populate it with the actual documents.
   * @returns a MongoDB aggregation pipeline.
   */
export const lookupPaymentRelated = () => {
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
    { $unwind: '$paymentRelated' }
  ];
};

/**
   * Returns a MongoDB aggregation pipeline that adds a field "billingUserId" that is populated from the "users" collection.
   * @returns a MongoDB aggregation pipeline.
   */
export const lookupBillingUser = () => {
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
    { $unwind: '$user' }
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

export const lookupProfilePic = () => {
  return [{}];
};

export const lookupCoverPic = () => {
  return [{}];
};

export const matchAllFields = () => {

};

/*
db.items.aggregate([
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

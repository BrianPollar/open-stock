/**
   * Returns a MongoDB aggregation pipeline that adds a field "companyId" that is converted from a string to an ObjectId, and then matches the documents where the "companyId" field is equal to the given id.
   * @param id the id to match
   * @returns a MongoDB aggregation pipeline.
   */
export declare const matchCompany: (id: string) => ({
    $addFields: {
        companyId: {
            $toObjectId: string;
        };
    };
    $match?: undefined;
} | {
    $match: {
        companyId: {
            $eq: string;
        };
    };
    $addFields?: undefined;
})[];
/**
   * Returns a MongoDB aggregation pipeline that adds a field "userId" that is converted from a string to an ObjectId, and then matches the documents where the "userId" field is equal to the given id.
   * @param id the id to match
   * @returns a MongoDB aggregation pipeline
   */
export declare const matchUser: (id: string) => ({
    $addFields: {
        userId: {
            $toObjectId: string;
        };
    };
    $match?: undefined;
} | {
    $match: {
        userId: {
            $eq: string;
        };
    };
    $addFields?: undefined;
})[];
/**
   * Returns a MongoDB aggregation pipeline that adds a field "photos" that is converted from a string to an ObjectId, and then performs a lookup on the "filemetas" collection to populate the field with the actual documents.
   * @returns a MongoDB aggregation pipeline.
   */
export declare const lookupPhotos: () => ({
    $addFields: {
        photos: {
            $toObjectId: string;
        };
    };
    $lookup?: undefined;
} | {
    $lookup: {
        from: string;
        localField: string;
        foreignField: string;
        as: string;
    };
    $addFields?: undefined;
})[];
/**
   * Returns a MongoDB aggregation pipeline that adds a field "user" that is converted from a string to an ObjectId, and then performs a lookup on the "users" collection to populate the field with the actual documents. The pipeline also includes a lookup on the "photos" field to populate the photos field with the actual documents.
   * @returns a MongoDB aggregation pipeline.
   */
export declare const lookupUser: () => ({
    $addFields: {
        user: {
            $toObjectId: string;
        };
    };
    $lookup?: undefined;
    $unwind?: undefined;
} | {
    $lookup: {
        from: string;
        localField: string;
        foreignField: string;
        as: string;
        pipeline: ({
            $addFields: {
                photos: {
                    $toObjectId: string;
                };
            };
            $lookup?: undefined;
        } | {
            $lookup: {
                from: string;
                localField: string;
                foreignField: string;
                as: string;
            };
            $addFields?: undefined;
        })[];
    };
    $addFields?: undefined;
    $unwind?: undefined;
} | {
    $unwind: string;
    $addFields?: undefined;
    $lookup?: undefined;
})[];
/**
   * Returns a MongoDB aggregation pipeline that adds a field "payments" that is populated from the "receipts" collection.
   * @returns a MongoDB aggregation pipeline.
   */
export declare const lookupPayments: () => {
    $lookup: {
        from: string;
        localField: string;
        foreignField: string;
        as: string;
        pipeline: any[];
    };
}[];
/**
   * Returns a MongoDB aggregation pipeline that adds a field "invoiceRelated" that is populated from the "invoicerelateds" collection.
   * The pipeline includes a lookup on the "payments" field to populate it with the actual documents, and a lookup on the "billingUser" field to populate it with the actual documents.
   * @returns a MongoDB aggregation pipeline.
   */
export declare const lookupInvoiceRelated: () => ({
    $addFields: {
        invoiceRelated: {
            $toObjectId: string;
        };
    };
    $lookup?: undefined;
    $unwind?: undefined;
} | {
    $lookup: {
        from: string;
        localField: string;
        foreignField: string;
        as: string;
        pipeline: ({
            $lookup: {
                from: string;
                localField: string;
                foreignField: string;
                as: string;
                pipeline: any[];
            };
        } | {
            $addFields: {
                billingUserId: {
                    $toObjectId: string;
                };
            };
            $lookup?: undefined;
            $unwind?: undefined;
        } | {
            $lookup: {
                from: string;
                localField: string;
                foreignField: string;
                as: string;
            };
            $addFields?: undefined;
            $unwind?: undefined;
        } | {
            $unwind: string;
            $addFields?: undefined;
            $lookup?: undefined;
        })[];
    };
    $addFields?: undefined;
    $unwind?: undefined;
} | {
    $unwind: string;
    $addFields?: undefined;
    $lookup?: undefined;
})[];
/**
   * Returns a MongoDB aggregation pipeline that adds a field "paymentRelated" that is populated from the "paymentrelateds" collection.
   * The pipeline includes a lookup on the "items" field to populate it with the actual documents, and a lookup on the "user" field to populate it with the actual documents.
   * @returns a MongoDB aggregation pipeline.
   */
export declare const lookupPaymentRelated: () => ({
    $addFields: {
        paymentRelated: {
            $toObjectId: string;
        };
    };
    $lookup?: undefined;
    $unwind?: undefined;
} | {
    $lookup: {
        from: string;
        localField: string;
        foreignField: string;
        as: string;
        pipeline: ({
            $addFields: {
                user: {
                    $toObjectId: string;
                };
            };
            $lookup?: undefined;
            $unwind?: undefined;
        } | {
            $unwind: string;
            $addFields?: undefined;
            $lookup?: undefined;
        } | {
            $addFields: {
                items: {
                    $toObjectId: string;
                };
            };
            $lookup?: undefined;
        } | {
            $lookup: {
                from: string;
                localField: string;
                foreignField: string;
                as: string;
                pipeline: ({
                    $addFields: {
                        photos: {
                            $toObjectId: string;
                        };
                    };
                    $lookup?: undefined;
                } | {
                    $lookup: {
                        from: string;
                        localField: string;
                        foreignField: string;
                        as: string;
                    };
                    $addFields?: undefined;
                })[];
            };
            $addFields?: undefined;
        })[];
    };
    $addFields?: undefined;
    $unwind?: undefined;
} | {
    $unwind: string;
    $addFields?: undefined;
    $lookup?: undefined;
})[];
/**
   * Returns a MongoDB aggregation pipeline that adds a field "billingUserId" that is populated from the "users" collection.
   * @returns a MongoDB aggregation pipeline.
   */
export declare const lookupBillingUser: () => ({
    $addFields: {
        billingUserId: {
            $toObjectId: string;
        };
    };
    $lookup?: undefined;
    $unwind?: undefined;
} | {
    $lookup: {
        from: string;
        localField: string;
        foreignField: string;
        as: string;
    };
    $addFields?: undefined;
    $unwind?: undefined;
} | {
    $unwind: string;
    $addFields?: undefined;
    $lookup?: undefined;
})[];
export declare const lookupItems: () => ({
    $addFields: {
        items: {
            $toObjectId: string;
        };
    };
    $lookup?: undefined;
} | {
    $lookup: {
        from: string;
        localField: string;
        foreignField: string;
        as: string;
        pipeline: ({
            $addFields: {
                photos: {
                    $toObjectId: string;
                };
            };
            $lookup?: undefined;
        } | {
            $lookup: {
                from: string;
                localField: string;
                foreignField: string;
                as: string;
            };
            $addFields?: undefined;
        })[];
    };
    $addFields?: undefined;
})[];
export declare const lookupProfilePic: () => {}[];
export declare const lookupCoverPic: () => {}[];
export declare const matchAllFields: () => void;

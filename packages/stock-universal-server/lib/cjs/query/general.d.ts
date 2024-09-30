/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import { IcustomRequest, IfilterProps, IpropFilter, IpropSort } from '@open-stock/stock-universal';
import { PipelineStage } from 'mongoose';
/**
   * Returns a MongoDB aggregation pipeline that adds a field "companyId" that is converted
   * from a string to an ObjectId, and then matches the documents where the "companyId" field is equal to the given id.
   * @param _id the id to match
   * @returns a MongoDB aggregation pipeline.
   */
export declare const matchCompany: (id: string) => PipelineStage[];
/**
   * Returns a MongoDB aggregation pipeline that adds a field "userId" that is converted
   * from a string to an ObjectId, and then matches the documents where the "userId" field is equal to the given id.
   * @param _id the id to match
   * @returns a MongoDB aggregation pipeline
   */
export declare const matchUser: (id: string) => PipelineStage[];
/**
   * Returns a MongoDB aggregation pipeline that adds a field "photos" that is converted
   * from a string to an ObjectId, and then performs a lookup on the "filemetas" collection to
   * populate the field with the actual documents.
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
   * Returns a MongoDB aggregation pipeline that adds a field "user" that is converted f
   * rom a string to an ObjectId, and then performs a lookup on the "users" collection to populate the
   * field with the actual documents. The pipeline also includes a lookup on the "photos" field to populate
   * the photos field with the actual documents.
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
    $unwind: {
        path: string;
        preserveNullAndEmptyArrays: boolean;
    };
    $addFields?: undefined;
    $lookup?: undefined;
})[];
/**
   * Returns a MongoDB aggregation pipeline that adds a field "payments" that is populated f
   * rom the "receipts" collection.
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
   * Returns a MongoDB aggregation pipeline that adds a field "invoiceRelated" that is populated
   * from the "invoicerelateds" collection.
   * The pipeline includes a lookup on the "payments" field to populate it with the
   * actual documents, and a lookup on the "billingUser" field to populate it with the actual documents.
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
        pipeline: (PipelineStage | {
            $lookup: {
                from: string;
                localField: string;
                foreignField: string;
                as: string;
                pipeline: any[];
            };
        })[];
    };
    $addFields?: undefined;
    $unwind?: undefined;
} | {
    $unwind: {
        path: string;
        preserveNullAndEmptyArrays: boolean;
    };
    $addFields?: undefined;
    $lookup?: undefined;
})[];
/**
   * Returns a MongoDB aggregation pipeline that adds a field "paymentRelated"
   * that is populated from the "paymentrelateds" collection.
   * The pipeline includes a lookup on the "items" field to populate it with the actual
   * documents, and a lookup on the "user" field to populate it with the actual documents.
   * @returns a MongoDB aggregation pipeline.
   */
export declare const lookupPaymentRelated: () => PipelineStage[];
/**
   * Returns a MongoDB aggregation pipeline that adds a field "billingUserId"
   * that is populated from the "users" collection.
   * @returns a MongoDB aggregation pipeline.
   */
export declare const lookupBillingUser: () => PipelineStage[];
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
export declare const lookupProfilePic: () => PipelineStage[];
export declare const lookupCoverPic: () => PipelineStage[];
export declare const matchAllFields: () => void;
export declare const lookupOffset: (offset: number) => {
    $skip: number;
}[];
export declare const lookupLimit: (limit: number) => {
    $limit: number;
}[];
export declare const lookupSort: (sort: IpropSort[]) => {
    $sort: {
        [key: string]: 1 | -1;
    };
}[];
export declare const lookupSubFieldInvoiceRelatedFilter: (filter: IpropFilter[], sort: IpropSort[], offset: number, limit: number) => PipelineStage[];
export declare const lookupSubFieldPaymentRelatedFilter: (filter: IpropFilter[], sort: IpropSort[], offset: number, limit: number) => PipelineStage[];
export declare const lookupSubFieldUserFilter: (filter: IpropFilter[], sort: IpropSort[], offset: number, limit: number) => PipelineStage[];
export declare const lookupSubFieldItemsRelatedFilter: (filter: IpropFilter[], sort: IpropSort[], offset: number, limit: number) => PipelineStage[];
export declare const lookupTrackEdit: () => ({
    $addFields: {
        trackEdit: {
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
    $unwind: {
        path: string;
        preserveNullAndEmptyArrays: boolean;
    };
    $addFields?: undefined;
    $lookup?: undefined;
})[];
export declare const lookupTrackView: () => PipelineStage[];
export declare const constructFiltersFromBody: (req: IcustomRequest<any, IfilterProps>, preferPredom?: boolean, subProps?: string[]) => any[];

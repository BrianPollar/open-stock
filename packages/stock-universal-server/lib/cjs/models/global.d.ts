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
import { Schema } from 'mongoose';
export declare const globalSchemaObj: {
    trackEdit: {
        type: typeof Schema.Types.ObjectId;
    };
    trackView: {
        type: typeof Schema.Types.ObjectId;
    };
    isDeleted: {
        type: BooleanConstructor;
        default: boolean;
    };
    trackDeleted: {
        type: typeof Schema.Types.ObjectId;
    };
    expireDocAfter: {
        type: DateConstructor;
        default: null;
    };
};
export declare const withCompanySchemaObj: {
    companyId: {
        type: Schema.Types.ObjectId;
        index: boolean;
    };
    trackEdit: {
        type: typeof Schema.Types.ObjectId;
    };
    trackView: {
        type: typeof Schema.Types.ObjectId;
    };
    isDeleted: {
        type: BooleanConstructor;
        default: boolean;
    };
    trackDeleted: {
        type: typeof Schema.Types.ObjectId;
    };
    expireDocAfter: {
        type: DateConstructor;
        default: null;
    };
};
export declare const withUrIdAndCompanySchemaObj: {
    urId: {
        type: StringConstructor;
        required: boolean;
        index: boolean;
    };
    companyId: {
        type: Schema.Types.ObjectId;
        index: boolean;
    };
    trackEdit: {
        type: typeof Schema.Types.ObjectId;
    };
    trackView: {
        type: typeof Schema.Types.ObjectId;
    };
    isDeleted: {
        type: BooleanConstructor;
        default: boolean;
    };
    trackDeleted: {
        type: typeof Schema.Types.ObjectId;
    };
    expireDocAfter: {
        type: DateConstructor;
        default: null;
    };
};
export declare const withUrIdSchemaObj: {
    urId: {
        type: StringConstructor;
        required: boolean;
        index: boolean;
    };
    trackEdit: {
        type: typeof Schema.Types.ObjectId;
    };
    trackView: {
        type: typeof Schema.Types.ObjectId;
    };
    isDeleted: {
        type: BooleanConstructor;
        default: boolean;
    };
    trackDeleted: {
        type: typeof Schema.Types.ObjectId;
    };
    expireDocAfter: {
        type: DateConstructor;
        default: null;
    };
};
export declare const globalSelectObj: {
    trackEdit: number;
    trackView: number;
    isDeleted: number;
    trackDeleted: number;
};
export declare const withCompanySelectObj: {
    companyId: number;
    trackEdit: number;
    trackView: number;
    isDeleted: number;
    trackDeleted: number;
};
export declare const withUrIdAndCompanySelectObj: {
    urId: number;
    companyId: number;
    trackEdit: number;
    trackView: number;
    isDeleted: number;
    trackDeleted: number;
};
export declare const withUrIdSelectObj: {
    urId: number;
    trackEdit: {
        type: typeof Schema.Types.ObjectId;
    };
    trackView: {
        type: typeof Schema.Types.ObjectId;
    };
    isDeleted: {
        type: BooleanConstructor;
        default: boolean;
    };
    trackDeleted: {
        type: typeof Schema.Types.ObjectId;
    };
    expireDocAfter: {
        type: DateConstructor;
        default: null;
    };
};
/**
 * Creates an index on the `expireDocAfter` field, which is used to expire
 * documents after a certain amount of time.
 *
 * The index is created with the following options:
 *
 * - `expireAfterSeconds`: The number of seconds after which the document will
 *   be deleted.
 * - `partialFilterExpression`: An expression that specifies which documents
 *   should be deleted. In this case, the expression is `{ isDeleted: true }`,
 *   which means that only documents with `isDeleted` set to `true` will be
 *   deleted.
 *
 * This function is used to create the index on the `expireDocAfter` field when
 * the schema is created.
 *
 * @param schema The schema on which to create the index.
 */
export declare const createExpireDocIndex: (schema: Schema) => void;

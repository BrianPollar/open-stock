import { Schema } from 'mongoose';
import { stockUniversalConfig } from '../stock-universal-local';

export const globalSchemaObj = {
  trackEdit: { type: Schema.ObjectId },
  trackView: { type: Schema.ObjectId },
  isDeleted: { type: Boolean, default: false },
  trackDeleted: { type: Schema.ObjectId },
  expireDocAfter: { type: Date, default: null }
};

export const withCompanySchemaObj = {
  ...globalSchemaObj,
  companyId: { type: Schema.ObjectId, index: true } as unknown as {type: StringConstructor; index: boolean}
};

export const withUrIdAndCompanySchemaObj = {
  ...withCompanySchemaObj,
  urId: {
    type: String, required: [true, 'cannot be empty.'], index: true
  } as unknown as {type: StringConstructor; required: boolean; index: boolean}
};

export const withUrIdSchemaObj = {
  ...globalSchemaObj,
  urId: {
    type: String, required: [true, 'cannot be empty.'], index: true
  } as unknown as {type: StringConstructor; required: boolean; index: boolean}
};

export const globalSelectObj = {
  trackEdit: 1,
  trackView: 1,
  isDeleted: 1,
  trackDeleted: 1
};

export const withCompanySelectObj = {
  ...globalSelectObj,
  companyId: 1
};

export const withUrIdAndCompanySelectObj = {
  ...withCompanySelectObj,
  urId: 1
};

export const withUrIdSelectObj = {
  ...globalSchemaObj,
  urId: 1
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
export const createExpireDocIndex = (schema: Schema) => {
  schema.index(
    { expireDocAfter: 1 },
    { expireAfterSeconds: stockUniversalConfig.expireDocAfterSeconds, partialFilterExpression: { isDeleted: true } }
  );
};

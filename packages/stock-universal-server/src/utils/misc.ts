import { Model, ObjectId } from 'mongoose';
import { nanoid } from 'nanoid';

/**
 * Checks if a value is greater than 300.
 * This is used to check if a document should be deleted permanently.
 * @param val - The value to check.
 * @returns {boolean} - The result of the check.
 */
export const checkDeletePermanentltVal = (val: number) => {
  return val > 300;
};

export const isValidUrId = (urId: string) => {
  return urId.lastIndexOf('-') && Number(urId.slice(urId.lastIndexOf('-') + 1));
};

export const generateCustomIdFromObjectId = (objectId: string | ObjectId, lastUrId: string) => {
  const idToStr = objectId.toString();
  const last4 = idToStr.slice(idToStr.length - 5);
  const indexOfDash = lastUrId.lastIndexOf('-');
  let increment = Number(lastUrId.slice(indexOfDash + 1));

  increment++;

  return last4 + '-' + increment;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const generateUrId = async(model: Model<any>, length = 10) => {
  const urId = nanoid(length);

  const found = await model.findOne({ urId }).sort({ urId: -1 });

  if (found) {
    return generateUrId(model, found.urId.length + 1);
  }

  return urId;
};

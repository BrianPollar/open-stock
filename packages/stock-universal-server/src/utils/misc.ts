/**
 * Checks if a value is greater than 300.
 * This is used to check if a document should be deleted permanently.
 * @param val - The value to check.
 * @returns {boolean} - The result of the check.
 */
export const checkDeletePermanentltVal = (val: number) => {
  return val > 300;
};
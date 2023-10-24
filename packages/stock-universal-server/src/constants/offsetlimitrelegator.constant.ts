// This function exports a function that relegates offset and limit values.
//
// **Parameters:**
//
// * `offset`: The offset value.
// * `limit`: The limit value.
//
// **Returns:**
//
// An object with the offset and limit values relegated.
/** */
export const offsetLimitRelegator = (offset: number, limit: number) => ({

  // If the offset is 0, then set it to 10000.
  offset: offset === 0 ? 10000 : offset,

  // If the limit is 0, then set it to 10000.
  limit: limit === 0 ? 10000 : limit
});

// **Comments:**
//
// * This function is used to relegate offset and limit values to a maximum of 10000.
// * This is done to prevent users from requesting too much data at once.
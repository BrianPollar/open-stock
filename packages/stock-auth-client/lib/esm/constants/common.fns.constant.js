/**
 * Resolves the URID of a user.
 * @param userId - The user object or user ID.
 * @returns The URID of the user.
 */
export const resolveUserUrId = (userId) => userId?.urId || userId;
/**
 * Resolves the image URL based on the provided parameters.
 * @param userId - The user ID or user object.
 * @param alterenativeImageUrl - The alternative image URL to use if the user's image is not available.
 * @param property - The property to retrieve the image URL from. Defaults to 'profilePic'.
 * @param photoPosition - The position of the photo in the 'photos' array. Only applicable if 'property' is set to 'photos'. Defaults to 0.
 * @returns The resolved image URL.
 */
export const resolveImageUrl = (userId, alterenativeImageUrl, property = 'profilePic', photoPosition = 0) => {
    if (property === 'photos') {
        return userId?.photos[photoPosition]?.url || alterenativeImageUrl;
    }
    else if (property === 'profileCoverPic') {
        return userId?.profileCoverPic?.url || alterenativeImageUrl;
    }
    else {
        return userId?.profilePic?.url || alterenativeImageUrl;
    }
};
/**
 * Resolves the user name based on the provided user ID.
 * @param userId - The user ID or User object.
 * @returns The resolved user name.
 */
export const resolveUserName = (userId) => {
    return typeof userId === 'string' ? userId : (userId).names;
};
//# sourceMappingURL=common.fns.constant.js.map
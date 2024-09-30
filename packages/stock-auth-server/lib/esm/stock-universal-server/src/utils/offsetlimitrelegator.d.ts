/**
 * Creates an offset-limit object with default values.
 * If the offset is 0, it is set to 0.
 * If the limit is 0, it is set to 10000.
 * @param offset - The offset value.
 * @param limit - The limit value.
 * @returns An object with offset and limit properties.
 */
export declare const offsetLimitRelegator: (offset: string | number, limit: string | number) => {
    offset: number;
    limit: number;
};

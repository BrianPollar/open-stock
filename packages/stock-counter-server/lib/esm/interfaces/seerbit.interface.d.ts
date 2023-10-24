/** */
export interface IseerbitError {
    code: string | number;
}
/** */
/**
 * Interface for the response object returned by the SeerBit API.
 */
export interface IseerbitResponse {
    status: string;
    data: {
        code: string;
        payments: {
            redirectLink: string;
            paymentStatus: string;
        };
        message: string;
    };
}

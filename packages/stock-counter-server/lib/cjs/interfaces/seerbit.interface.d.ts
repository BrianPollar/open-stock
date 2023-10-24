/** */
export interface IseerbitError {
    code: string | number;
}
/** */
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

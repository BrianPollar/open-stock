/** */
export declare const runAuthy: (authyKey: string) => any;
/** */
export declare const runTwilio: (accountSid: string, authToken: string) => any;
/** */
export declare const makeAuthyTwilio: (authyKey: string, accountSid: string, authToken: string) => {
    authy: any;
    twilioClient: any;
};

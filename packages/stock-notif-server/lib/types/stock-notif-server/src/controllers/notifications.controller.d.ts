import { Iaction, Iactionwithall, Iauthtoken, InotifSetting, Isuccess, Iuser, TnotifType } from '@open-stock/stock-universal';
/**
 * Determines whether a user has an email address.
 * @param user - The user object.
 * @returns True if the user has an email address, false otherwise.
 */
export declare const determineUserHasMail: (user: Iuser) => boolean;
/**
 * Creates notification settings.
 * @returns {Promise<InotifSetting>} The created notification settings.
 */
export declare const createSettings: () => Promise<InotifSetting>;
/**
   * Registers a new user with Authy.
   * @param phone - The user's phone number.
   * @param countryCode - The user's country code.
   * @returns A promise that resolves with the Authy registration response.
   */
export declare const setUpUser: (phone: string | number, countryCode: string | number) => Promise<unknown>;
/**
   * Requests an SMS token from Authy for the given user.
   * @param authyId - The user's Authy ID.
   * @returns A promise that resolves with the Authy token request response.
   */
export declare const sendToken: (authyId: string) => Promise<unknown>;
/**
   * Sends an SMS message using Twilio.
   * @param phone - The recipient's phone number.
   * @param countryCode - The recipient's country code.
   * @param message - The message to send.
   * @returns A promise that resolves with the Twilio message send response.
   */
export declare const sendSms: (phone: string, countryCode: string, message: string) => Promise<unknown>;
/**
 * Verifies the Authy token for a given Authy ID.
 * @param authyId - The Authy ID of the user.
 * @param otp - The one-time password to be verified.
 * @returns A promise that resolves with the verification response or rejects with an error.
 */
export declare const verifyAuthyToken: (authyId: string, otp: any) => Promise<unknown>;
/**
 * Constructs an email object with the specified parameters.
 * @param to - The recipient's email address.
 * @param subject - The subject of the email.
 * @param text - The plain text content of the email.
 * @param html - The HTML content of the email.
 * @param from - The sender's email address. Default is 'info@eagleinfosolutions.com'.
 * @returns An email object with the specified parameters.
 */
export declare const constructMail: (to: string, subject: string, text: string, html: string, from?: string) => {
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
};
/**
 * Sends an email using the provided mail options.
 * @param {object} mailOptions - The options for sending the email.
 * @returns {Promise<object>} A promise that resolves with the response from sending the email.
 */
export declare const sendMail: (mailOptions: any) => Promise<unknown>;
/**
 * Constructs a mail service with the provided SendGrid API key, public key, and private key.
 * @param sendGridApiKey - The SendGrid API key.
 * @param publicKey - The public key for VAPID authentication.
 * @param privateKey - The private key for VAPID authentication.
 */
export declare const constructMailService: (sendGridApiKey: string, publicKey: string, privateKey: string) => void;
/**
 * Creates a notification setting.
 * @param stn - The notification setting to be created.
 * @returns A promise that resolves to an object indicating the success status and HTTP status code.
 */
export declare const createNotifSetting: (stn: any) => Promise<Isuccess>;
/**
 * Creates a payload for a notification.
 * @param title - The title of the notification.
 * @param body - The body of the notification.
 * @param icon - The icon of the notification.
 * @param actions - An array of actions for the notification. Defaults to an array with two actions: "bar" and "baz".
 * @returns The payload object for the notification.
 */
export declare const createPayload: (title: string, body: string, icon: string, actions?: Iactionwithall[]) => {
    notification: {
        title: string;
        body: string;
        icon: string;
        duplicateActions: Iaction[];
        data: {
            onActionClick: {
                default: {
                    operation: string;
                };
            };
        };
    };
};
/**
 * Updates the viewed status of a notification for a specific user.
 * @param user - The authenticated user.
 * @param id - The ID of the notification to update.
 * @returns A boolean indicating whether the update was successful.
 */
export declare const updateNotifnViewed: (user: Iauthtoken, id: string) => Promise<boolean>;
/**
 * Creates a notification body object.
 * @param userId - The ID of the user receiving the notification.
 * @param title - The title of the notification.
 * @param body - The body content of the notification.
 * @param notifType - The type of the notification.
 * @param actions - An array of actions associated with the notification.
 * @param notifInvokerId - The ID of the entity that triggered the notification.
 * @returns The created notification body object.
 */
export declare const makeNotfnBody: (userId: string, title: string, body: string, notifType: TnotifType, actions: Iactionwithall[], notifInvokerId: string) => {
    actions: Iactionwithall[];
    userId: string;
    title: string;
    notifType: TnotifType;
    notifInvokerId: string;
    body: string;
    icon: string;
    expireAt: number;
    orders: boolean;
    payments: boolean;
    users: boolean;
    items: boolean;
    faqs: boolean;
    buyer: boolean;
    viewed: any[];
};

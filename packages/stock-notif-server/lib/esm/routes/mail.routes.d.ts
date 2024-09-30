/**
 * Sends a verification email to the specified email with a token.
 * @param emailFrom - The email address of the sender.
 * @param emailTo - The email address of the recipient.
 * @param subject - The subject of the email.
 * @param message - The content of the email.
 * @returns A Promise that resolves to a boolean indicating whether the email was successfully sent.
 */
export declare const sendRandomEmail: (emailFrom: string, emailTo: string, subject: string, message: string) => Promise<boolean>;
/**
 * Router for handling mailPackage-related routes.
 */
export declare const mailSenderRoutes: import("express-serve-static-core").Router;

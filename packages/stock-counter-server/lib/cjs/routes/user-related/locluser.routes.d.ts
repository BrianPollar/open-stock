interface IuserLinkedInMoreModels {
    success: boolean;
    msg: string;
}
/**
 * Removes one user from the database.
 * @param req - Express Request object.
 * @param res - Express Response object.
 * @param next - Express NextFunction object.
 * @returns Promise<void>
 */
export declare const removeOneUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Removes multiple users from the database.
 * @param req - Express Request object.
 * @param res - Express Response object.
 * @param next - Express NextFunction object.
 * @returns Promise<void>
 */
export declare const removeManyUsers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Checks if a user can be removed from the database.
 * @param id - The ID of the user to check.
 * @returns Promise<IuserLinkedInMoreModels>
 */
export declare const canRemoveOneUser: (id: string) => Promise<IuserLinkedInMoreModels>;
/** Express Router for local user routes. */
export declare const localUserRoutes: any;
export {};

interface IuserLinkedInMoreModels {
    success: boolean;
    msg: string;
}
type TcanByPass = 'customer' | 'staff' | 'none';
/**
   * Removes one user from the database.
   * @param req - Express Request object.
   * @param res - Express Response object.
   * @param next - Express NextFunction object.
   * @returns Promise<void>
   */
export declare const removeOneUser: (canByPass: TcanByPass) => (req: any, res: any, next: any) => Promise<void>;
/**
   * Removes multiple users from the database.
   * @param req - Express Request object.
   * @param res - Express Response object.
   * @param next - Express NextFunction object.
   * @returns Promise<void>
   */
export declare const removeManyUsers: (canByPass: TcanByPass) => (req: any, res: any, next: any) => Promise<void>;
/**
   * Checks if a user can be removed from the database.
   * @param id - The ID of the user to check.
   * @returns Promise<IuserLinkedInMoreModels>
   */
export declare const canRemoveOneUser: (id: string, byPass: TcanByPass) => Promise<IuserLinkedInMoreModels>;
/** Express Router for local user routes. */
export declare const localUserRoutes: any;
export {};

interface IuserLinkedInMoreModels {
    success: boolean;
    msg: string;
}
export declare const removeOneUser: (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const removeManyUsers: (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const canRemoveOneUser: (id: string) => Promise<IuserLinkedInMoreModels>;
/** */
export declare const localUserRoutes: any;
export {};

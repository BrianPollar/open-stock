/** */
export interface IdatabaseConfig {
    url: string;
}
/** */
export interface IenvironmentConfig {
    appName: string;
    photoDirectory: string;
    videoDirectory: string;
    absolutepath: string;
}
/** */
export interface IappConfig {
    baseServerUrl: string;
    token?: string;
}
/** */
export declare class StockUniversal {
    static environment: IenvironmentConfig;
    constructor(environment: IenvironmentConfig);
}

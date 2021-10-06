export declare enum Surrounding {
    typeScript = "typeScript",
    javaScript = "javaScript"
}
export declare enum OriginType {
    SwaggerV2 = "SwaggerV2",
    Yapi = "Yapi"
}
export declare const maxMockArrayLength = 3;
export declare class DataSourceConfig {
    originUrl: string;
    originType: OriginType;
    originReqBody: {};
    name?: string;
    modsTemplatePath?: string;
    surrounding: Surrounding;
    outDir: string;
    eslinttrcPath: string;
    mocksDev: boolean;
    mocksModsReg?: RegExp;
    constructor(config: DataSourceConfig);
    static createFromConfigPath(configPath: string): DataSourceConfig;
}

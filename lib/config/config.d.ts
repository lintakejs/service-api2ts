import { ResolveConfigOptions } from 'prettier';
export declare enum OriginType {
    SwaggerV3 = "SwaggerV3",
    SwaggerV2 = "SwaggerV2",
    SwaggerV1 = "SwaggerV1"
}
export declare enum Surrounding {
    typeScript = "typeScript",
    javaScript = "javaScript"
}
export declare class Mocks {
    enable: boolean;
    port: number;
    basePath: string;
    wrapper: string;
}
export declare class DataSourceConfig {
    originUrl: string;
    originType: OriginType;
    name?: string;
    modsTemplatePath?: string;
    modsTypeTemplatePath?: string;
    surrounding: Surrounding;
    outDir: string;
    prettierConfig: ResolveConfigOptions;
    constructor(config: DataSourceConfig);
    static createFromConfigPath(configPath: string): DataSourceConfig;
}

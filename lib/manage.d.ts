import { DataSourceConfig } from './config/config';
import { FilesManager } from './generators/';
import { StandardDataSource } from './standard/';
export declare class Manager {
    currLocalDataSource: StandardDataSource;
    currConfig: DataSourceConfig;
    fileManager: FilesManager;
    constructor(config: DataSourceConfig, configDir?: string);
    private generateFiles;
    private getGeneratedFiles;
    remoteApiJson(): Promise<void>;
}

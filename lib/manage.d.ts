import { DataSourceConfig } from './config/config';
import { FilesManager } from './generators/generate';
import { StandardDataSource } from './standard';
export declare class Manager {
    currLocalDataSource: StandardDataSource;
    currConfig: DataSourceConfig;
    fileManager: FilesManager;
    constructor(config: DataSourceConfig, configDir?: string);
    ready(): Promise<void>;
    readRemoteDataSource(config: any): Promise<StandardDataSource>;
    regenerateFiles(): Promise<void>;
    getGeneratedFiles(): {
        [x: string]: {};
        mods: {};
        'api.d.ts': string;
    };
    setFilesManager(): void;
}

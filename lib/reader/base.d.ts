import { DataSourceConfig } from '../config/config';
import { StandardDataSource } from '../standard/';
export declare class OriginBaseReader {
    protected config: DataSourceConfig;
    constructor(config: DataSourceConfig);
    transform2Standard(data: any): any;
    fetchMethod(config: DataSourceConfig): any;
    fetchData(): Promise<any>;
    fetchRemoteData(): Promise<StandardDataSource>;
}

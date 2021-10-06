import { DataSourceConfig } from '../config/config';
import { YapiDataServiceBase, YapiDataSource, YapiInterface } from './yapi/';
import { StandardBaseClass, StandardMod, StandardDataSource } from '../standard';
import { OriginBaseReader } from './base';
export declare class YapiReader extends OriginBaseReader {
    fetchMethod(config: DataSourceConfig): Promise<any>;
    transform2Standard(data: any): StandardDataSource;
}
export declare function transformYapiData2Standard(yapi: YapiDataSource, config: DataSourceConfig): StandardDataSource;
export declare function parseYapiMods(allYapiServesName: YapiDataServiceBase[], allYapiInterfaces: YapiInterface[], baseClasses: StandardBaseClass[], defOriginName: string): StandardMod[];

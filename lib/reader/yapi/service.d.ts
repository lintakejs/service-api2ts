import { YapiInterface } from './';
export interface YapiDataServiceBase {
    name: string;
    desc: string;
}
export interface YapiDataService extends YapiDataServiceBase {
    list: YapiInterface[];
}
export declare type YapiDataSource = YapiDataService[];

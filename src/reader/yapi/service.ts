import { YapiInterface } from './'
// yapi基础类初始化
export interface YapiDataServiceBase {
  // 服务名称
  name: string;
  // 服务说明
  desc: string;
}
export interface YapiDataService extends YapiDataServiceBase {
  // 服务下接口列表
  list: YapiInterface[]
}
export type YapiDataSource = YapiDataService[]
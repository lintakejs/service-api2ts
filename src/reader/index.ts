import * as path from 'path'
import { DataSourceConfig, OriginType } from '../config/config'
import { SwaggerV2Reader } from './swagger'
import { YapiReader } from './yapi'

export async function readRemoteDataSource (config: DataSourceConfig) {
  if (!config.name) {
    config.name = path.basename(process.cwd()).replace(/-/g, '_').toUpperCase()
  }
  switch (config.originType) {
    case OriginType.SwaggerV2:
      return new SwaggerV2Reader(config).fetchRemoteData()
    case OriginType.Yapi:
      return new YapiReader(config).fetchRemoteData()
    default:
      return new SwaggerV2Reader(config).fetchRemoteData()
  }
}

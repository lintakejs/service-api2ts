import { DataSourceConfig, OriginType } from "../config/config";
import { SwaggerV2Reader, SwaggerV3Reader } from "./swagger"

export async function readRemoteDataSource(config: DataSourceConfig, report: any) {
  switch (config.originType) {
    case OriginType.SwaggerV3: {
      return new SwaggerV3Reader(config, report).fetchRemoteData();
    }
    case OriginType.SwaggerV2: {
      return new SwaggerV2Reader(config, report).fetchRemoteData();
    }
    default:
      return new SwaggerV2Reader(config, report).fetchRemoteData();
  }
}
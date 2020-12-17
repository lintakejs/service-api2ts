import { DataSourceConfig, OriginType } from "../config/config";
import { SwaggerV2Reader, SwaggerV3Reader } from "./swagger"

export async function readRemoteDataSource(config: DataSourceConfig) {
  switch (config.originType) {
    case OriginType.SwaggerV3: {
      return new SwaggerV3Reader(config).fetchRemoteData();
    }
    case OriginType.SwaggerV2: {
      return new SwaggerV2Reader(config).fetchRemoteData();
    }
    default:
      return new SwaggerV2Reader(config).fetchRemoteData();
  }
}
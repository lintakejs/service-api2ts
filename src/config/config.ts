import * as fs from 'fs'
import { ResolveConfigOptions } from 'prettier'

export enum OriginType {
  SwaggerV3 = 'SwaggerV3',
  SwaggerV2 = 'SwaggerV2',
  SwaggerV1 = 'SwaggerV1'
}

export enum Surrounding {
  typeScript = 'typeScript',
  javaScript = 'javaScript'
}

export class Mocks {
  enable = false;
  port = 8080;
  basePath = '';
  wrapper = `{
      "code": 0,
      "data": {response},
      "message": ""
    }`;
}

export class DataSourceConfig {
  originUrl= '';
  originType = OriginType.SwaggerV2;
  name?: string;
  modsTemplatePath?:string;
  modsTypeTemplatePath?: string;
  surrounding = Surrounding.typeScript;
  outDir = './api-server';
  prettierConfig: ResolveConfigOptions = {};

  constructor(config: DataSourceConfig) {
    Object.keys(config).forEach(key => {
      this[key] = config[key]
    });
  }

  static createFromConfigPath(configPath: string) {
    try { 
      const content = fs.readFileSync(configPath, 'utf-8')
      const configObj = JSON.parse(content)
      return new DataSourceConfig(configObj)
    } catch(e) {
      throw '配置json失败，请检查配置文件路径是否正确'
    }
  }
}
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
  originUrl?= '';
  ssoCookies?=''
  originType = OriginType.SwaggerV2;
  name?: string;
  templatePath = 'serviceTemplate';
  surrounding = Surrounding.typeScript;
  outDir = './server';
  prettierConfig: ResolveConfigOptions = {};

  constructor(config: DataSourceConfig) {
    Object.keys(config).forEach(key => {
      this[key] = config[key]
    });
  }

  static createFromConfigPath(configPath: string) {
    const content = fs.readFileSync(configPath, 'utf-8')
    try { 
      const configObj = JSON.parse(content)
      return new DataSourceConfig(configObj)
    } catch(e) {
      throw new Error('配置json失败')
    }
  }
}
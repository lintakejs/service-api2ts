import * as fs from 'fs'
import * as path from 'path'

export enum Surrounding {
  typeScript = 'typeScript',
  javaScript = 'javaScript'
}

export enum OriginType {
  SwaggerV2 = 'SwaggerV2',
  Yapi = 'Yapi'
}

export const maxMockArrayLength = 3

export class DataSourceConfig {
  originUrl= '';
  originType = OriginType.SwaggerV2;
  originReqBody = {};
  name?: string;
  modsTemplatePath?:string;
  surrounding = Surrounding.typeScript;
  outDir = './api-server';
  eslinttrcPath = path.join(process.cwd(), '.eslintrc.js')
  mocksDev = false
  mocksModsReg?: RegExp

  constructor (config: DataSourceConfig) {
    Object.keys(config).forEach(key => {
      this[key] = config[key]
    })
  }

  static createFromConfigPath (configPath: string) {
    try {
      const content = fs.readFileSync(configPath, 'utf-8')
      const configObj = JSON.parse(content)
      return new DataSourceConfig(configObj)
    } catch (e) {
      throw new Error('配置json失败，请检查配置文件路径是否正确')
    }
  }
}

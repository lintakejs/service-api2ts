import * as _ from 'lodash'
import { hasChinese, jsonStingTransformObject, toUpperFirstLetter, transformCamelCase } from '../utils'
import { DataSourceConfig } from '../config/config'
import { YapiDataServiceBase, YapiDataSource, YapiProperty, YapiInterface } from './yapi/'
import { StandardBaseClass, StandardMod, StandardDataSource } from '../standard'
import { OriginBaseReader } from './base'
import { BasePropertyType } from './common/type'

export class YapiReader extends OriginBaseReader {
  fetchMethod (config: DataSourceConfig) {
    return import('node-fetch').then((fetch) => fetch(config.originUrl, {
      method: 'POST',
      body: JSON.stringify(config.originReqBody),
      headers: { 'Content-Type': 'application/json' }
    })).then(async res => {
      const sourceData = await res.text()
      return sourceData
    })
  }

  // 对网关返回参数做特殊定制化的传参
  transform2Standard (data) {
    return transformYapiData2Standard(Array.isArray(data) ? data : data.result, this.config)
  }
}

export function transformYapiData2Standard (yapi: YapiDataSource, config: DataSourceConfig) {
  const baseClasses = [] as StandardBaseClass[]
  const allYapiServesBase = [{
    name: 'defaultServer',
    desc: '一些存在不规范的service interface name收集'
  }] as YapiDataServiceBase[]
  const allYapiInterfaces = [] as YapiInterface[]

  yapi.forEach(serverItem => {
    allYapiServesBase.push({
      name: serverItem.name,
      desc: serverItem.desc
    })
    serverItem.list.filter(inter => !hasChinese(inter.path)).forEach(inter => {
      inter.tagName = hasChinese(serverItem.name) ? 'defaultServer' : serverItem.name
      inter.req_body_other = jsonStingTransformObject(inter.req_body_other)
      inter.res_body = jsonStingTransformObject(inter.res_body)
      !inter.req_body_other.type && (inter.req_body_other.type = BasePropertyType.object)
      !inter.res_body.type && (inter.res_body.type = BasePropertyType.object)

      const requiredRequestProps = inter.req_body_other.required || []
      YapiProperty.parseYapiProperty2StandardDataType(inter.req_body_other, requiredRequestProps, baseClasses, toUpperFirstLetter(inter.path + 'RequestBody'), config.name)
      const requireResponseProps = inter.res_body.required || []
      YapiProperty.parseYapiProperty2StandardDataType(inter.res_body, requireResponseProps, baseClasses, toUpperFirstLetter(inter.path + 'Response'), config.name)

      allYapiInterfaces.push(inter)
    })
  })

  return new StandardDataSource({
    baseClasses: _.uniqBy(baseClasses, base => base.name),
    mods: parseYapiMods(allYapiServesBase, allYapiInterfaces, baseClasses, config.name),
    name: config.name
  })
}

export function parseYapiMods (allYapiServesName: YapiDataServiceBase[], allYapiInterfaces: YapiInterface[], baseClasses: StandardBaseClass[], defOriginName: string) {
  const mods = allYapiServesName.map(({ name: tagName, desc }) => {
    const modInterfaces = allYapiInterfaces.filter(inter => inter.tagName === tagName)
    const standardInterfaces = modInterfaces.map(inter => YapiInterface.transformYapiInterface2Standard(inter, baseClasses, defOriginName))

    return new StandardMod({
      description: desc,
      interfaces: _.uniqBy(standardInterfaces, 'name'),
      name: transformCamelCase(tagName)
    })
  }).filter(mod => mod.interfaces.length)

  return mods
}

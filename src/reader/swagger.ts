import { OriginBaseReader } from './base'
import { SwaggerInterface, RequestMethod, SwaggerProperty, SwaggerSchema } from './swagger/'
import { compolerUtils } from '../compiler/'
import { StandardProperty, StandardBaseClass, StandardDataSource, StandardMod } from '../standard/'

import { hasChinese, toDashCase, transformCamelCase, getMaxSamePath, getIdentifierFromUrl } from '../utils'
import * as _ from 'lodash'
import { DataSourceConfig } from 'src/config/config'

interface SwaggerPathItemObject {
  get?: SwaggerInterface;
  post?: SwaggerInterface;
  put?: SwaggerInterface;
  patch?: SwaggerInterface;
  delete?: SwaggerInterface;
}

interface SwaggerDataSource {
  tags: { name: string; description: string }[];
  paths: { [key in string]: SwaggerPathItemObject };
  definitions: {
    [key in string]: {
      description: string;
      required?: string[];
      properties: { [key in string]: SwaggerProperty };
    };
  };
}

// definitions 词法解析
function transfromSwaggerDefinition2BaseClass (swagger: SwaggerDataSource, config: DataSourceConfig) {
  // 解析defintions词法树
  const draftClasses = _.map(swagger.definitions, (def, defName) => {
    const defNameAst = compolerUtils.compileTemplate(defName)

    if (!defNameAst) {
      throw new Error('compiler error in definitionName: ' + defName)
    }

    return {
      name: defNameAst.name,
      defNameAst,
      def
    }
  })
  // definitions 词法的 name，即api(ts)命名空间内的dto class name
  const defNames = draftClasses.map(clazz => clazz.name)
  // 解析出api(ts)的base classes
  const baseClasses = draftClasses.map(clazz => {
    const dataType = compolerUtils.parseAst2StandardDataType(clazz.defNameAst, defNames, config.name)
    const templateArgs = dataType.typeArgs
    const { description, properties } = clazz.def
    const requiredProps = clazz.def.required || []
    // 解析base class字段参数
    const props = _.map(properties, (prop, propName) => {
      const { $ref, description, type, items, additionalProperties } = prop
      const required = requiredProps.includes(propName)
      const dataType = SwaggerSchema.parseSwaggerSchema2StandardDataType(
        {
          $ref,
          items,
          type,
          additionalProperties
        },
        defNames,
        config.name,
        templateArgs
      )

      return new StandardProperty({
        dataType,
        name: propName,
        description,
        required
      })
    })

    return new StandardBaseClass({
      description,
      name: clazz.name,
      properties: props,
      templateArgs
    })
  })

  /** 聚合属性，lodash 应当由属性量小的聚合至大的，否则会被空值覆盖 */
  baseClasses.sort((pre, next) => {
    if (pre.name === next.name && pre.templateArgs.length === next.templateArgs.length) {
      return pre.templateArgs.filter(({ isDefsType }) => isDefsType).length >
        next.templateArgs.filter(({ isDefsType }) => isDefsType).length
        ? -1
        : 1
    }

    if (pre.name === next.name) {
      return pre.templateArgs.length > next.templateArgs.length ? -1 : 1
    }

    return next.name > pre.name ? 1 : -1
  })

  return {
    draftClasses,
    defNames,
    baseClasses
  }
}
// 解析api数据至modules中，返回相关modules
function transformSwaggerPath2Mods (
  swagger: SwaggerDataSource,
  defNames: string[],
  usingOperationId: boolean,
  defOriginName: string
) {
  /**
   * swaggerInterfaces demo: {
   *   path: "/controller/api"
   *   method: "post",
   *   operationId: "唯一id",
   *   summary: "接口说明",
   *   parameters: [
   *     {
   *        name: "字段名",
   *        in: "body",
   *        description: "描述",
   *        required: true | false => "是否必填",
   *        type: "java数据类型",
   *        // 只有type === "array"时才存在
   *        items: {
   *          type: "java数据类型",
   *          $ref: "#/definitions/Dto 指向definition中实体路径"
   *        },
   *        schema: {
   *          type: "java数据类型",
   *          // 只有type === "array"时才存在
   *          items: {
   *            type: "java数据类型",
   *            $ref: "#/definitions/Dto 指向definition中实体路径"
   *          }
   *        }
   *     }
   *   ]
   * }
   */
  const allSwaggerInterfaces: SwaggerInterface[] = []
  
  _.map(swagger.paths, (pathItem, path) => {
    _.forEach(pathItem, (inter, method: RequestMethod) => {
      inter.path = path
      inter.method = method

      allSwaggerInterfaces.push(inter)
    })
  })

  const mods = swagger.tags.map(tag => {
    const modInterfaces = allSwaggerInterfaces.filter(inter => (
      inter.tags.includes(tag.name) ||
      inter.tags.includes(tag.name.toLowerCase()) ||
      inter.tags.includes(tag.description.toLowerCase()) ||
      inter.tags.includes(toDashCase(tag.description))
    ))
    
    const samePath = getMaxSamePath(modInterfaces.map(inter => inter.path.slice(1)))

    const standardInterfaces = modInterfaces.map(inter =>
      SwaggerInterface.transformSwaggerInterface2StandardInterface(
        inter,
        usingOperationId,
        samePath,
        defNames,
        defOriginName
      )
    )
    // 如果有同名的api。需要换一个
    const names = [] as string[]
    standardInterfaces.forEach(inter => {
      if (!names.includes(inter.name)) {
        names.push(inter.name)
      } else {
        inter.name = getIdentifierFromUrl(inter.path, inter.method, samePath)
      }
    })
    
    if (hasChinese(tag.name)) {
      return new StandardMod({
        description: tag.description,
        interfaces: standardInterfaces,
        name: transformCamelCase(tag.description)
      })
    } else {
      return new StandardMod({
        description: tag.description,
        interfaces: standardInterfaces,
        name: transformCamelCase(tag.name)
      })
    }
  }).filter(mod => mod.interfaces.length)
  
  return mods
}

/**
 *
 * @param swagger api.json
 * @param usingOperationId 是否去重
 */
function transformSwaggerData2Standard (swagger: SwaggerDataSource, config: DataSourceConfig, usingOperationId = true) {
  const { baseClasses, defNames } = transfromSwaggerDefinition2BaseClass(swagger, config)
  const mods = transformSwaggerPath2Mods(swagger, defNames, usingOperationId, config.name)
  
  return new StandardDataSource({
    name: config.name,
    baseClasses: _.uniqBy(baseClasses, base => base.name),
    mods
  })
}
export class SwaggerV2Reader extends OriginBaseReader {
  /**
   * @description 解析api.json
   */
  transform2Standard (data: SwaggerDataSource) {
    return transformSwaggerData2Standard(data, this.config)
  }
}

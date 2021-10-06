import { BasePropertyType } from '../common/type'
import { PrimitiveTypeMap } from '../../primitiveTypeMap'
import { StandardDataType } from '../../standard/'
import { compolerUtils } from '../../compiler/'

import * as _ from 'lodash'
/**
 * @description 字段参数构造
 */
export class SwaggerSchema {
  /** 参数类型 */
  type?: BasePropertyType;
  /** 参数指向实体类路径 */
  $ref?: string;
  items?: {
    type?: BasePropertyType;
    $ref?: string;
  };

  additionalProperties?: SwaggerSchema;

  static parseSwaggerSchema2StandardDataType (
    schema: SwaggerSchema,
    defNames: string[],
    defOriginName: string,
    classTemplateArgs: StandardDataType[] = []
  ): StandardDataType {
    const { items, $ref, type, additionalProperties } = schema
    // const typeName = PrimitiveTypeMap[type] || type;
    // 数据类型为数组，需要对item的类型区分，分别处理
    if (type === 'array') {
      let itemsType = _.get(items, 'type', '')
      const itemsRef = _.get(items, '$ref', '')
      // 如果子类型为正常的type
      if (itemsType) {
        itemsType = PrimitiveTypeMap[itemsType] || itemsType
        let contentType = new StandardDataType([], itemsType, false, defOriginName)
        if (itemsType === 'array') {
          contentType = new StandardDataType([new StandardDataType()], 'Array', false, defOriginName)
        }

        return new StandardDataType([contentType], 'Array', false, defOriginName)
      }
      // 如果子类型为 api(ts)命名空间内的实体
      if (itemsRef) {
        const ast = compolerUtils.compileTemplate(itemsRef)
        const contentType = compolerUtils.parseAst2StandardDataType(ast, defNames, defOriginName, classTemplateArgs)

        return new StandardDataType([contentType], 'Array', false, defOriginName)
      }
    }
    // 如果数据类型为实体类
    if ($ref) {
      const ast = compolerUtils.compileTemplate($ref)

      if (!ast) {
        return new StandardDataType()
      }

      return compolerUtils.parseAst2StandardDataType(ast, defNames, defOriginName, classTemplateArgs)
    }

    if (type === 'object') {
      // 如果对象类型指向实体类
      if (additionalProperties) {
        const typeArgs = [
          new StandardDataType(),
          SwaggerSchema.parseSwaggerSchema2StandardDataType(
            additionalProperties,
            defNames,
            defOriginName
          )
        ]
        return new StandardDataType(typeArgs, PrimitiveTypeMap[type] || type, false, defOriginName)
      }
    }

    return new StandardDataType([], PrimitiveTypeMap[type] || type, false, defOriginName)
  }
}

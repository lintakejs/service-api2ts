import * as _ from 'lodash'
import { StandardDataType, StandardProperty, StandardBaseClass } from '../../standard'
import { BasePropertyType } from '../common/type'

// 请求body form结构
export interface YapiReqBodyFormItem {
  // 字段名称
  name: string;
  // 字段类型
  type: string;
  // 字段说明
  desc: string;
  // 是否必须
  required: '0' | '1';
}
// 请求params结构
export interface YapiReqParamItem {
  // 字段名称
  name: string;
  // 字段说明
  desc: string;
}
// 请求header结构
export interface YapiReqHeaderItem {
  // 字段名称
  name: string;
  // 字段类型
  type: string;
  // 字段说明
  desc: string;
  // 是否必须
  required: '0' | '1';
}
// 请求体query结构
export interface YapiReqQueryItem {
  // 字段名称
  name: string;
  // 字段类型
  type: string;
  // 字段说明
  desc: string;
  // 是否必须
  required: '0' | '1';
}
// 请求发出/返回参数结构
export class YapiProperty {
  // 字段说明
  description?= '';
  // 字段类型
  type: BasePropertyType;
  // 必须的字段列表
  required?: string[];
  // 如果是array类型的内置参数
  items?= null as YapiProperty;
  // 可能存在的对象类型参数
  properties: { [key in string]: YapiProperty }

  static parseYapiProperty2StandardDataType (
    resProperty: YapiProperty,
    requiredProps: string[],
    baseClasses: StandardBaseClass[],
    className: string,
    defOriginName: string
  ) {
    const type = resProperty.type
    const typeName = resProperty.type

    if (type === 'array') {
      const itemsType = _.get(resProperty.items, 'type', '')
      if (itemsType && itemsType !== 'object') {
        let contentType = new StandardDataType([], itemsType, false, defOriginName)
        if (itemsType === 'array') {
          contentType = new StandardDataType([new StandardDataType()], 'Array', false, defOriginName)
        }
        return new StandardDataType([contentType], 'Array', false, defOriginName)
      } else {
        const contentType = YapiProperty.parseYapiProperty2StandardDataType(
          resProperty.items,
          requiredProps,
          baseClasses,
          className + 'Item',
          defOriginName
        )

        return new StandardDataType([contentType], 'Array', false, defOriginName)
      }
    }

    // 有关prop是对象属性的该如何处理？
    if (type === 'object') {
      const typeArgs = [] as StandardDataType[]

      const props = _.map(resProperty.properties, (prop, propName) => {
        const dataType = YapiProperty.parseYapiProperty2StandardDataType(
          prop,
          requiredProps,
          baseClasses,
          className + propName.charAt(0).toUpperCase() + propName.slice(1),
          defOriginName
        )
        if (prop.type === 'object') {
          typeArgs.push(dataType)
        }
        return new StandardProperty({
          dataType,
          name: propName,
          description: prop.description,
          required: requiredProps.includes(propName)
        })
      })

      baseClasses.push(new StandardBaseClass({
        description: resProperty.description,
        name: className,
        properties: props,
        templateArgs: typeArgs
      }))

      return new StandardDataType(typeArgs, className, true, defOriginName)
    }

    return new StandardDataType([], typeName, false, defOriginName)
  }
}

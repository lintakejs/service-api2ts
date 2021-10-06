import { StandardBase, StandardProperty, StandardDataType } from './'
import { Surrounding } from '../config/config'

export class StandardInterface extends StandardBase {
  // 接口请求数据类型 -> application/json 之类
  consumes: string[]
  // 接口参数列表
  parameters: StandardProperty[]
  // 接口说明
  description: string
  // 返回值类型
  response: StandardDataType
  // 请求方式
  method: string
  // 接口名 -> 大概率没用
  name: string
  // 接口路径
  path: string

  constructor (inter: Partial<StandardInterface>) {
    super(inter)
  }

  get responseType () {
    return this.response.generateTsCode()
  }

  get bodyParamsCode () {
    const bodyParam = this.parameters.find(param => param.in === 'body')

    return (bodyParam && bodyParam.dataType.generateTsCode()) || ''
  }

  get paramsCode () {
    const paramsList = this.parameters.filter(param => param.in === 'path' || param.in === 'query')

    if (paramsList.length === 0) {
      return ''
    }

    return `class Params {
        ${paramsList.map(param => param.toPropertyCode(Surrounding.typeScript)).join('')}
      }
    `
  }

  get formParamsCode () {
    const formParamsList = this.parameters.filter(param => param.in === 'formData')

    if (formParamsList.length === 0) {
      return ''
    }

    return `class FormDataParams {
      ${formParamsList.map(param => param.toPropertyCode(Surrounding.typeScript)).join('')}
    }`
  }
}

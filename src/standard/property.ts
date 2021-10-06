import { StandardBase, StandardDataType } from './index'
import { Surrounding } from '../config/config'

export class StandardProperty extends StandardBase {
  // 参数基础类型
  dataType: StandardDataType
  // 参数说明
  description?: string
  // 参数名称
  name: string
  // 是否必须
  required: boolean
  // 存在请求报文中哪部分
  in: 'query' | 'body' | 'path' | 'formData' | 'header'

  constructor (prop: Partial<StandardProperty>) {
    super(prop)
  }

  /**
   * @description 生成参数 ts/js 类型代码
   * @param surrounding 生成代码类型
   */
  toPropertyCode (surrounding = Surrounding.typeScript) {
    const signal = this.required ? '' : '?'
    const fieldTypeOrValue = surrounding === Surrounding.typeScript ? `${signal}: ${this.dataType.generateTsCode()}` : ''
    return `
      /** ${this.description || this.name} */
      ${this.name}${fieldTypeOrValue}
    `
  }
}

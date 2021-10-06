import { StandardBase, StandardProperty, StandardDataType } from './index'
import * as _ from 'lodash'

export class StandardBaseClass extends StandardBase {
  // 基类名
  name: string
  // 基类说明
  description: string
  // 基类参数列表
  properties: Array<StandardProperty>
  // 基类包含其他基类列表
  templateArgs: StandardDataType[]

  constructor (base: Partial<StandardBaseClass>) {
    super(base)

    this.properties = _.orderBy(this.properties, 'name')
  }
}

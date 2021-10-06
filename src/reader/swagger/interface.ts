import { SwaggerParameter, SwaggerSchema } from './'
import { StandardInterface, StandardProperty } from '../../standard/'
import { getIdentifierFromUrl, getIdentifierFromOperatorId } from '../../utils'

import * as _ from 'lodash'

export type RequestMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

export class SwaggerInterface {
  /** 请求路径 */
  path: string;
  /** 说明 */
  summary: string;
  /** 全局唯一id */
  operationId: string;
  /** 资源 */
  tags: string[] = [];
  /** 请求method */
  method: RequestMethod;
  /** 请求参数列表 */
  parameters: SwaggerParameter[] = []

  static transformSwaggerInterface2StandardInterface (
    inter: SwaggerInterface,
    usingOperationId: boolean,
    samePath: string,
    defNames: string[],
    defOriginName: string
  ) {
    let name = ''

    if (!usingOperationId || !inter.operationId) {
      name = getIdentifierFromUrl(inter.path, inter.method, samePath)
    } else {
      name = getIdentifierFromOperatorId(inter.operationId)
    }

    const responseSchema = _.get(inter, 'responses.200.schema', {}) as SwaggerSchema
    const response = SwaggerSchema.parseSwaggerSchema2StandardDataType(responseSchema, defNames, defOriginName)

    const parameters = (inter.parameters || []).map(param => {
      const { description, items, required, name, type, schema } = param
      // 如果参数存在body中
      const paramSchema: SwaggerSchema = {
        items,
        type,
        $ref: _.get(schema, '$ref')
      }

      return new StandardProperty({
        in: param.in,
        description,
        required,
        name: name.includes('/') ? name.split('/').join('') : name,
        dataType: SwaggerSchema.parseSwaggerSchema2StandardDataType(paramSchema, defNames, defOriginName)
      })
    })

    return new StandardInterface({
      description: inter.summary,
      method: inter.method,
      path: inter.path,
      response,
      parameters,
      name
    })
  }
}

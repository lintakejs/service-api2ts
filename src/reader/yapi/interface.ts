import * as _ from 'lodash'
import { YapiReqBodyFormItem, YapiReqParamItem, YapiReqHeaderItem, YapiReqQueryItem, YapiProperty } from './'
import { StandardDataType, StandardProperty, StandardInterface, StandardBaseClass } from '../../standard'
import { getIdentifierFromUrl, toUpperFirstLetter } from '../../utils'

export class YapiInterface {
  // 服务模块名 - 需要手动设置，用于接口模块归属使用
  tagName: string;
  // 接口id
  id: string;
  // 接口名称
  title: string;
  // 请求路径
  path: string;
  // 请求方式
  method: string;
  // 请求数据类型
  req_body_type: 'row' | 'form' | 'json';
  // 请求body form结构结合
  req_body_form: YapiReqBodyFormItem[];
  // 请求params结构集合
  req_params: YapiReqParamItem[];
  // 请求header结构集合
  req_headers: YapiReqHeaderItem[];
  // 请求query结构集合
  req_query: YapiReqQueryItem[];
  // 请求body结构
  req_body_other: YapiProperty;
  // 请求返回数据类型
  res_body_type: 'row' | 'json';
  // 请求返回数据
  res_body: YapiProperty;

  static transformYapiInterface2Standard (inter: YapiInterface, baseClasses: StandardBaseClass[], defOriginName: string) {
    const name = getIdentifierFromUrl(inter.path, '')
    const requestBodyClassName = toUpperFirstLetter(inter.path + 'RequestBody')
    const responseClassName = toUpperFirstLetter(inter.path + 'Response')
    const response = new StandardDataType([], responseClassName, true, defOriginName)
    const parameters = [
      new StandardProperty({
        in: 'body',
        name: requestBodyClassName,
        required: !!baseClasses.find(base => base.name === requestBodyClassName),
        dataType: new StandardDataType([], requestBodyClassName, true, defOriginName)
      })
    ] as StandardProperty[]
    const standardInterface = new StandardInterface({
      consumes: [],
      description: inter.title,
      name,
      method: inter.method.toLocaleLowerCase(),
      path: inter.path,
      response,
      parameters: _.unionBy(parameters, 'name')
    })

    return standardInterface
  }
}

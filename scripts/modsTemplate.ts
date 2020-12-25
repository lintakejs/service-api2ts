import { Interface } from '../src/index'

export default function (int: Interface) {
  const bodyParams = int.bodyParamsCode
  const params = int.paramsCode

  return `
    import request from '@/utils/request'
    
    ${params !== '' ? `const paramsCode = ${params}` : ''}

    type paramsType = ${bodyParams ? bodyParams : (params ? 'typeof paramsCode' : 'any')}

    export default function (data: paramsType) {
      return request.${int.method}<${int.responseType}>('${int.path}', data)
    }
  `
}
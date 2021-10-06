import { BasePropertyType } from '../common/type'

export class SwaggerProperty {
  /** 参数类型 */
  type?: BasePropertyType;
  /** 如果 type === 'array' 才存在 */
  items? = null as {
    type?: BasePropertyType;
    $ref?: string;
  };

  /** 如果 type === 'object' 才存在 */
  additionalProperties?: SwaggerProperty;
  /** 指向实体类路径 */
  $ref? = '';
  /** 说明 */
  description? = '';
  /** 参数名称 */
  name: string;
}

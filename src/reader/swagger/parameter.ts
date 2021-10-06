import { BasePropertyType } from '../common/type'
import { SwaggerSchema } from './schema'

export class SwaggerParameter {
  /** 字段名 */
  name = '';
  /** 字段存在xmlhttp */
  in: 'query' | 'body' | 'path' | 'formData';
  /** 资源 */
  tags:string[] = [];
  /** 描述 */
  description = '';
  /** 是否必填 */
  required: boolean;
  /** 类型 */
  type: BasePropertyType;

  enum: string[];

  items? = null as {
    type?: BasePropertyType;
    $ref?: string;
  };

  schema: SwaggerSchema;
}

import { BasePropertyType } from '../common/type';
import { StandardDataType } from '../../standard/';
export declare class SwaggerSchema {
    type?: BasePropertyType;
    $ref?: string;
    items?: {
        type?: BasePropertyType;
        $ref?: string;
    };
    additionalProperties?: SwaggerSchema;
    static parseSwaggerSchema2StandardDataType(schema: SwaggerSchema, defNames: string[], defOriginName: string, classTemplateArgs?: StandardDataType[]): StandardDataType;
}

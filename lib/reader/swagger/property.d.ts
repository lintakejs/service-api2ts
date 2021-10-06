import { BasePropertyType } from '../common/type';
export declare class SwaggerProperty {
    type?: BasePropertyType;
    items?: {
        type?: BasePropertyType;
        $ref?: string;
    };
    additionalProperties?: SwaggerProperty;
    $ref?: string;
    description?: string;
    name: string;
}

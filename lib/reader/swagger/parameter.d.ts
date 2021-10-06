import { BasePropertyType } from '../common/type';
import { SwaggerSchema } from './schema';
export declare class SwaggerParameter {
    name: string;
    in: 'query' | 'body' | 'path' | 'formData';
    tags: string[];
    description: string;
    required: boolean;
    type: BasePropertyType;
    enum: string[];
    items?: {
        type?: BasePropertyType;
        $ref?: string;
    };
    schema: SwaggerSchema;
}

import { OriginBaseReader } from './base';
import { SwaggerInterface, SwaggerProperty } from './swagger/';
import { StandardDataSource } from '../standard/';
interface SwaggerPathItemObject {
    get?: SwaggerInterface;
    post?: SwaggerInterface;
    put?: SwaggerInterface;
    patch?: SwaggerInterface;
    delete?: SwaggerInterface;
}
interface SwaggerDataSource {
    tags: {
        name: string;
        description: string;
    }[];
    paths: {
        [key in string]: SwaggerPathItemObject;
    };
    definitions: {
        [key in string]: {
            description: string;
            required?: string[];
            properties: {
                [key in string]: SwaggerProperty;
            };
        };
    };
}
export declare class SwaggerV2Reader extends OriginBaseReader {
    transform2Standard(data: SwaggerDataSource): StandardDataSource;
}
export {};

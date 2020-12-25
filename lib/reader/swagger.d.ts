import { OriginBaseReader } from './base';
import { StandardDataType, StandardDataSource, Interface, Mod } from '../standard';
declare enum SwaggerType {
    integer = "integer",
    string = "string",
    file = "string",
    array = "array",
    number = "number",
    boolean = "boolean",
    object = "object"
}
declare class SwaggerProperty {
    type: SwaggerType;
    enum?: string[];
    items?: {
        type?: SwaggerType;
        $ref?: string;
    };
    additionalProperties: SwaggerProperty;
    $ref?: string;
    description?: string;
    name: string;
}
declare class SwaggerParameter {
    name: string;
    in: 'query' | 'body' | 'path';
    description: string;
    required: boolean;
    type: SwaggerType;
    enum: string[];
    items?: {
        type?: SwaggerType;
        $ref?: string;
    };
    schema: Schema;
}
declare class Schema {
    enum?: string[];
    type: SwaggerType;
    additionalProperties?: Schema;
    items: {
        type?: SwaggerType;
        $ref?: string;
    };
    $ref: string;
    static parseSwaggerSchema2StandardDataType(schema: Schema, defNames: string[], classTemplateArgs?: StandardDataType[], compileTemplateKeyword?: string): any;
}
declare class SwaggerInterface {
    consumes: string[];
    parameters: SwaggerParameter[];
    summary: string;
    description: string;
    initialValue: string;
    tags: string[];
    response: Schema;
    method: string;
    name: string;
    path: string;
    samePath: string;
    operationId: string;
    static transformSwaggerInterface2Standard(inter: SwaggerInterface, usingOperationId: boolean, samePath: string, defNames?: string[], compileTempateKeyword?: string): Interface;
}
interface SwaggerReferenceObject {
    $ref: string;
}
interface SwaggerPathItemObject {
    get?: SwaggerInterface;
    post?: SwaggerInterface;
    put?: SwaggerInterface;
    patch?: SwaggerInterface;
    delete?: SwaggerInterface;
    parameters?: SwaggerParameter[] | SwaggerReferenceObject[];
}
export declare function parseSwaggerEnumType(enumStrs: string[]): (string | number)[];
export declare class SwaggerDataSource {
    paths: {
        [key in string]: SwaggerPathItemObject;
    };
    tags: {
        name: string;
        description: string;
    }[];
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
    transform2Standard(data: any): StandardDataSource;
}
export declare class SwaggerV3Reader extends OriginBaseReader {
}
export declare function parseSwaggerMods(swagger: SwaggerDataSource, defNames: string[], usingOperationId: boolean, compileTempateKeyword?: string): Mod[];
export declare function transformSwaggerData2Standard(swagger: SwaggerDataSource, originName?: string, usingOperationId?: boolean): StandardDataSource;
export declare function compileTemplate(template: string, keyword?: string): import("../compiler").AstNode;
export {};

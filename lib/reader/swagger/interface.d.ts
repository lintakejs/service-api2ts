import { SwaggerParameter } from './';
import { StandardInterface } from '../../standard/';
export declare type RequestMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
export declare class SwaggerInterface {
    path: string;
    summary: string;
    operationId: string;
    tags: string[];
    method: RequestMethod;
    parameters: SwaggerParameter[];
    static transformSwaggerInterface2StandardInterface(inter: SwaggerInterface, usingOperationId: boolean, samePath: string, defNames: string[], defOriginName: string): StandardInterface;
}

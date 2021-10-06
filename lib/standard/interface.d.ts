import { StandardBase, StandardProperty, StandardDataType } from './';
export declare class StandardInterface extends StandardBase {
    consumes: string[];
    parameters: StandardProperty[];
    description: string;
    response: StandardDataType;
    method: string;
    name: string;
    path: string;
    constructor(inter: Partial<StandardInterface>);
    get responseType(): any;
    get bodyParamsCode(): any;
    get paramsCode(): string;
    get formParamsCode(): string;
}

import { StandardBaseClass } from '../../standard';
import { BasePropertyType } from '../common/type';
export interface YapiReqBodyFormItem {
    name: string;
    type: string;
    desc: string;
    required: '0' | '1';
}
export interface YapiReqParamItem {
    name: string;
    desc: string;
}
export interface YapiReqHeaderItem {
    name: string;
    type: string;
    desc: string;
    required: '0' | '1';
}
export interface YapiReqQueryItem {
    name: string;
    type: string;
    desc: string;
    required: '0' | '1';
}
export declare class YapiProperty {
    description?: string;
    type: BasePropertyType;
    required?: string[];
    items?: YapiProperty;
    properties: {
        [key in string]: YapiProperty;
    };
    static parseYapiProperty2StandardDataType(resProperty: YapiProperty, requiredProps: string[], baseClasses: StandardBaseClass[], className: string, defOriginName: string): any;
}

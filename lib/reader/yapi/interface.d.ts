import { YapiReqBodyFormItem, YapiReqParamItem, YapiReqHeaderItem, YapiReqQueryItem, YapiProperty } from './';
import { StandardInterface, StandardBaseClass } from '../../standard';
export declare class YapiInterface {
    tagName: string;
    id: string;
    title: string;
    path: string;
    method: string;
    req_body_type: 'row' | 'form' | 'json';
    req_body_form: YapiReqBodyFormItem[];
    req_params: YapiReqParamItem[];
    req_headers: YapiReqHeaderItem[];
    req_query: YapiReqQueryItem[];
    req_body_other: YapiProperty;
    res_body_type: 'row' | 'json';
    res_body: YapiProperty;
    static transformYapiInterface2Standard(inter: YapiInterface, baseClasses: StandardBaseClass[], defOriginName: string): StandardInterface;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardInterface = void 0;
const _1 = require("./");
const config_1 = require("../config/config");
class StandardInterface extends _1.StandardBase {
    constructor(inter) {
        super(inter);
    }
    get responseType() {
        return this.response.generateTsCode();
    }
    get bodyParamsCode() {
        const bodyParam = this.parameters.find(param => param.in === 'body');
        return (bodyParam && bodyParam.dataType.generateTsCode()) || '';
    }
    get paramsCode() {
        const paramsList = this.parameters.filter(param => param.in === 'path' || param.in === 'query');
        if (paramsList.length === 0) {
            return '';
        }
        return `class Params {
        ${paramsList.map(param => param.toPropertyCode(config_1.Surrounding.typeScript)).join('')}
      }
    `;
    }
    get formParamsCode() {
        const formParamsList = this.parameters.filter(param => param.in === 'formData');
        if (formParamsList.length === 0) {
            return '';
        }
        return `class FormDataParams {
      ${formParamsList.map(param => param.toPropertyCode(config_1.Surrounding.typeScript)).join('')}
    }`;
    }
}
exports.StandardInterface = StandardInterface;
//# sourceMappingURL=interface.js.map
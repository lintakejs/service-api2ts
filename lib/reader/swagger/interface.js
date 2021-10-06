"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerInterface = void 0;
const _1 = require("./");
const standard_1 = require("../../standard/");
const utils_1 = require("../../utils");
const _ = require("lodash");
class SwaggerInterface {
    constructor() {
        this.tags = [];
        this.parameters = [];
    }
    static transformSwaggerInterface2StandardInterface(inter, usingOperationId, samePath, defNames, defOriginName) {
        let name = '';
        if (!usingOperationId || !inter.operationId) {
            name = utils_1.getIdentifierFromUrl(inter.path, inter.method, samePath);
        }
        else {
            name = utils_1.getIdentifierFromOperatorId(inter.operationId);
        }
        const responseSchema = _.get(inter, 'responses.200.schema', {});
        const response = _1.SwaggerSchema.parseSwaggerSchema2StandardDataType(responseSchema, defNames, defOriginName);
        const parameters = (inter.parameters || []).map(param => {
            const { description, items, required, name, type, schema } = param;
            const paramSchema = {
                items,
                type,
                $ref: _.get(schema, '$ref')
            };
            return new standard_1.StandardProperty({
                in: param.in,
                description,
                required,
                name: name.includes('/') ? name.split('/').join('') : name,
                dataType: _1.SwaggerSchema.parseSwaggerSchema2StandardDataType(paramSchema, defNames, defOriginName)
            });
        });
        return new standard_1.StandardInterface({
            description: inter.summary,
            method: inter.method,
            path: inter.path,
            response,
            parameters,
            name
        });
    }
}
exports.SwaggerInterface = SwaggerInterface;
//# sourceMappingURL=interface.js.map
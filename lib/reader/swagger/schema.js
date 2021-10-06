"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerSchema = void 0;
const primitiveTypeMap_1 = require("../../primitiveTypeMap");
const standard_1 = require("../../standard/");
const compiler_1 = require("../../compiler/");
const _ = require("lodash");
class SwaggerSchema {
    static parseSwaggerSchema2StandardDataType(schema, defNames, defOriginName, classTemplateArgs = []) {
        const { items, $ref, type, additionalProperties } = schema;
        if (type === 'array') {
            let itemsType = _.get(items, 'type', '');
            const itemsRef = _.get(items, '$ref', '');
            if (itemsType) {
                itemsType = primitiveTypeMap_1.PrimitiveTypeMap[itemsType] || itemsType;
                let contentType = new standard_1.StandardDataType([], itemsType, false, defOriginName);
                if (itemsType === 'array') {
                    contentType = new standard_1.StandardDataType([new standard_1.StandardDataType()], 'Array', false, defOriginName);
                }
                return new standard_1.StandardDataType([contentType], 'Array', false, defOriginName);
            }
            if (itemsRef) {
                const ast = compiler_1.compolerUtils.compileTemplate(itemsRef);
                const contentType = compiler_1.compolerUtils.parseAst2StandardDataType(ast, defNames, defOriginName, classTemplateArgs);
                return new standard_1.StandardDataType([contentType], 'Array', false, defOriginName);
            }
        }
        if ($ref) {
            const ast = compiler_1.compolerUtils.compileTemplate($ref);
            if (!ast) {
                return new standard_1.StandardDataType();
            }
            return compiler_1.compolerUtils.parseAst2StandardDataType(ast, defNames, defOriginName, classTemplateArgs);
        }
        if (type === 'object') {
            if (additionalProperties) {
                const typeArgs = [
                    new standard_1.StandardDataType(),
                    SwaggerSchema.parseSwaggerSchema2StandardDataType(additionalProperties, defNames, defOriginName)
                ];
                return new standard_1.StandardDataType(typeArgs, primitiveTypeMap_1.PrimitiveTypeMap[type] || type, false, defOriginName);
            }
        }
        return new standard_1.StandardDataType([], primitiveTypeMap_1.PrimitiveTypeMap[type] || type, false, defOriginName);
    }
}
exports.SwaggerSchema = SwaggerSchema;
//# sourceMappingURL=schema.js.map
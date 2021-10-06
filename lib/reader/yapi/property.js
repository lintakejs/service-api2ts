"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YapiProperty = void 0;
const _ = require("lodash");
const standard_1 = require("../../standard");
class YapiProperty {
    constructor() {
        this.description = '';
        this.items = null;
    }
    static parseYapiProperty2StandardDataType(resProperty, requiredProps, baseClasses, className, defOriginName) {
        const type = resProperty.type;
        const typeName = resProperty.type;
        if (type === 'array') {
            const itemsType = _.get(resProperty.items, 'type', '');
            if (itemsType && itemsType !== 'object') {
                let contentType = new standard_1.StandardDataType([], itemsType, false, defOriginName);
                if (itemsType === 'array') {
                    contentType = new standard_1.StandardDataType([new standard_1.StandardDataType()], 'Array', false, defOriginName);
                }
                return new standard_1.StandardDataType([contentType], 'Array', false, defOriginName);
            }
            else {
                const contentType = YapiProperty.parseYapiProperty2StandardDataType(resProperty.items, requiredProps, baseClasses, className + 'Item', defOriginName);
                return new standard_1.StandardDataType([contentType], 'Array', false, defOriginName);
            }
        }
        if (type === 'object') {
            const typeArgs = [];
            const props = _.map(resProperty.properties, (prop, propName) => {
                const dataType = YapiProperty.parseYapiProperty2StandardDataType(prop, requiredProps, baseClasses, className + propName.charAt(0).toUpperCase() + propName.slice(1), defOriginName);
                if (prop.type === 'object') {
                    typeArgs.push(dataType);
                }
                return new standard_1.StandardProperty({
                    dataType,
                    name: propName,
                    description: prop.description,
                    required: requiredProps.includes(propName)
                });
            });
            baseClasses.push(new standard_1.StandardBaseClass({
                description: resProperty.description,
                name: className,
                properties: props,
                templateArgs: typeArgs
            }));
            return new standard_1.StandardDataType(typeArgs, className, true, defOriginName);
        }
        return new standard_1.StandardDataType([], typeName, false, defOriginName);
    }
}
exports.YapiProperty = YapiProperty;
//# sourceMappingURL=property.js.map
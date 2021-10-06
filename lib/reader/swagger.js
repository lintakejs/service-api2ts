"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerV2Reader = void 0;
const base_1 = require("./base");
const swagger_1 = require("./swagger/");
const compiler_1 = require("../compiler/");
const standard_1 = require("../standard/");
const utils_1 = require("../utils");
const _ = require("lodash");
function transfromSwaggerDefinition2BaseClass(swagger, config) {
    const draftClasses = _.map(swagger.definitions, (def, defName) => {
        const defNameAst = compiler_1.compolerUtils.compileTemplate(defName);
        if (!defNameAst) {
            throw new Error('compiler error in definitionName: ' + defName);
        }
        return {
            name: defNameAst.name,
            defNameAst,
            def
        };
    });
    const defNames = draftClasses.map(clazz => clazz.name);
    const baseClasses = draftClasses.map(clazz => {
        const dataType = compiler_1.compolerUtils.parseAst2StandardDataType(clazz.defNameAst, defNames, config.name);
        const templateArgs = dataType.typeArgs;
        const { description, properties } = clazz.def;
        const requiredProps = clazz.def.required || [];
        const props = _.map(properties, (prop, propName) => {
            const { $ref, description, type, items, additionalProperties } = prop;
            const required = requiredProps.includes(propName);
            const dataType = swagger_1.SwaggerSchema.parseSwaggerSchema2StandardDataType({
                $ref,
                items,
                type,
                additionalProperties
            }, defNames, config.name, templateArgs);
            return new standard_1.StandardProperty({
                dataType,
                name: propName,
                description,
                required
            });
        });
        return new standard_1.StandardBaseClass({
            description,
            name: clazz.name,
            properties: props,
            templateArgs
        });
    });
    baseClasses.sort((pre, next) => {
        if (pre.name === next.name && pre.templateArgs.length === next.templateArgs.length) {
            return pre.templateArgs.filter(({ isDefsType }) => isDefsType).length >
                next.templateArgs.filter(({ isDefsType }) => isDefsType).length
                ? -1
                : 1;
        }
        if (pre.name === next.name) {
            return pre.templateArgs.length > next.templateArgs.length ? -1 : 1;
        }
        return next.name > pre.name ? 1 : -1;
    });
    return {
        draftClasses,
        defNames,
        baseClasses
    };
}
function transformSwaggerPath2Mods(swagger, defNames, usingOperationId, defOriginName) {
    const allSwaggerInterfaces = [];
    _.map(swagger.paths, (pathItem, path) => {
        _.forEach(pathItem, (inter, method) => {
            inter.path = path;
            inter.method = method;
            allSwaggerInterfaces.push(inter);
        });
    });
    const mods = swagger.tags.map(tag => {
        const modInterfaces = allSwaggerInterfaces.filter(inter => (inter.tags.includes(tag.name) ||
            inter.tags.includes(tag.name.toLowerCase()) ||
            inter.tags.includes(tag.description.toLowerCase()) ||
            inter.tags.includes(utils_1.toDashCase(tag.description))));
        const samePath = utils_1.getMaxSamePath(modInterfaces.map(inter => inter.path.slice(1)));
        const standardInterfaces = modInterfaces.map(inter => swagger_1.SwaggerInterface.transformSwaggerInterface2StandardInterface(inter, usingOperationId, samePath, defNames, defOriginName));
        const names = [];
        standardInterfaces.forEach(inter => {
            if (!names.includes(inter.name)) {
                names.push(inter.name);
            }
            else {
                inter.name = utils_1.getIdentifierFromUrl(inter.path, inter.method, samePath);
            }
        });
        if (utils_1.hasChinese(tag.name)) {
            return new standard_1.StandardMod({
                description: tag.description,
                interfaces: standardInterfaces,
                name: utils_1.transformCamelCase(tag.description)
            });
        }
        else {
            return new standard_1.StandardMod({
                description: tag.description,
                interfaces: standardInterfaces,
                name: utils_1.transformCamelCase(tag.name)
            });
        }
    }).filter(mod => mod.interfaces.length);
    return mods;
}
function transformSwaggerData2Standard(swagger, config, usingOperationId = true) {
    const { baseClasses, defNames } = transfromSwaggerDefinition2BaseClass(swagger, config);
    const mods = transformSwaggerPath2Mods(swagger, defNames, usingOperationId, config.name);
    return new standard_1.StandardDataSource({
        name: config.name,
        baseClasses: _.uniqBy(baseClasses, base => base.name),
        mods
    });
}
class SwaggerV2Reader extends base_1.OriginBaseReader {
    transform2Standard(data) {
        return transformSwaggerData2Standard(data, this.config);
    }
}
exports.SwaggerV2Reader = SwaggerV2Reader;
//# sourceMappingURL=swagger.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardDataSource = exports.Mod = exports.BaseClass = exports.Property = exports.StandardDataType = exports.Interface = void 0;
const _ = require("lodash");
const config_1 = require("./config/config");
class Contextable {
    constructor(arg = {}) {
        _.forEach(arg, (value, key) => {
            if (value !== undefined) {
                this[key] = value;
            }
        });
    }
    getDsName() {
        const context = this.getContext();
        if (context && context.dataSource) {
            return context.dataSource.name;
        }
        return '';
    }
    getContext() {
        return this.context;
    }
}
class Interface extends Contextable {
    constructor(inter) {
        super(inter);
    }
    get responseType() {
        return this.response.generateCode(this.getDsName());
    }
    getBodyParamsCode() {
        const bodyParam = this.parameters.find(param => param.in === 'body');
        return bodyParam || '';
    }
    getParamsCode(surrounding = config_1.Surrounding.typeScript) {
        return `class Params {
        ${this.parameters
            .filter(param => param.in === 'path' || param.in === 'query')
            .map(param => param.toPropertyCode(surrounding, true))
            .join('')}
      }
    `;
    }
}
exports.Interface = Interface;
class StandardDataType extends Contextable {
    constructor(typeArgs = [], typeName = '', isDefsType = false, templateIndex = -1) {
        super();
        this.typeArgs = typeArgs;
        this.typeName = typeName;
        this.isDefsType = isDefsType;
        this.templateIndex = templateIndex;
        this.enum = [];
        this.typeProperties = [];
    }
    setEnum(enums = []) {
        this.enum = enums.map(value => {
            if (typeof value === 'string') {
                if (!value.startsWith("'")) {
                    value = "'" + value;
                }
                if (!value.endsWith("'")) {
                    value = value + "'";
                }
            }
            return value;
        });
    }
    static constructorWithEnum(enums = []) {
        const dataType = new StandardDataType();
        dataType.setEnum(enums);
        return dataType;
    }
    setTemplateIndex(classTemplateArgs) {
        const codes = classTemplateArgs.map(arg => arg.generateCode());
        const index = codes.indexOf(this.generateCode());
        this.typeArgs.forEach(arg => arg.setTemplateIndex(classTemplateArgs));
        this.templateIndex = index;
    }
    getEnumType() {
        return this.enum.join(' | ') || 'string';
    }
    getDefName(originName) {
        let name = this.typeName;
        if (this.isDefsType) {
            name = originName ? `defs.${originName}.${this.typeName}` : `defs.${this.typeName}`;
        }
        return name;
    }
    generateCode(originName = '') {
        if (this.templateIndex !== -1) {
            return `T${this.templateIndex}`;
        }
        if (this.enum.length) {
            return this.getEnumType();
        }
        const name = this.getDefName(originName);
        if (this.typeArgs.length) {
            return `${name}<${this.typeArgs.map(arg => arg.generateCode(originName)).join(', ')}>`;
        }
        if (this.typeProperties.length) {
            const interfaceCode = `{${this.typeProperties.map(property => property.toPropertyCode())}
      }`;
            if (name) {
                return `${name}<${interfaceCode}>`;
            }
            return interfaceCode;
        }
        return name || 'any';
    }
    getInitialValue(usingDef = true) {
        if (this.typeName === 'Array') {
            return '[]';
        }
        if (this.isDefsType) {
            const originName = this.getDsName();
            if (!usingDef) {
                return `new ${this.typeName}()`;
            }
            return `new ${this.getDefName(originName)}()`;
        }
        if (this.templateIndex > -1) {
            return 'undefined';
        }
        if (this.typeName === 'string') {
            return "''";
        }
        if (this.typeName === 'boolean') {
            return 'false';
        }
        if (this.enum && this.enum.length) {
            const str = this.enum[0];
            if (typeof str === 'string') {
                return `${str}`;
            }
            return str + '';
        }
        return 'undefined';
    }
}
exports.StandardDataType = StandardDataType;
class Property extends Contextable {
    constructor(prop) {
        super(prop);
    }
    toPropertyCode(surrounding = config_1.Surrounding.typeScript, hasRequired = false, optional = false) {
        let optionalSignal = hasRequired && optional ? '?' : '';
        if (hasRequired && !this.required) {
            optionalSignal = '?';
        }
        let name = this.name;
        if (!name.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/)) {
            name = `'${name}'`;
        }
        const fieldTypeDeclaration = surrounding === config_1.Surrounding.javaScript
            ? ''
            : `${optionalSignal}: ${this.dataType.generateCode(this.getDsName())}`;
        return `
      /** ${this.description || this.name} */
      ${name}${fieldTypeDeclaration}`;
    }
    toPropertyCodeWithInitValue(baseName = '') {
        let typeWithValue = `= ${this.dataType.getInitialValue(false)}`;
        if (!this.dataType.getInitialValue(false)) {
            typeWithValue = `: ${this.dataType.generateCode(this.getDsName())}`;
        }
        if (this.dataType.typeName === baseName) {
            typeWithValue = `= {}`;
        }
        let name = this.name;
        if (!name.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/)) {
            name = `'${name}'`;
        }
        return `
      /** ${this.description || this.name} */
      ${name} ${typeWithValue}
      `;
    }
}
exports.Property = Property;
class BaseClass extends Contextable {
    constructor(base) {
        super(base);
        this.properties = _.orderBy(this.properties, 'name');
    }
}
exports.BaseClass = BaseClass;
class Mod extends Contextable {
    constructor(mod) {
        super(mod);
        this.interfaces = _.orderBy(this.interfaces, 'path');
    }
}
exports.Mod = Mod;
class StandardDataSource {
    constructor(standard) {
        this.name = standard.name;
        this.baseClasses = standard.baseClasses;
        this.mods = standard.mods;
        this.reOrder();
    }
    reOrder() {
        this.baseClasses = _.orderBy(this.baseClasses, 'name');
        this.mods = _.orderBy(this.mods, 'name');
    }
}
exports.StandardDataSource = StandardDataSource;
//# sourceMappingURL=standard.js.map
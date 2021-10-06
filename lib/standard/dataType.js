"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardDataType = void 0;
class StandardDataType {
    constructor(typeArgs = [], typeName = '', isDefsType = false, defOriginName = '', templateIndex = -1) {
        this.typeArgs = typeArgs;
        this.typeName = typeName;
        this.isDefsType = isDefsType;
        this.defOriginName = defOriginName;
        this.templateIndex = templateIndex;
    }
    setTemplateIndex(classTemplateArgs) {
        const codes = classTemplateArgs.map(arg => arg.generateTsCode());
        const index = codes.indexOf(this.generateTsCode());
        this.typeArgs.forEach(arg => arg.setTemplateIndex(classTemplateArgs));
        this.templateIndex = index;
    }
    getDefsTypeName() {
        return this.isDefsType ? `${this.defOriginName}.${this.typeName}` : `${this.typeName}`;
    }
    generateTsCode() {
        if (this.templateIndex !== -1) {
            return `T${this.templateIndex}`;
        }
        const name = this.getDefsTypeName();
        if (this.typeArgs.length) {
            return `${name}<${this.typeArgs.map(arg => arg.generateTsCode()).join(', ')}>`;
        }
        return name || 'any';
    }
}
exports.StandardDataType = StandardDataType;
//# sourceMappingURL=dataType.js.map
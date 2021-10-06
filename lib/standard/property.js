"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardProperty = void 0;
const index_1 = require("./index");
const config_1 = require("../config/config");
class StandardProperty extends index_1.StandardBase {
    constructor(prop) {
        super(prop);
    }
    toPropertyCode(surrounding = config_1.Surrounding.typeScript) {
        const signal = this.required ? '' : '?';
        const fieldTypeOrValue = surrounding === config_1.Surrounding.typeScript ? `${signal}: ${this.dataType.generateTsCode()}` : '';
        return `
      /** ${this.description || this.name} */
      ${this.name}${fieldTypeOrValue}
    `;
    }
}
exports.StandardProperty = StandardProperty;
//# sourceMappingURL=property.js.map
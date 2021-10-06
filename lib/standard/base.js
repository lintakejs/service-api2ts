"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardBase = void 0;
const _ = require("lodash");
class StandardBase {
    constructor(arg = {}) {
        _.forEach(arg, (value, key) => {
            if (value !== undefined) {
                this[key] = value;
            }
        });
    }
}
exports.StandardBase = StandardBase;
//# sourceMappingURL=base.js.map
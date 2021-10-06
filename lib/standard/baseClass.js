"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardBaseClass = void 0;
const index_1 = require("./index");
const _ = require("lodash");
class StandardBaseClass extends index_1.StandardBase {
    constructor(base) {
        super(base);
        this.properties = _.orderBy(this.properties, 'name');
    }
}
exports.StandardBaseClass = StandardBaseClass;
//# sourceMappingURL=baseClass.js.map
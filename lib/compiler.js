"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAst2StandardDataType = exports.Parser = exports.Token = void 0;
const primitiveTypeMap_1 = require("./primitiveTypeMap");
const standard_1 = require("./standard");
class Token {
    constructor(type, value = '') {
        this.type = type;
        this.value = value;
    }
}
exports.Token = Token;
class Parser {
    constructor(nodes) {
        this.nodes = nodes;
    }
    eat(type) {
        if (this.nodes.length && this.nodes[0].type === type) {
            const node = this.nodes[0];
            this.nodes = this.nodes.slice(1);
            return node;
        }
        else {
            console.error('current nodes', this.nodes);
            throw Error('the first node type is not ' + type + " in template parser's eat method");
        }
    }
    check(type) {
        if (this.nodes.length && this.nodes[0].type === type) {
            return true;
        }
        return false;
    }
    parserTemplateArgs() {
        const args = [];
        args[0] = this.parseTemplate();
        while (this.check('Comma')) {
            this.eat('Comma');
            args.push(this.parseTemplate());
        }
        return args;
    }
    parseTemplate() {
        const name = this.eat('Identifier').value;
        let templateArgs = [];
        if (this.check('PreTemplate')) {
            this.eat('PreTemplate');
            templateArgs = this.parserTemplateArgs();
            this.eat('EndTemplate');
        }
        return {
            type: 'Template',
            name,
            templateArgs
        };
    }
}
exports.Parser = Parser;
function parseAst2StandardDataType(ast, defNames, classTemplateArgs = []) {
    const { name, templateArgs } = ast;
    let typeName = primitiveTypeMap_1.PrimitiveTypeMap[name] || name;
    const isDefsType = defNames.includes(name);
    const typeArgs = templateArgs.map(arg => {
        return parseAst2StandardDataType(arg, defNames, classTemplateArgs);
    });
    const dataType = new standard_1.StandardDataType(typeArgs, typeName, isDefsType);
    dataType.setTemplateIndex(classTemplateArgs);
    return dataType;
}
exports.parseAst2StandardDataType = parseAst2StandardDataType;
//# sourceMappingURL=compiler.js.map
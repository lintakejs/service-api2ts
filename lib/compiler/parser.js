"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const token_1 = require("./token");
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
        while (this.check(token_1.TokenType.Comma)) {
            this.eat(token_1.TokenType.Comma);
            args.push(this.parseTemplate());
        }
        return args;
    }
    parseTemplate() {
        const name = this.eat(token_1.TokenType.Identifier).value;
        let templateArgs = [];
        if (this.check(token_1.TokenType.PreTemplate)) {
            this.eat(token_1.TokenType.PreTemplate);
            templateArgs = this.parserTemplateArgs();
            this.eat(token_1.TokenType.EndTemplate);
        }
        return {
            name,
            templateArgs
        };
    }
}
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map
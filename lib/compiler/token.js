"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = exports.TokenTypeRegs = exports.TokenType = void 0;
var TokenType;
(function (TokenType) {
    TokenType["Identifier"] = "Identifier";
    TokenType["PreTemplate"] = "PreTemplate";
    TokenType["EndTemplate"] = "EndTemplate";
    TokenType["Comma"] = "Comma";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
exports.TokenTypeRegs = {
    [TokenType.Identifier]: /^[a-zA-Z_][a-zA-Z_0-9-]*/,
    [TokenType.PreTemplate]: /^«/,
    [TokenType.EndTemplate]: /^»/,
    [TokenType.Comma]: /^,/
};
class Token {
    constructor(type, value = '') {
        this.type = type;
        this.value = value;
    }
}
exports.Token = Token;
//# sourceMappingURL=token.js.map
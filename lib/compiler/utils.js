"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAst2StandardDataType = exports.compileTemplate = void 0;
const _1 = require("./");
const primitiveTypeMap_1 = require("../primitiveTypeMap");
const standard_1 = require("../standard/");
function compileTemplate(template, keyword = '#/definitions/') {
    if (template.startsWith(keyword)) {
        template = template.slice(keyword.length);
    }
    if (!template) {
        return null;
    }
    let code = template;
    let matchedText = '';
    const nodes = [];
    while (code) {
        code = code.replace(/\s/g, '');
        code = code.replace(/\./g, '_');
        if (code.match(_1.TokenTypeRegs.Identifier)) {
            matchedText = code.match(_1.TokenTypeRegs.Identifier)[0];
            nodes.push(new _1.Token(_1.TokenType.Identifier, matchedText));
        }
        else if (code.match(_1.TokenTypeRegs.PreTemplate)) {
            matchedText = code.match(_1.TokenTypeRegs.PreTemplate)[0];
            nodes.push(new _1.Token(_1.TokenType.PreTemplate, matchedText));
        }
        else if (code.match(_1.TokenTypeRegs.EndTemplate)) {
            matchedText = code.match(_1.TokenTypeRegs.EndTemplate)[0];
            nodes.push(new _1.Token(_1.TokenType.EndTemplate, matchedText));
        }
        else if (code.match(_1.TokenTypeRegs.Comma)) {
            matchedText = code.match(_1.TokenTypeRegs.Comma)[0];
            nodes.push(new _1.Token(_1.TokenType.Comma, matchedText));
        }
        else {
            return null;
        }
        code = code.slice(matchedText.length);
    }
    return new _1.Parser(nodes).parseTemplate();
}
exports.compileTemplate = compileTemplate;
function parseAst2StandardDataType(ast, defNames, defOriginName, classTemplateArgs = []) {
    const { name, templateArgs } = ast;
    const typeName = primitiveTypeMap_1.PrimitiveTypeMap[name] || name;
    const isDefsType = defNames.includes(name);
    const typeArgs = templateArgs.map(arg => parseAst2StandardDataType(arg, defNames, defOriginName, classTemplateArgs));
    const dataType = new standard_1.StandardDataType(typeArgs, typeName, isDefsType, defOriginName);
    dataType.setTemplateIndex(classTemplateArgs);
    return dataType;
}
exports.parseAst2StandardDataType = parseAst2StandardDataType;
//# sourceMappingURL=utils.js.map
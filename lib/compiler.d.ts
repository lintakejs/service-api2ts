import { StandardDataType } from "./standard";
export declare class Token {
    type: 'Identifier' | 'PreTemplate' | 'EndTemplate' | 'Comma';
    value: string;
    constructor(type: 'Identifier' | 'PreTemplate' | 'EndTemplate' | 'Comma', value?: string);
}
export interface AstNode {
    name: string;
    templateArgs: AstNode[];
}
export declare class Parser {
    private nodes;
    constructor(nodes: Token[]);
    eat(type: 'Identifier' | 'PreTemplate' | 'EndTemplate' | 'Comma'): Token;
    check(type: 'Identifier' | 'PreTemplate' | 'EndTemplate' | 'Comma'): boolean;
    parserTemplateArgs(): any[];
    parseTemplate(): AstNode;
}
export declare function parseAst2StandardDataType(ast: AstNode, defNames: string[], classTemplateArgs?: StandardDataType[]): StandardDataType;

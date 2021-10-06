import { Token } from './token';
export interface AstNode {
    name: string;
    templateArgs: AstNode[];
}
export declare class Parser {
    private nodes;
    constructor(nodes: Token[]);
    private eat;
    private check;
    private parserTemplateArgs;
    parseTemplate(): AstNode;
}

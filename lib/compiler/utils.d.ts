import { AstNode } from './';
import { StandardDataType } from '../standard/';
export declare function compileTemplate(template: string, keyword?: string): AstNode;
export declare function parseAst2StandardDataType(ast: AstNode, defNames: string[], defOriginName: string, classTemplateArgs?: StandardDataType[]): StandardDataType;

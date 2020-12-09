import { PrimitiveTypeMap } from "./primitiveTypeMap";
import { StandardDataType } from "./standard";

export class Token {
  constructor(public type: 'Identifier' | 'PreTemplate' | 'EndTemplate' | 'Comma', public value = '') {}
}

interface AstNode {
  name: string;
  templateArgs: AstNode[];
}

export class Parser {
  constructor(private nodes: Token[]) {}

  eat(type: 'Identifier' | 'PreTemplate' | 'EndTemplate' | 'Comma') {
    if (this.nodes.length && this.nodes[0].type === type) {
      const node = this.nodes[0];
      this.nodes = this.nodes.slice(1);

      return node;
    } else {
      console.error('current nodes', this.nodes);
      throw Error('the first node type is not ' + type + " in template parser's eat method");
    }
  }

  check(type: 'Identifier' | 'PreTemplate' | 'EndTemplate' | 'Comma') {
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

  // 语法分析
  parseTemplate() {
    const name = this.eat('Identifier').value;
    let templateArgs = [] as any[];

    if (this.check('PreTemplate')) {
      this.eat('PreTemplate');
      templateArgs = this.parserTemplateArgs();
      this.eat('EndTemplate');
    }

    return {
      type: 'Template',
      name,
      templateArgs
    } as AstNode;
  }
}

/** ast 转换为标准类型 */
export function parseAst2StandardDataType(
  ast: AstNode,
  defNames: string[],
  classTemplateArgs: StandardDataType[] = []
): StandardDataType {
  const { name, templateArgs } = ast
  // 怪异类型兼容
  let typeName = PrimitiveTypeMap[name] || name

  const isDefsType = defNames.includes(name)
  const typeArgs = templateArgs.map(arg => {
    return parseAst2StandardDataType(arg, defNames, classTemplateArgs);
  })

  const dataType = new StandardDataType(typeArgs, typeName, isDefsType)
  dataType.setTemplateIndex(classTemplateArgs)

  return dataType;
}
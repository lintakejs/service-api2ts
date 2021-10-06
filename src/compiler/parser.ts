import { Token, TokenType } from './token'

export interface AstNode {
  name: string;
  templateArgs: AstNode[];
}

/**
 * @description 对Dto«otherDto» | Dto«otherDto, otherDto»类型词法解析，输出astNode
 */
export class Parser {
  /**
   * @param nodes 词法列表 - 包含 词法类型 与 词法值
   */
  constructor (private nodes: Token[]) {}
  /**
   * @description 解析词法，返回词法对象，并输出剩余未解析词法列表
   * @param type 词法类型
   */
  private eat (type: TokenType) {
    if (this.nodes.length && this.nodes[0].type === type) {
      const node = this.nodes[0]
      this.nodes = this.nodes.slice(1)

      return node
    } else {
      console.error('current nodes', this.nodes)
      throw Error('the first node type is not ' + type + " in template parser's eat method")
    }
  }

  /**
   * @description 鉴定是否符合词法类型
   * @param type 词法类型
   */
  private check (type: TokenType) {
    if (this.nodes.length && this.nodes[0].type === type) {
      return true
    }

    return false
  }

  /**
   * @description 解析输出词法列表
   */
  private parserTemplateArgs () {
    const args: AstNode[] = []
    args[0] = this.parseTemplate()

    // 如果存在 , 分割词法，需要去除后并入解析后的词法列表
    while (this.check(TokenType.Comma)) {
      this.eat(TokenType.Comma)
      args.push(this.parseTemplate())
    }

    return args
  }

  /**
   * @description 对外围存在的 «» 对去除
   */
  parseTemplate (): AstNode {
    const name = this.eat(TokenType.Identifier).value
    let templateArgs: AstNode[] = []

    if (this.check(TokenType.PreTemplate)) {
      this.eat(TokenType.PreTemplate)
      templateArgs = this.parserTemplateArgs()
      this.eat(TokenType.EndTemplate)
    }

    return {
      name,
      templateArgs
    }
  }
}

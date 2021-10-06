import { Token, TokenType, TokenTypeRegs, Parser, AstNode } from './'
import { PrimitiveTypeMap } from '../primitiveTypeMap'
import { StandardDataType } from '../standard/'

/**
 * @description 对复杂java实体类名称解析
 * @param template java实体类名称
 * @param keyword 需要去除的前缀
 */
export function compileTemplate (template: string, keyword = '#/definitions/') {
  if (template.startsWith(keyword)) {
    template = template.slice(keyword.length)
  }
  if (!template) {
    return null
  }

  let code = template
  let matchedText = ''
  const nodes = [] as Token[]

  while (code) {
    // 去掉空格,包括两端及中间的空格
    code = code.replace(/\s/g, '')
    // 替换.为_
    code = code.replace(/\./g, '_')

    if (code.match(TokenTypeRegs.Identifier)) {
      matchedText = code.match(TokenTypeRegs.Identifier)[0]

      nodes.push(new Token(TokenType.Identifier, matchedText))
    } else if (code.match(TokenTypeRegs.PreTemplate)) {
      matchedText = code.match(TokenTypeRegs.PreTemplate)[0]

      nodes.push(new Token(TokenType.PreTemplate, matchedText))
    } else if (code.match(TokenTypeRegs.EndTemplate)) {
      matchedText = code.match(TokenTypeRegs.EndTemplate)[0]

      nodes.push(new Token(TokenType.EndTemplate, matchedText))
    } else if (code.match(TokenTypeRegs.Comma)) {
      matchedText = code.match(TokenTypeRegs.Comma)[0]

      nodes.push(new Token(TokenType.Comma, matchedText))
    } else {
      return null
    }

    code = code.slice(matchedText.length)
  }

  return new Parser(nodes).parseTemplate()
}
/**
 * @description 将词法树转为标准数据类
 * @param ast 词法树
 * @param defNames api(ts)命名空间内的实体类名称
 */
export function parseAst2StandardDataType (
  ast: AstNode,
  defNames: string[],
  defOriginName: string,
  classTemplateArgs: StandardDataType[] = []
): StandardDataType {
  const { name, templateArgs } = ast
  // 怪异类型兼容
  const typeName = PrimitiveTypeMap[name] || name
  // 判断参数是否为实体类包含于api(ts)的命名空间内
  const isDefsType = defNames.includes(name)

  const typeArgs = templateArgs.map(arg => parseAst2StandardDataType(arg, defNames, defOriginName, classTemplateArgs))

  const dataType = new StandardDataType(typeArgs, typeName, isDefsType, defOriginName)
  dataType.setTemplateIndex(classTemplateArgs)
  return dataType
}

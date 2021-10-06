export enum TokenType {
  Identifier = 'Identifier',
  PreTemplate = 'PreTemplate',
  EndTemplate = 'EndTemplate',
  Comma = 'Comma'
}

export const TokenTypeRegs = {
  [TokenType.Identifier]: /^[a-zA-Z_][a-zA-Z_0-9-]*/,
  [TokenType.PreTemplate]: /^«/,
  [TokenType.EndTemplate]: /^»/,
  [TokenType.Comma]: /^,/
}

export class Token {
  constructor (public type: TokenType, public value = '') {}
}

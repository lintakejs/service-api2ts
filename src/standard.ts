import * as _ from 'lodash'
import { Surrounding } from './config/config'

class Contextable {
  private context: any
  
  constructor(arg = {}) {
    _.forEach(arg, (value, key) => {
      if (value !== undefined) {
        this[key] = value
      }
    })
  }

  getDsName() {
    const context = this.getContext()

    if (context && context.dataSource) {
      return context.dataSource.name
    }

    return ''
  }

  getContext() {
    return this.context
  }
}

export class Interface extends Contextable {
  consumes: string[]
  parameters: Property[]
  description: string
  response: StandardDataType
  method: string
  name: string
  path: string

  constructor(inter: Partial<Interface>) {
    super(inter)
  }

  get responseType() {
    return this.response.generateCode(this.getDsName())
  }

  getBodyParamsCode() {
    const bodyParam = this.parameters.find(param => param.in === 'body')

    return (bodyParam && bodyParam.dataType.generateCode(this.getDsName())) || ''
  }

  getParamsCode(className = 'Params', surrounding = Surrounding.typeScript) {
    return `class ${className} {
        ${this.parameters
          .filter(param => param.in === 'path' || param.in === 'query')
          .map(param => param.toPropertyCode(surrounding, true))
          .join('')}
      }
    `
  }
}

export class StandardDataType extends Contextable {
  enum: Array<string | number> = []

  setEnum(enums: Array<string | number> = []) {
    this.enum = enums.map(value => {
      if (typeof value === 'string') {
        if (!value.startsWith("'")) {
          value = "'" + value
        }

        if (!value.endsWith("'")) {
          value = value + "'"
        }
      }

      return value
    })
  }

  typeProperties: Property[] = []

  constructor(
    public typeArgs = [] as StandardDataType[],
    public typeName = '',
    public isDefsType = false,
    public templateIndex = -1
  ){
    super()
  }

  static constructorWithEnum(enums: Array<string | number> = []) {
    const dataType = new StandardDataType()
    dataType.setEnum(enums)

    return dataType
  }

  setTemplateIndex(classTemplateArgs: StandardDataType[]) {
    const codes = classTemplateArgs.map(arg => arg.generateCode())
    const index = codes.indexOf(this.generateCode())

    this.typeArgs.forEach(arg => arg.setTemplateIndex(classTemplateArgs))

    this.templateIndex = index
  }

  getEnumType() {
    return this.enum.join(' | ') || 'string'
  }

  getDefName(originName) {
    let name = this.typeName

    if (this.isDefsType) {
      name = originName ? `defs.${originName}.${this.typeName}` : `defs.${this.typeName}`
    }

    return name
  }

  /**
   * @description 生成 Typescript 类型定义的代码
   */
  generateCode(originName = '') {
    if (this.templateIndex !== -1) {
      return `T${this.templateIndex}`
    }

    if (this.enum.length) {
      return this.getEnumType()
    }

    const name = this.getDefName(originName)

    if (this.typeArgs.length) {
      return `${name}<${this.typeArgs.map(arg => arg.generateCode(originName)).join(', ')}>`
    }

    if (this.typeProperties.length) {
      const interfaceCode = `{${this.typeProperties.map(property => property.toPropertyCode())}
      }`

      if (name) {
        return `${name}<${interfaceCode}>`
      }

      return interfaceCode
    }

    return name || 'any'
  }
  /**
   * @description 生成 Typescript 类型定义的代码
   */
  getInitialValue(usingDef = true) {
    if (this.typeName === 'Array') {
      return '[]'
    }

    if (this.isDefsType) {
      const originName = this.getDsName()

      if (!usingDef) {
        return `new ${this.typeName}()`
      }

      return `new ${this.getDefName(originName)}()`
    }

    if (this.templateIndex > -1) {
      return 'undefined'
    }

    if (this.typeName === 'string') {
      return "''"
    }

    if (this.typeName === 'boolean') {
      return 'false'
    }

    if (this.enum && this.enum.length) {
      const str = this.enum[0]

      if (typeof str === 'string') {
        return `${str}`
      }

      return str + ''
    }

    return 'undefined'
  }
}

export class Property extends Contextable {
  dataType: StandardDataType
  description?: string
  name: string
  required: boolean

  in: 'query' | 'body' | 'path' | 'formData' | 'header'

  constructor(prop: Partial<Property>) {
    super(prop)
  }

  toPropertyCode(surrounding = Surrounding.typeScript, hasRequired = false, optional = false) {
    let optionalSignal = hasRequired && optional ? '?' : ''

    if (hasRequired && !this.required) {
      optionalSignal = '?'
    }

    let name = this.name
    if (!name.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/)) {
      name = `'${name}'`
    }

    const fieldTypeDeclaration =
      surrounding === Surrounding.javaScript
        ? ''
        : `${optionalSignal}: ${this.dataType.generateCode(this.getDsName())}`

    return `
      /** ${this.description || this.name} */
      ${name}${fieldTypeDeclaration}`
  }

  toPropertyCodeWithInitValue(baseName = '') {
    let typeWithValue = `= ${this.dataType.getInitialValue(false)}`

    if (!this.dataType.getInitialValue(false)) {
      typeWithValue = `: ${this.dataType.generateCode(this.getDsName())}`
    }

    if (this.dataType.typeName === baseName) {
      typeWithValue = `= {}`
    }

    let name = this.name
    if (!name.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/)) {
      name = `'${name}'`
    }

    return `
      /** ${this.description || this.name} */
      ${name} ${typeWithValue}
      `
  }
}

export class BaseClass extends Contextable {
  name: string
  description: string
  properties: Array<Property>
  templateArgs: StandardDataType[]

  constructor(base: Partial<BaseClass>) {
    super(base)

    this.properties = _.orderBy(this.properties, 'name')
  }
}

export class Mod extends Contextable {
  description: string
  interfaces: Interface[]
  name: string

  constructor(mod: Partial<Mod>) {
    super(mod)

    this.interfaces = _.orderBy(this.interfaces, 'path')
  }
}

export class StandardDataSource {
  name: string
  baseClasses: BaseClass[]
  public mods: Mod[]

  constructor(standard: { name: string; baseClasses: BaseClass[]; mods: Mod[]; }) {
    this.name = standard.name
    this.baseClasses = standard.baseClasses
    this.mods = standard.mods

    this.reOrder()
  }

  reOrder() {
    this.baseClasses = _.orderBy(this.baseClasses, 'name')
    this.mods = _.orderBy(this.mods, 'name')
  }
}
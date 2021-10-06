export class StandardDataType {
  constructor (
    // 标准参数类型列表
    public typeArgs = [] as StandardDataType[],
    // 类型名称
    public typeName = '',
    // 是否基类
    public isDefsType = false,
    // 基类命名空间名称
    public defOriginName = '',
    // 指向类的第几个模板
    public templateIndex = -1
  ) {}

  /**
   * @description 设置类型模板指向，解决可能出现泛型的问题
   * @param classTemplateArgs 参照类型模板列表
   */
  setTemplateIndex (classTemplateArgs: StandardDataType[]) {
    const codes = classTemplateArgs.map(arg => arg.generateTsCode())
    const index = codes.indexOf(this.generateTsCode())

    this.typeArgs.forEach(arg => arg.setTemplateIndex(classTemplateArgs))

    this.templateIndex = index
  }

  /**
   * @description 获取类型名称
   */
  private getDefsTypeName () {
    return this.isDefsType ? `${this.defOriginName}.${this.typeName}` : `${this.typeName}`
  }

  /**
   * @description 解析
   */
  generateTsCode () {
    if (this.templateIndex !== -1) {
      return `T${this.templateIndex}`
    }

    const name = this.getDefsTypeName()

    if (this.typeArgs.length) {
      return `${name}<${this.typeArgs.map(arg => arg.generateTsCode()).join(', ')}>`
    }

    return name || 'any'
  }
}

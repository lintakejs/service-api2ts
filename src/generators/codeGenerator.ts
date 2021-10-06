import { StandardDataSource, StandardInterface, StandardBaseClass, StandardMod, StandardDataType } from '../standard/'
import { DataSourceConfig } from '../config/config'

const DEFAULT_ARR_LENGTH = 3
function getArr (arrItem, arrLength = DEFAULT_ARR_LENGTH) {
  const arr = []

  for (let index = 0; index < arrLength; index++) {
    arr.push(arrItem)
  }

  return arr
}

export class CodeGenerator {
  constructor (
    public dataSource: StandardDataSource,
    public modsTemplateDefault: Function,
    public sourceConfig: DataSourceConfig
  ) {}

  /**
   * @description 解析基类，获取基类定义的class代码
   * @param base 基类
   */
  getBaseClassInDeclaration (base: StandardBaseClass) {
    if (base.templateArgs && base.templateArgs.length && this.sourceConfig.originType === 'SwaggerV2') {
      return `class ${base.name}<${base.templateArgs.map((_, index) => `T${index} = any`).join(', ')}> {
        ${base.properties.map(prop => prop.toPropertyCode(this.sourceConfig.surrounding)).join('\n')}
      }
      `
    }
    return `class ${base.name} {
      ${base.properties.map(prop => prop.toPropertyCode(this.sourceConfig.surrounding)).join('\n')}
    }
    `
  }

  /**
   * @description 获取单个模块的 index 入口文件
   * @param mod 模块
   */
  getModIndex (mod: StandardMod) {
    return `
      /**
       * @description ${mod.description}
       */
      ${mod.interfaces
        .map(inter => {
          return `import * as ${inter.name} from './${inter.name}';`
        })
        .join('\n')}

      export {
        ${mod.interfaces.map(inter => inter.name).join(', \n')}
      }
    `
  }

  /**
   * @description 获取所有基类的类型定义代码，一个 namespace; surrounding, 优先级高于this.surrounding,用于生成api.d.ts时强制保留类型
   */
  getBaseClassesInDeclaration () {
    const content = `
    type ObjectMap<Key extends string | number | symbol = any, Value = any> = {
      [key in Key]: Value;
    }
    declare namespace ${this.dataSource.name || 'defs'} {
      ${this.dataSource.baseClasses
        .map(
          base => `
        export ${this.getBaseClassInDeclaration(base)}
      `
        )
        .join('\n')}
    }
    `

    return content
  }

  /**
   * @description 获取总的类型定义代码
   */
  getDeclaration () {
    return `${this.getBaseClassesInDeclaration()}`
  }

  /**
   * @description 接口内容实现代码
   * @param inter 接口参数
   */
  getInterfaceContent (inter: StandardInterface) {
    if (!this.modsTemplateDefault || typeof this.modsTemplateDefault !== 'function') {
      return ''
    }

    return this.modsTemplateDefault(inter)
  }

  /**
   * @description 解析基类，获取各参数的mock
   * @param clazz 基类
   */
  getBaseClassMocksFn (clazz: StandardBaseClass) {
    const props: string[] = []

    clazz.properties.map(prop => props.push(`${prop.name}: ${this.getDefaultMocks(prop.dataType)}`))

    return `
      ${clazz.name}: ${props.findIndex(prop => prop.includes(': typeArgs') || prop.includes(': [typeArgs')) > -1 ? '(...typeArgs: any[])' : '()'}: any => {
        return {
          ${props.join(',\n')}
        }
      }
    `
  }

  /**
   * @description 获取接口返回类型的mock
   * @param response 接口返回类型
   */
  getDefaultMocks (response: StandardDataType) {
    const { typeName, isDefsType, typeArgs, templateIndex } = response

    if (templateIndex !== -1) {
      return `typeArgs[${templateIndex}]`
    } else if (isDefsType) {
      const defClass = this.dataSource.baseClasses.find(base => base.name === typeName)

      return defClass ? `${this.dataSource.name}.${defClass.name}(${typeArgs.map(arg => this.getDefaultMocks(arg)).join(',')})` : '{}'
    } else if (typeName === 'Array') {
      return typeArgs.length ? `[${getArr(this.getDefaultMocks(typeArgs[0]))}]` : '[]'
    } else if (typeName === 'string') {
      return 'Mock.Random.string()'
    } else if (typeName === 'number') {
      return 'Mock.Random.integer()'
    } else if (typeName === 'boolean') {
      return 'Mock.Random.boolean()'
    } else {
      return 'null'
    }
  }

  /**
   * @description 获取mock数据内容
   */
  getMockDatas () {
    const classes = this.dataSource.baseClasses.map(clazz => {
      return this.getBaseClassMocksFn(clazz)
    })

    return `
      import Mock from 'mockjs'
      
      const ${this.dataSource.name} = {
        ${classes.join(',\n\n')}
      }

      export default {
        ${this.dataSource.mods.map(mod => {
          const modName = mod.name
          return `
            /** ${mod.description} */
            ${modName}: {
              ${mod.interfaces.map(inter => {
                const interName = inter.name
                const interResMock = this.getDefaultMocks(inter.response)

                return `
                  /** ${inter.description} */
                  ${interName}: () => ${interResMock}
                `
              }).join(',\n')}
            }
          `
        }).join(',\n')}
      }
    `
  }

  /**
   * @description 获取api的mock内容
   */
  getInterfaceMocksContent () {
    return `
      import Mock from 'mockjs'
      import MockTemplate from './api-mock' 

      ${
        this.dataSource.mods.map(mod => {
          const modsInterfaces = this.sourceConfig.mocksModsReg ? mod.interfaces.filter(inter => new RegExp(this.sourceConfig.mocksModsReg).test(inter.path)) : mod.interfaces

          return modsInterfaces.map(inter => {
            return `
              /** ${inter.description} */
              Mock.mock('${inter.path}', '${inter.method}', MockTemplate['${mod.name}']['${inter.name}'])
            `
          }).join(',\n')
        }).join('')
      } 
    `
  }
}

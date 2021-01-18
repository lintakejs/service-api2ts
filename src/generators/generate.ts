import * as _ from 'lodash'
import * as fs from 'fs-extra'
import { loadingStart, loadingStop, success } from '../debugLog'
import { Interface, Mod, StandardDataSource, BaseClass } from '../standard'
import { getFileName, reviseModName, format } from '../utils'
import { Surrounding } from '../config/config'

export class FileStructures {
  constructor(
    private generators: CodeGenerator,
    private surrounding = Surrounding.typeScript
  ) {}

  getFileStructures() {
    return this.getOriginFileStructures(this.generators)
  }

  getOriginFileStructures(generator: CodeGenerator) {
    let mods = {}
    const dataSource = generator.dataSource

    const indexFileName = getFileName('index', this.surrounding)
    
    dataSource.mods.forEach(mod => {
      const currMod = {}

      mod.interfaces.forEach(inter => {
        currMod[getFileName(inter.name, this.surrounding)] = generator.getInterfaceContent(inter)
        currMod[indexFileName] = generator.getModIndex(mod)
      })

      const modName = reviseModName(mod.name)
      mods[modName] = currMod
    })

    const result = {
      [getFileName('baseClass', this.surrounding)]: generator.getBaseClassesIndex(),
      modules: mods,
      'api.d.ts': generator.getDeclaration()
    }

    return result
  }
}

export class CodeGenerator {
  dataSource: StandardDataSource

  constructor(public surrounding = Surrounding.typeScript, public outDir = '', public modsTemplateDefault: Function, public modsTypeTemplateDefault: Function) {}

  setDataSource(dataSource: StandardDataSource) {
    this.dataSource = dataSource
  }

  /** 获取某个基类的类型定义代码 */
  getBaseClassInDeclaration(base: BaseClass) {    
    if (base.templateArgs && base.templateArgs.length) {
      return `class ${base.name}<${base.templateArgs.map((_, index) => `T${index} = any`).join(', ')}> {
        ${base.properties.map(prop => prop.toPropertyCode(Surrounding.typeScript, true)).join('\n')}
      }
      `
    }
    return `class ${base.name} {
      ${base.properties.map(prop => prop.toPropertyCode(Surrounding.typeScript, true)).join('\n')}
    }
    `
  }
  /**
   * @description 获取所有基类的类型定义代码，一个 namespace; surrounding, 优先级高于this.surrounding,用于生成api.d.ts时强制保留类型
   */
  getBaseClassesInDeclaration() {
    const content = `
    declare namespace ${this.dataSource.name || 'defs'} {
      type ObjectMap<Key extends string | number | symbol = any, Value = any> = {
        [key in Key]: Value;
      }
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
  /** 获取接口内容的类型定义代码 */
  getInterfaceContentInDeclaration(inter: Interface) {
    return this.modsTypeTemplateDefault(inter)
  }

  private getInterfaceInDeclaration(inter: Interface) {
    return `
      /**
        * ${inter.description}
        * ${inter.path}
        */
      export namespace ${inter.name} {
        ${this.getInterfaceContentInDeclaration(inter)}
      }
    `;
  }
  /**
   * @description 获取模块的类型定义代码，一个 namespace ，一般不需要覆盖
   */
  getModsDeclaration() {
    if (!this.modsTypeTemplateDefault || typeof this.modsTypeTemplateDefault !== 'function') {
      return ``
    }

    const mods = this.dataSource.mods;
    const content = `declare namespace ${this.dataSource.name || 'API'} {
        ${mods
        .map(
          mod => `
          /**
           * ${mod.description}
           */
          export namespace ${reviseModName(mod.name)} {
            ${mod.interfaces.map(this.getInterfaceInDeclaration.bind(this)).join('\n')}
          }
        `
        )
        .join('\n\n')}
      }
    `

    return content
  }
  /**
   * @description 获取总的类型定义代码
   */
  getDeclaration() {
    return `
      ${this.getBaseClassesInDeclaration()}

      ${this.getModsDeclaration()}
    `
  }
  /**
   * @description 获取所有基类文件代码
   */
  getBaseClassesIndex() {
    const clsCodes = this.dataSource.baseClasses.map(
      base => `
        class ${base.name} {
          ${base.properties
          .map(prop => {
            return prop.toPropertyCodeWithInitValue(base.name);
          })
          .filter(id => id)
          .join('\n')}
        }
      `
    )

    if (this.dataSource.name) {
      return `
        ${clsCodes.join('\n')}
        export const ${this.dataSource.name} = {
          ${this.dataSource.baseClasses.map(bs => bs.name).join(',\n')}
        }
      `
    }

    return clsCodes.map(cls => `export ${cls}`).join('\n')
  }
  /**
   * @description 接口内容实现代码
   * @param inter 接口参数
   */
  getInterfaceContent(inter: Interface) {
    if (!this.modsTemplateDefault || typeof this.modsTemplateDefault !== 'function') {
      return ``
    }
    
    return this.modsTemplateDefault(inter)
  }
  /**
   * @description 获取单个模块的 index 入口文件
   * @param mod 模块
   */
  getModIndex(mod: Mod) {
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
}

export class FilesManager {

  prettierConfig = {}
  
  constructor(public fileStructures: FileStructures, private baseDir: string) {}
  /**
   * @description 初始化api存放路径
   */
  private initPath(path: string) {
    if (!fs.existsSync(path)) {
      fs.mkdirpSync(path)
    }
  }

  async regenerate(files: {}) {
    loadingStart('文件生成中...')
    this.initPath(this.baseDir)
    await this.generateFiles(files)
    loadingStop()
    success('文件生成成功...')
  }
  /**
   * @description 编译生成文件
   * @param files 文件内容
   * @param dir 文件路径
   */
  async generateFiles(files: {}, dir = this.baseDir) {
    const currFiles = await fs.readdir(dir)

    const promises = _.map(files, async (value: string | {}, name) => {
      const currPath = `${dir}/${name}`

      if (typeof value === 'string') {
        if (currFiles.includes(name)) {
          const state = await fs.lstat(currPath)
          if (state.isDirectory()) {
            await fs.unlink(currPath)
            return fs.writeFile(currPath, this.formatFile(value))
          } else {
            const newValue = this.formatFile(value)
            const currValue = await fs.readFile(currPath, 'utf-8')

            if (newValue !== currValue) {
              return fs.writeFile(currPath, this.formatFile(value, name))
            }

            return
          }
        } else {
          return fs.writeFile(currPath, this.formatFile(value, name))
        }
      }

       // 新路径为文件夹
       if (currFiles.includes(name)) {
        const state = await fs.lstat(currPath)

        if (state.isDirectory()) {
          return this.generateFiles(files[name], currPath)
        } else {
          await fs.unlink(currPath)
          await fs.mkdir(currPath)

          return this.generateFiles(files[name], currPath)
        }
      } else {
        await fs.mkdir(currPath)

        return this.generateFiles(files[name], currPath)
      }
    })

    await Promise.all(promises)
  }

  public formatFile(code: string, name = '') {
    if (name && name.endsWith('.json')) {
      return code;
    }

    return format(code, this.prettierConfig)
  }
}
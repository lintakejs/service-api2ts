"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeGenerator = void 0;
const DEFAULT_ARR_LENGTH = 3;
function getArr(arrItem, arrLength = DEFAULT_ARR_LENGTH) {
    const arr = [];
    for (let index = 0; index < arrLength; index++) {
        arr.push(arrItem);
    }
    return arr;
}
class CodeGenerator {
    constructor(dataSource, modsTemplateDefault, sourceConfig) {
        this.dataSource = dataSource;
        this.modsTemplateDefault = modsTemplateDefault;
        this.sourceConfig = sourceConfig;
    }
    getBaseClassInDeclaration(base) {
        if (base.templateArgs && base.templateArgs.length && this.sourceConfig.originType === 'SwaggerV2') {
            return `class ${base.name}<${base.templateArgs.map((_, index) => `T${index} = any`).join(', ')}> {
        ${base.properties.map(prop => prop.toPropertyCode(this.sourceConfig.surrounding)).join('\n')}
      }
      `;
        }
        return `class ${base.name} {
      ${base.properties.map(prop => prop.toPropertyCode(this.sourceConfig.surrounding)).join('\n')}
    }
    `;
    }
    getModIndex(mod) {
        return `
      /**
       * @description ${mod.description}
       */
      ${mod.interfaces
            .map(inter => {
            return `import * as ${inter.name} from './${inter.name}';`;
        })
            .join('\n')}

      export {
        ${mod.interfaces.map(inter => inter.name).join(', \n')}
      }
    `;
    }
    getBaseClassesInDeclaration() {
        const content = `
    type ObjectMap<Key extends string | number | symbol = any, Value = any> = {
      [key in Key]: Value;
    }
    declare namespace ${this.dataSource.name || 'defs'} {
      ${this.dataSource.baseClasses
            .map(base => `
        export ${this.getBaseClassInDeclaration(base)}
      `)
            .join('\n')}
    }
    `;
        return content;
    }
    getDeclaration() {
        return `${this.getBaseClassesInDeclaration()}`;
    }
    getInterfaceContent(inter) {
        if (!this.modsTemplateDefault || typeof this.modsTemplateDefault !== 'function') {
            return '';
        }
        return this.modsTemplateDefault(inter);
    }
    getBaseClassMocksFn(clazz) {
        const props = [];
        clazz.properties.map(prop => props.push(`${prop.name}: ${this.getDefaultMocks(prop.dataType)}`));
        return `
      ${clazz.name}: ${props.findIndex(prop => prop.includes(': typeArgs') || prop.includes(': [typeArgs')) > -1 ? '(...typeArgs: any[])' : '()'}: any => {
        return {
          ${props.join(',\n')}
        }
      }
    `;
    }
    getDefaultMocks(response) {
        const { typeName, isDefsType, typeArgs, templateIndex } = response;
        if (templateIndex !== -1) {
            return `typeArgs[${templateIndex}]`;
        }
        else if (isDefsType) {
            const defClass = this.dataSource.baseClasses.find(base => base.name === typeName);
            return defClass ? `${this.dataSource.name}.${defClass.name}(${typeArgs.map(arg => this.getDefaultMocks(arg)).join(',')})` : '{}';
        }
        else if (typeName === 'Array') {
            return typeArgs.length ? `[${getArr(this.getDefaultMocks(typeArgs[0]))}]` : '[]';
        }
        else if (typeName === 'string') {
            return 'Mock.Random.string()';
        }
        else if (typeName === 'number') {
            return 'Mock.Random.integer()';
        }
        else if (typeName === 'boolean') {
            return 'Mock.Random.boolean()';
        }
        else {
            return 'null';
        }
    }
    getMockDatas() {
        const classes = this.dataSource.baseClasses.map(clazz => {
            return this.getBaseClassMocksFn(clazz);
        });
        return `
      import Mock from 'mockjs'
      
      const ${this.dataSource.name} = {
        ${classes.join(',\n\n')}
      }

      export default {
        ${this.dataSource.mods.map(mod => {
            const modName = mod.name;
            return `
            /** ${mod.description} */
            ${modName}: {
              ${mod.interfaces.map(inter => {
                const interName = inter.name;
                const interResMock = this.getDefaultMocks(inter.response);
                return `
                  /** ${inter.description} */
                  ${interName}: () => ${interResMock}
                `;
            }).join(',\n')}
            }
          `;
        }).join(',\n')}
      }
    `;
    }
    getInterfaceMocksContent() {
        return `
      import Mock from 'mockjs'
      import MockTemplate from './api-mock' 

      ${this.dataSource.mods.map(mod => {
            const modsInterfaces = this.sourceConfig.mocksModsReg ? mod.interfaces.filter(inter => new RegExp(this.sourceConfig.mocksModsReg).test(inter.path)) : mod.interfaces;
            return modsInterfaces.map(inter => {
                return `
              /** ${inter.description} */
              Mock.mock('${inter.path}', '${inter.method}', MockTemplate['${mod.name}']['${inter.name}'])
            `;
            }).join(',\n');
        }).join('')} 
    `;
    }
}
exports.CodeGenerator = CodeGenerator;
//# sourceMappingURL=codeGenerator.js.map
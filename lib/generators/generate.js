"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesManager = exports.CodeGenerator = exports.FileStructures = void 0;
const _ = require("lodash");
const fs = require("fs-extra");
const debugLog_1 = require("../debugLog");
const utils_1 = require("../utils");
const config_1 = require("../config/config");
class FileStructures {
    constructor(generators, surrounding = config_1.Surrounding.typeScript) {
        this.generators = generators;
        this.surrounding = surrounding;
    }
    getFileStructures() {
        return this.getOriginFileStructures(this.generators);
    }
    getOriginFileStructures(generator) {
        let mods = {};
        const dataSource = generator.dataSource;
        const indexFileName = utils_1.getFileName('index', this.surrounding);
        dataSource.mods.forEach(mod => {
            const currMod = {};
            mod.interfaces.forEach(inter => {
                currMod[utils_1.getFileName(inter.name, this.surrounding)] = generator.getInterfaceContent(inter);
                currMod[indexFileName] = generator.getModIndex(mod);
            });
            const modName = utils_1.reviseModName(mod.name);
            mods[modName] = currMod;
        });
        const result = {
            [utils_1.getFileName('baseClass', this.surrounding)]: generator.getBaseClassesIndex(),
            modules: mods,
            'api.d.ts': generator.getDeclaration()
        };
        return result;
    }
}
exports.FileStructures = FileStructures;
class CodeGenerator {
    constructor(surrounding = config_1.Surrounding.typeScript, outDir = '', modsTemplateDefault, modsTypeTemplateDefault) {
        this.surrounding = surrounding;
        this.outDir = outDir;
        this.modsTemplateDefault = modsTemplateDefault;
        this.modsTypeTemplateDefault = modsTypeTemplateDefault;
    }
    setDataSource(dataSource) {
        this.dataSource = dataSource;
    }
    getBaseClassInDeclaration(base) {
        if (base.templateArgs && base.templateArgs.length) {
            return `class ${base.name}<${base.templateArgs.map((_, index) => `T${index} = any`).join(', ')}> {
        ${base.properties.map(prop => prop.toPropertyCode(config_1.Surrounding.typeScript, true)).join('\n')}
      }
      `;
        }
        return `class ${base.name} {
      ${base.properties.map(prop => prop.toPropertyCode(config_1.Surrounding.typeScript, true)).join('\n')}
    }
    `;
    }
    getBaseClassesInDeclaration() {
        const content = `
    declare namespace ${this.dataSource.name || 'defs'} {
      type ObjectMap<Key extends string | number | symbol = any, Value = any> = {
        [key in Key]: Value;
      }
      ${this.dataSource.baseClasses
            .map(base => `
        export ${this.getBaseClassInDeclaration(base)}
      `)
            .join('\n')}
    }
    `;
        return content;
    }
    getInterfaceContentInDeclaration(inter) {
        return this.modsTypeTemplateDefault(inter);
    }
    getInterfaceInDeclaration(inter) {
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
    getModsDeclaration() {
        if (!this.modsTypeTemplateDefault || typeof this.modsTypeTemplateDefault !== 'function') {
            return ``;
        }
        const mods = this.dataSource.mods;
        const content = `declare namespace ${this.dataSource.name || 'API'} {
        ${mods
            .map(mod => `
          /**
           * ${mod.description}
           */
          export namespace ${utils_1.reviseModName(mod.name)} {
            ${mod.interfaces.map(this.getInterfaceInDeclaration.bind(this)).join('\n')}
          }
        `)
            .join('\n\n')}
      }
    `;
        return content;
    }
    getDeclaration() {
        return `
      ${this.getBaseClassesInDeclaration()}

      ${this.getModsDeclaration()}
    `;
    }
    getBaseClassesIndex() {
        const clsCodes = this.dataSource.baseClasses.map(base => `
        class ${base.name} {
          ${base.properties
            .map(prop => {
            return prop.toPropertyCodeWithInitValue(base.name);
        })
            .filter(id => id)
            .join('\n')}
        }
      `);
        if (this.dataSource.name) {
            return `
        ${clsCodes.join('\n')}
        export const ${this.dataSource.name} = {
          ${this.dataSource.baseClasses.map(bs => bs.name).join(',\n')}
        }
      `;
        }
        return clsCodes.map(cls => `export ${cls}`).join('\n');
    }
    getInterfaceContent(inter) {
        if (!this.modsTemplateDefault || typeof this.modsTemplateDefault !== 'function') {
            return ``;
        }
        return this.modsTemplateDefault(inter);
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
}
exports.CodeGenerator = CodeGenerator;
class FilesManager {
    constructor(fileStructures, baseDir) {
        this.fileStructures = fileStructures;
        this.baseDir = baseDir;
        this.prettierConfig = {};
    }
    initPath(path) {
        if (!fs.existsSync(path)) {
            fs.mkdirpSync(path);
        }
    }
    regenerate(files) {
        return __awaiter(this, void 0, void 0, function* () {
            debugLog_1.loadingStart('文件生成中...');
            this.initPath(this.baseDir);
            yield this.generateFiles(files);
            debugLog_1.loadingStop();
            debugLog_1.success('文件生成成功...');
        });
    }
    generateFiles(files, dir = this.baseDir) {
        return __awaiter(this, void 0, void 0, function* () {
            const currFiles = yield fs.readdir(dir);
            const promises = _.map(files, (value, name) => __awaiter(this, void 0, void 0, function* () {
                const currPath = `${dir}/${name}`;
                if (typeof value === 'string') {
                    if (currFiles.includes(name)) {
                        const state = yield fs.lstat(currPath);
                        if (state.isDirectory()) {
                            yield fs.unlink(currPath);
                            return fs.writeFile(currPath, this.formatFile(value));
                        }
                        else {
                            const newValue = this.formatFile(value);
                            const currValue = yield fs.readFile(currPath, 'utf-8');
                            if (newValue !== currValue) {
                                return fs.writeFile(currPath, this.formatFile(value, name));
                            }
                            return;
                        }
                    }
                    else {
                        return fs.writeFile(currPath, this.formatFile(value, name));
                    }
                }
                if (currFiles.includes(name)) {
                    const state = yield fs.lstat(currPath);
                    if (state.isDirectory()) {
                        return this.generateFiles(files[name], currPath);
                    }
                    else {
                        yield fs.unlink(currPath);
                        yield fs.mkdir(currPath);
                        return this.generateFiles(files[name], currPath);
                    }
                }
                else {
                    yield fs.mkdir(currPath);
                    return this.generateFiles(files[name], currPath);
                }
            }));
            yield Promise.all(promises);
        });
    }
    formatFile(code, name = '') {
        if (name && name.endsWith('.json')) {
            return code;
        }
        return utils_1.format(code, this.prettierConfig);
    }
}
exports.FilesManager = FilesManager;
//# sourceMappingURL=generate.js.map
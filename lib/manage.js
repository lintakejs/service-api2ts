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
exports.Manager = void 0;
const path = require("path");
const generate_1 = require("./generators/generate");
const reader_1 = require("./reader");
const utils_1 = require("./utils");
class Manager {
    constructor(config, configDir = process.cwd()) {
        this.currConfig = Object.assign(Object.assign({}, config), { outDir: path.join(configDir, config.outDir), modsTemplatePath: config.modsTemplatePath ? path.join(configDir, config.modsTemplatePath) : undefined, modsTypeTemplatePath: config.modsTypeTemplatePath ? path.join(configDir, config.modsTypeTemplatePath) : undefined });
    }
    ready() {
        return __awaiter(this, void 0, void 0, function* () {
            this.currLocalDataSource = yield this.readRemoteDataSource(this.currConfig);
            yield this.regenerateFiles();
        });
    }
    readRemoteDataSource(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const remoteDataSource = yield reader_1.readRemoteDataSource(config);
            return remoteDataSource;
        });
    }
    regenerateFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const files = this.getGeneratedFiles();
            yield this.fileManager.regenerate(files);
        });
    }
    getGeneratedFiles() {
        this.setFilesManager();
        const files = this.fileManager.fileStructures.getFileStructures();
        return files;
    }
    setFilesManager() {
        const generator = new generate_1.CodeGenerator(this.currConfig.surrounding, this.currConfig.outDir, utils_1.getTemplate(this.currConfig.modsTemplatePath), utils_1.getTemplate(this.currConfig.modsTypeTemplatePath, false));
        generator.setDataSource(this.currLocalDataSource);
        const fileStructure = new generate_1.FileStructures(generator, this.currConfig.surrounding);
        this.fileManager = new generate_1.FilesManager(fileStructure, this.currConfig.outDir);
        this.fileManager.prettierConfig = this.currConfig.prettierConfig;
    }
}
exports.Manager = Manager;
//# sourceMappingURL=manage.js.map
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
const generators_1 = require("./generators/");
const reader_1 = require("./reader");
const utils_1 = require("./utils");
function getRemoteDataSource(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const remoteDataSource = yield reader_1.readRemoteDataSource(config);
        return remoteDataSource;
    });
}
class Manager {
    constructor(config, configDir = process.cwd()) {
        this.currConfig = Object.assign(Object.assign({}, config), { outDir: path.join(configDir, config.outDir), modsTemplatePath: config.modsTemplatePath ? path.join(configDir, config.modsTemplatePath) : undefined });
        this.fileManager = new generators_1.FilesManager(this.currConfig.outDir, this.currConfig.eslinttrcPath);
    }
    generateFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const files = this.getGeneratedFiles();
            yield this.fileManager.regenerate(files);
        });
    }
    getGeneratedFiles() {
        const generator = new generators_1.CodeGenerator(this.currLocalDataSource, utils_1.getTemplate(this.currConfig.modsTemplatePath), this.currConfig);
        const fileStructure = new generators_1.FileStructures(this.currConfig.mocksDev);
        const files = fileStructure.getOriginFileStructures(generator);
        return files;
    }
    remoteApiJson() {
        return __awaiter(this, void 0, void 0, function* () {
            this.currLocalDataSource = yield getRemoteDataSource(this.currConfig);
            yield this.generateFiles();
        });
    }
}
exports.Manager = Manager;
//# sourceMappingURL=manage.js.map
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
exports.FilesManager = void 0;
const _ = require("lodash");
const fs = require("fs-extra");
const debugLog_1 = require("../debugLog");
const utils_1 = require("../utils");
class FilesManager {
    constructor(baseDir, eslinttrcPath) {
        this.baseDir = baseDir;
        this.eslinttrcPath = eslinttrcPath;
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
//# sourceMappingURL=filesManager.js.map
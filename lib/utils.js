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
exports.getIdentifierFromOperatorId = exports.format = exports.getFileName = exports.transformDashCase = exports.transformModsName = exports.transformCamelCase = exports.hasChinese = exports.reviseModName = exports.getIdentifierFromUrl = exports.getMaxSamePath = exports.toUpperFirstLetter = exports.toDashCase = exports.getTemplate = exports.createManager = void 0;
const path = require("path");
const fs = require("fs-extra");
const prettier = require("prettier");
const manage_1 = require("./manage");
const debugLog_1 = require("./debugLog");
const config_1 = require("./config/config");
const PROJECT_ROOT = process.cwd();
function createManager(configFile) {
    return __awaiter(this, void 0, void 0, function* () {
        const configPath = path.join(PROJECT_ROOT, configFile);
        const config = config_1.DataSourceConfig.createFromConfigPath(configPath);
        const manager = new manage_1.Manager(config);
        yield manager.ready();
        return manager;
    });
}
exports.createManager = createManager;
function getTemplate(templatePath, required = true) {
    if (!fs.existsSync(templatePath)) {
        if (required) {
            throw new Error('不存在模板文件！');
        }
        else {
            return undefined;
        }
    }
    try {
        require('ts-node/register');
        const fileModule = require(templatePath);
        return fileModule.default;
    }
    catch (e) {
        throw new Error('模板文件编译错误！');
    }
}
exports.getTemplate = getTemplate;
function toDashCase(name) {
    const dashName = name
        .split(' ')
        .join('')
        .replace(/[A-Z]/g, p => '-' + p.toLowerCase());
    if (dashName.startsWith('-')) {
        return dashName.slice(1);
    }
    return dashName;
}
exports.toDashCase = toDashCase;
function toUpperFirstLetter(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
exports.toUpperFirstLetter = toUpperFirstLetter;
function getMaxSamePath(paths, samePath = '') {
    if (!paths.length) {
        return samePath;
    }
    if (paths.some(path => !path.includes('/'))) {
        return samePath;
    }
    const segs = paths.map(path => {
        const [firstSeg, ...restSegs] = path.split('/');
        return { firstSeg, restSegs };
    });
    if (segs.every((seg, index) => index === 0 || seg.firstSeg === segs[index - 1].firstSeg)) {
        return getMaxSamePath(segs.map(seg => seg.restSegs.join('/')), samePath + '/' + segs[0].firstSeg);
    }
    return samePath;
}
exports.getMaxSamePath = getMaxSamePath;
function getIdentifierFromUrl(url, requestType, samePath = '') {
    const currUrl = url.slice(samePath.length).match(/([^\.]+)/)[0];
    return (requestType +
        currUrl
            .split('/')
            .map(str => {
            if (str.includes('-')) {
                str = str.replace(/(\-\w)+/g, (_match, p1) => {
                    if (p1) {
                        return p1.slice(1).toUpperCase();
                    }
                });
            }
            if (str.match(/^{.+}$/gim)) {
                return 'By' + toUpperFirstLetter(str.slice(1, str.length - 1));
            }
            return toUpperFirstLetter(str);
        })
            .join(''));
}
exports.getIdentifierFromUrl = getIdentifierFromUrl;
function reviseModName(modName) {
    return modName
        .replace(/\//g, '.')
        .replace(/^\./, '')
        .replace(/\./g, '_');
}
exports.reviseModName = reviseModName;
function hasChinese(str) {
    return (str &&
        str.match(/[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uff1a\uff0c\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]|[\uff01-\uff5e\u3000-\u3009\u2026]/));
}
exports.hasChinese = hasChinese;
function transformCamelCase(name) {
    let words = [];
    let result = '';
    if (name.includes('-')) {
        words = name.split('-');
    }
    else if (name.includes(' ')) {
        words = name.split(' ');
    }
    else {
        if (typeof name === 'string') {
            result = name;
        }
        else {
            throw new Error('mod name is not a string: ' + name);
        }
    }
    if (words && words.length) {
        result = words
            .map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
            .join('');
    }
    result = result.charAt(0).toLowerCase() + result.slice(1);
    if (result.endsWith('Controller')) {
        result = result.slice(0, result.length - 'Controller'.length);
    }
    return result;
}
exports.transformCamelCase = transformCamelCase;
function transformModsName(mods) {
    mods.forEach(mod => {
        const currName = mod.name;
        const sameMods = mods.filter(mod => mod.name.toLowerCase() === currName.toLowerCase());
        if (sameMods.length > 1) {
            mod.name = transformDashCase(mod.name);
        }
    });
}
exports.transformModsName = transformModsName;
function transformDashCase(name) {
    return name.replace(/[A-Z]/g, ch => '_' + ch.toLowerCase());
}
exports.transformDashCase = transformDashCase;
function getFileName(fileName, surrounding) {
    const surroundType = config_1.Surrounding[surrounding];
    switch (surroundType) {
        case 'typeScript':
            return `${fileName}.ts`;
        case 'javaScript':
            return `${fileName}.js`;
        default:
            return `${fileName}.ts`;
    }
}
exports.getFileName = getFileName;
function format(fileContent, prettierOpts = {}) {
    try {
        return prettier.format(fileContent, Object.assign({ parser: 'typescript', trailingComma: 'all', singleQuote: true }, prettierOpts));
    }
    catch (e) {
        debugLog_1.error(`代码格式化报错！${e.toString()}\n代码为：${fileContent}`);
        return fileContent;
    }
}
exports.format = format;
const TS_KEYWORDS = ['delete', 'export', 'import', 'new', 'function'];
const REPLACE_WORDS = ['remove', 'exporting', 'importing', 'create', 'functionLoad'];
function getIdentifierFromOperatorId(operationId) {
    const identifier = operationId.replace(/(.+)(Using.+)/, '$1');
    const index = TS_KEYWORDS.indexOf(identifier);
    if (index === -1) {
        return identifier;
    }
    return REPLACE_WORDS[index];
}
exports.getIdentifierFromOperatorId = getIdentifierFromOperatorId;
//# sourceMappingURL=utils.js.map
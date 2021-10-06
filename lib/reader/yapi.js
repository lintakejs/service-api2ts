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
exports.parseYapiMods = exports.transformYapiData2Standard = exports.YapiReader = void 0;
const _ = require("lodash");
const utils_1 = require("../utils");
const yapi_1 = require("./yapi/");
const standard_1 = require("../standard");
const base_1 = require("./base");
const type_1 = require("./common/type");
class YapiReader extends base_1.OriginBaseReader {
    fetchMethod(config) {
        return Promise.resolve().then(() => require('node-fetch')).then((fetch) => fetch(config.originUrl, {
            method: 'POST',
            body: JSON.stringify(config.originReqBody),
            headers: { 'Content-Type': 'application/json' }
        })).then((res) => __awaiter(this, void 0, void 0, function* () {
            const sourceData = yield res.text();
            return sourceData;
        }));
    }
    transform2Standard(data) {
        return transformYapiData2Standard(Array.isArray(data) ? data : data.result, this.config);
    }
}
exports.YapiReader = YapiReader;
function transformYapiData2Standard(yapi, config) {
    const baseClasses = [];
    const allYapiServesBase = [{
            name: 'defaultServer',
            desc: '一些存在不规范的service interface name收集'
        }];
    const allYapiInterfaces = [];
    yapi.forEach(serverItem => {
        allYapiServesBase.push({
            name: serverItem.name,
            desc: serverItem.desc
        });
        serverItem.list.filter(inter => !utils_1.hasChinese(inter.path)).forEach(inter => {
            inter.tagName = utils_1.hasChinese(serverItem.name) ? 'defaultServer' : serverItem.name;
            inter.req_body_other = utils_1.jsonStingTransformObject(inter.req_body_other);
            inter.res_body = utils_1.jsonStingTransformObject(inter.res_body);
            !inter.req_body_other.type && (inter.req_body_other.type = type_1.BasePropertyType.object);
            !inter.res_body.type && (inter.res_body.type = type_1.BasePropertyType.object);
            const requiredRequestProps = inter.req_body_other.required || [];
            yapi_1.YapiProperty.parseYapiProperty2StandardDataType(inter.req_body_other, requiredRequestProps, baseClasses, utils_1.toUpperFirstLetter(inter.path + 'RequestBody'), config.name);
            const requireResponseProps = inter.res_body.required || [];
            yapi_1.YapiProperty.parseYapiProperty2StandardDataType(inter.res_body, requireResponseProps, baseClasses, utils_1.toUpperFirstLetter(inter.path + 'Response'), config.name);
            allYapiInterfaces.push(inter);
        });
    });
    return new standard_1.StandardDataSource({
        baseClasses: _.uniqBy(baseClasses, base => base.name),
        mods: parseYapiMods(allYapiServesBase, allYapiInterfaces, baseClasses, config.name),
        name: config.name
    });
}
exports.transformYapiData2Standard = transformYapiData2Standard;
function parseYapiMods(allYapiServesName, allYapiInterfaces, baseClasses, defOriginName) {
    const mods = allYapiServesName.map(({ name: tagName, desc }) => {
        const modInterfaces = allYapiInterfaces.filter(inter => inter.tagName === tagName);
        const standardInterfaces = modInterfaces.map(inter => yapi_1.YapiInterface.transformYapiInterface2Standard(inter, baseClasses, defOriginName));
        return new standard_1.StandardMod({
            description: desc,
            interfaces: _.uniqBy(standardInterfaces, 'name'),
            name: utils_1.transformCamelCase(tagName)
        });
    }).filter(mod => mod.interfaces.length);
    return mods;
}
exports.parseYapiMods = parseYapiMods;
//# sourceMappingURL=yapi.js.map
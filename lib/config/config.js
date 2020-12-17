"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSourceConfig = exports.Mocks = exports.Surrounding = exports.OriginType = void 0;
const fs = require("fs");
var OriginType;
(function (OriginType) {
    OriginType["SwaggerV3"] = "SwaggerV3";
    OriginType["SwaggerV2"] = "SwaggerV2";
    OriginType["SwaggerV1"] = "SwaggerV1";
})(OriginType = exports.OriginType || (exports.OriginType = {}));
var Surrounding;
(function (Surrounding) {
    Surrounding["typeScript"] = "typeScript";
    Surrounding["javaScript"] = "javaScript";
})(Surrounding = exports.Surrounding || (exports.Surrounding = {}));
class Mocks {
    constructor() {
        this.enable = false;
        this.port = 8080;
        this.basePath = '';
        this.wrapper = `{
      "code": 0,
      "data": {response},
      "message": ""
    }`;
    }
}
exports.Mocks = Mocks;
class DataSourceConfig {
    constructor(config) {
        this.originUrl = '';
        this.originType = OriginType.SwaggerV2;
        this.surrounding = Surrounding.typeScript;
        this.outDir = './api-server';
        this.prettierConfig = {};
        Object.keys(config).forEach(key => {
            this[key] = config[key];
        });
    }
    static createFromConfigPath(configPath) {
        try {
            const content = fs.readFileSync(configPath, 'utf-8');
            const configObj = JSON.parse(content);
            return new DataSourceConfig(configObj);
        }
        catch (e) {
            throw '配置json失败，请检查配置文件路径是否正确';
        }
    }
}
exports.DataSourceConfig = DataSourceConfig;
//# sourceMappingURL=config.js.map
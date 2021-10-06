"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSourceConfig = exports.maxMockArrayLength = exports.OriginType = exports.Surrounding = void 0;
const fs = require("fs");
const path = require("path");
var Surrounding;
(function (Surrounding) {
    Surrounding["typeScript"] = "typeScript";
    Surrounding["javaScript"] = "javaScript";
})(Surrounding = exports.Surrounding || (exports.Surrounding = {}));
var OriginType;
(function (OriginType) {
    OriginType["SwaggerV2"] = "SwaggerV2";
    OriginType["Yapi"] = "Yapi";
})(OriginType = exports.OriginType || (exports.OriginType = {}));
exports.maxMockArrayLength = 3;
class DataSourceConfig {
    constructor(config) {
        this.originUrl = '';
        this.originType = OriginType.SwaggerV2;
        this.originReqBody = {};
        this.surrounding = Surrounding.typeScript;
        this.outDir = './api-server';
        this.eslinttrcPath = path.join(process.cwd(), '.eslintrc.js');
        this.mocksDev = false;
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
            throw new Error('配置json失败，请检查配置文件路径是否正确');
        }
    }
}
exports.DataSourceConfig = DataSourceConfig;
//# sourceMappingURL=config.js.map
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
exports.OriginBaseReader = void 0;
const node_fetch_1 = require("node-fetch");
const fs = require("fs-extra");
const debugLog_1 = require("../debugLog");
const utils_1 = require("../utils");
class OriginBaseReader {
    constructor(config) {
        this.config = config;
    }
    transform2Standard(data) {
        return data;
    }
    fetchMethod(config) {
        return node_fetch_1.default(config.originUrl).then((res) => __awaiter(this, void 0, void 0, function* () {
            const sourceData = yield res.text();
            return sourceData;
        }));
    }
    fetchData() {
        return __awaiter(this, void 0, void 0, function* () {
            debugLog_1.loadingStart('获取远程数据中...');
            const swaggerJsonStr = utils_1.isUrl(this.config.originUrl) ? yield this.fetchMethod(this.config) : yield fs.readFileSync(this.config.originUrl);
            const data = yield JSON.parse(swaggerJsonStr);
            debugLog_1.loadingStop();
            debugLog_1.success('远程数据获取成功！');
            return data;
        });
    }
    fetchRemoteData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.fetchData();
                const remoteDataSource = this.transform2Standard(data);
                debugLog_1.success('远程数据解析完毕!');
                return remoteDataSource;
            }
            catch (e) {
                debugLog_1.loadingStop();
                throw new Error('读取远程接口数据失败！' + e.toString());
            }
        });
    }
}
exports.OriginBaseReader = OriginBaseReader;
//# sourceMappingURL=base.js.map
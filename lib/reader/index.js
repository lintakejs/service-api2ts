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
exports.readRemoteDataSource = void 0;
const path = require("path");
const config_1 = require("../config/config");
const swagger_1 = require("./swagger");
const yapi_1 = require("./yapi");
function readRemoteDataSource(config) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!config.name) {
            config.name = path.basename(process.cwd()).replace(/-/g, '_').toUpperCase();
        }
        switch (config.originType) {
            case config_1.OriginType.SwaggerV2:
                return new swagger_1.SwaggerV2Reader(config).fetchRemoteData();
            case config_1.OriginType.Yapi:
                return new yapi_1.YapiReader(config).fetchRemoteData();
            default:
                return new swagger_1.SwaggerV2Reader(config).fetchRemoteData();
        }
    });
}
exports.readRemoteDataSource = readRemoteDataSource;
//# sourceMappingURL=index.js.map
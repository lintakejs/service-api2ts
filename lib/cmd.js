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
const program = require("commander");
const path = require("path");
const fs = require("fs-extra");
const debugLog_1 = require("./debugLog");
const utils_1 = require("./utils");
const packageFilePath = path.join(__dirname, '..', 'package.json');
const packageInfo = JSON.parse(fs.readFileSync(packageFilePath, 'utf8'));
const currentVersion = packageInfo.version;
program.description('base swagger v2 generator api code');
program.version(currentVersion);
program.command('create [config-file]').action((filePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield utils_1.generatorApi(filePath);
    }
    catch (e) {
        debugLog_1.error(e);
        process.exit(1);
    }
}));
program.parse(process.argv);
//# sourceMappingURL=cmd.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStructures = void 0;
const utils_1 = require("../utils");
const config_1 = require("../config/config");
class FileStructures {
    constructor(mocksDev) {
        this.mocksDev = mocksDev;
    }
    getOriginFileStructures(generator) {
        const mods = {};
        const dataSource = generator.dataSource;
        dataSource.mods.forEach(mod => {
            const currMod = {};
            mod.interfaces.forEach(inter => {
                currMod[utils_1.getFileName(inter.name, generator.sourceConfig.surrounding)] = generator.getInterfaceContent(inter);
                currMod[utils_1.getFileName('index', generator.sourceConfig.surrounding)] = generator.getModIndex(mod);
            });
            const modName = utils_1.reviseModName(mod.name);
            mods[modName] = currMod;
        });
        const result = {
            modules: mods
        };
        if (this.mocksDev) {
            result['.mocks'] = {
                [utils_1.getFileName('api-mock', generator.sourceConfig.surrounding)]: generator.getMockDatas(),
                [utils_1.getFileName('index', generator.sourceConfig.surrounding)]: generator.getInterfaceMocksContent()
            };
        }
        if (generator.sourceConfig.surrounding === config_1.Surrounding.typeScript) {
            result['api.d.ts'] = generator.getDeclaration();
        }
        return result;
    }
}
exports.FileStructures = FileStructures;
//# sourceMappingURL=fileStructures.js.map
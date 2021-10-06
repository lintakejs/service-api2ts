"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YapiInterface = void 0;
const _ = require("lodash");
const standard_1 = require("../../standard");
const utils_1 = require("../../utils");
class YapiInterface {
    static transformYapiInterface2Standard(inter, baseClasses, defOriginName) {
        const name = utils_1.getIdentifierFromUrl(inter.path, '');
        const requestBodyClassName = utils_1.toUpperFirstLetter(inter.path + 'RequestBody');
        const responseClassName = utils_1.toUpperFirstLetter(inter.path + 'Response');
        const response = new standard_1.StandardDataType([], responseClassName, true, defOriginName);
        const parameters = [
            new standard_1.StandardProperty({
                in: 'body',
                name: requestBodyClassName,
                required: !!baseClasses.find(base => base.name === requestBodyClassName),
                dataType: new standard_1.StandardDataType([], requestBodyClassName, true, defOriginName)
            })
        ];
        const standardInterface = new standard_1.StandardInterface({
            consumes: [],
            description: inter.title,
            name,
            method: inter.method.toLocaleLowerCase(),
            path: inter.path,
            response,
            parameters: _.unionBy(parameters, 'name')
        });
        return standardInterface;
    }
}
exports.YapiInterface = YapiInterface;
//# sourceMappingURL=interface.js.map
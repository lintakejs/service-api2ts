import { StandardDataSource, StandardInterface, StandardBaseClass, StandardMod, StandardDataType } from '../standard/';
import { DataSourceConfig } from '../config/config';
export declare class CodeGenerator {
    dataSource: StandardDataSource;
    modsTemplateDefault: Function;
    sourceConfig: DataSourceConfig;
    constructor(dataSource: StandardDataSource, modsTemplateDefault: Function, sourceConfig: DataSourceConfig);
    getBaseClassInDeclaration(base: StandardBaseClass): string;
    getModIndex(mod: StandardMod): string;
    getBaseClassesInDeclaration(): string;
    getDeclaration(): string;
    getInterfaceContent(inter: StandardInterface): any;
    getBaseClassMocksFn(clazz: StandardBaseClass): string;
    getDefaultMocks(response: StandardDataType): any;
    getMockDatas(): string;
    getInterfaceMocksContent(): string;
}

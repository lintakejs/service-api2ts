import { Interface, Mod, StandardDataSource, BaseClass } from '../standard';
import { Surrounding } from '../config/config';
export declare class FileStructures {
    private generators;
    private surrounding;
    constructor(generators: CodeGenerator, surrounding?: Surrounding);
    getFileStructures(): {
        [x: string]: {};
        mods: {};
        'api.d.ts': string;
    };
    getOriginFileStructures(generator: CodeGenerator): {
        [x: string]: {};
        mods: {};
        'api.d.ts': string;
    };
}
export declare class CodeGenerator {
    surrounding: Surrounding;
    outDir: string;
    modsTemplateDefault: Function;
    modsTypeTemplateDefault: Function;
    dataSource: StandardDataSource;
    constructor(surrounding: Surrounding, outDir: string, modsTemplateDefault: Function, modsTypeTemplateDefault: Function);
    setDataSource(dataSource: StandardDataSource): void;
    getBaseClassInDeclaration(base: BaseClass): string;
    getBaseClassesInDeclaration(): string;
    getInterfaceContentInDeclaration(inter: Interface): any;
    private getInterfaceInDeclaration;
    getModsDeclaration(): string;
    getDeclaration(): string;
    getIndex(): string;
    getBaseClassesIndex(): string;
    getInterfaceContent(inter: Interface): any;
    getModIndex(mod: Mod): string;
    getModsIndex(): string;
}
export declare class FilesManager {
    fileStructures: FileStructures;
    private baseDir;
    prettierConfig: {};
    constructor(fileStructures: FileStructures, baseDir: string);
    private initPath;
    regenerate(files: {}): Promise<void>;
    generateFiles(files: {}, dir?: string): Promise<void>;
    formatFile(code: string, name?: string): any;
}

import { Surrounding } from './config/config';
declare class Contextable {
    private context;
    constructor(arg?: {});
    getDsName(): any;
    getContext(): any;
    setContext(context: any): void;
}
export declare class Interface extends Contextable {
    consumes: string[];
    parameters: Property[];
    description: string;
    response: StandardDataType;
    method: string;
    name: string;
    path: string;
    constructor(inter: Partial<Interface>);
    get responseType(): any;
    get bodyParamsCode(): any;
    get paramsCode(): string;
}
export declare class StandardDataType extends Contextable {
    typeArgs: StandardDataType[];
    typeName: string;
    isDefsType: boolean;
    templateIndex: number;
    enum: Array<string | number>;
    setEnum(enums?: Array<string | number>): void;
    typeProperties: Property[];
    constructor(typeArgs?: StandardDataType[], typeName?: string, isDefsType?: boolean, templateIndex?: number);
    static constructorWithEnum(enums?: Array<string | number>): StandardDataType;
    setTemplateIndex(classTemplateArgs: StandardDataType[]): void;
    getEnumType(): string;
    getDefName(originName: any): string;
    generateCode(originName?: string): any;
    getInitialValue(usingDef?: boolean): string;
}
export declare class Property extends Contextable {
    dataType: StandardDataType;
    description?: string;
    name: string;
    required: boolean;
    in: 'query' | 'body' | 'path' | 'formData' | 'header';
    constructor(prop: Partial<Property>);
    setContext(context: any): void;
    toPropertyCode(surrounding?: Surrounding, hasRequired?: boolean, optional?: boolean): any;
    toPropertyCodeWithInitValue(baseName?: string): string;
}
export declare class BaseClass extends Contextable {
    name: string;
    description: string;
    properties: Array<Property>;
    templateArgs: StandardDataType[];
    setContext(context: any): void;
    constructor(base: Partial<BaseClass>);
}
export declare class Mod extends Contextable {
    description: string;
    interfaces: Interface[];
    name: string;
    setContext(context: any): void;
    constructor(mod: Partial<Mod>);
}
export declare class StandardDataSource {
    name: string;
    baseClasses: BaseClass[];
    mods: Mod[];
    constructor(standard: {
        name: string;
        baseClasses: BaseClass[];
        mods: Mod[];
    });
    reOrder(): void;
    setContext(): void;
}
export {};

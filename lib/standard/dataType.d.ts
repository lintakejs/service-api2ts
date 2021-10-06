export declare class StandardDataType {
    typeArgs: StandardDataType[];
    typeName: string;
    isDefsType: boolean;
    defOriginName: string;
    templateIndex: number;
    constructor(typeArgs?: StandardDataType[], typeName?: string, isDefsType?: boolean, defOriginName?: string, templateIndex?: number);
    setTemplateIndex(classTemplateArgs: StandardDataType[]): void;
    private getDefsTypeName;
    generateTsCode(): any;
}

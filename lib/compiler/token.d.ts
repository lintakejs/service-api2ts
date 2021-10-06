export declare enum TokenType {
    Identifier = "Identifier",
    PreTemplate = "PreTemplate",
    EndTemplate = "EndTemplate",
    Comma = "Comma"
}
export declare const TokenTypeRegs: {
    Identifier: RegExp;
    PreTemplate: RegExp;
    EndTemplate: RegExp;
    Comma: RegExp;
};
export declare class Token {
    type: TokenType;
    value: string;
    constructor(type: TokenType, value?: string);
}

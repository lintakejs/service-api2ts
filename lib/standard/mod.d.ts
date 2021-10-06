import { StandardBase, StandardInterface } from './';
export declare class StandardMod extends StandardBase {
    description: string;
    interfaces: StandardInterface[];
    name: string;
    constructor(mod: Partial<StandardMod>);
}

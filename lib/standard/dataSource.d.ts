import { StandardBaseClass, StandardBase, StandardMod } from './index';
export declare class StandardDataSource extends StandardBase {
    name: string;
    baseClasses: StandardBaseClass[];
    mods: StandardMod[];
    constructor(source: Partial<StandardDataSource>);
}

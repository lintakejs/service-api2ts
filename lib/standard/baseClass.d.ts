import { StandardBase, StandardProperty, StandardDataType } from './index';
export declare class StandardBaseClass extends StandardBase {
    name: string;
    description: string;
    properties: Array<StandardProperty>;
    templateArgs: StandardDataType[];
    constructor(base: Partial<StandardBaseClass>);
}

import { StandardBase, StandardDataType } from './index';
import { Surrounding } from '../config/config';
export declare class StandardProperty extends StandardBase {
    dataType: StandardDataType;
    description?: string;
    name: string;
    required: boolean;
    in: 'query' | 'body' | 'path' | 'formData' | 'header';
    constructor(prop: Partial<StandardProperty>);
    toPropertyCode(surrounding?: Surrounding): string;
}

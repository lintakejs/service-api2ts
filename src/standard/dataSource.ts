import { StandardBaseClass, StandardBase, StandardMod } from './index'

export class StandardDataSource extends StandardBase {
  name: string;
  baseClasses: StandardBaseClass[]
  mods: StandardMod[]

  constructor (source: Partial<StandardDataSource>) {
    super(source)
  }
}

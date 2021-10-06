import { StandardBase, StandardInterface } from './'

export class StandardMod extends StandardBase {
  description: string
  interfaces: StandardInterface[]
  name: string

  constructor (mod: Partial<StandardMod>) {
    super(mod)
  }
}

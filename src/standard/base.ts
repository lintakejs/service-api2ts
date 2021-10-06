import * as _ from 'lodash'

export class StandardBase {
  constructor (arg = {}) {
    _.forEach(arg, (value, key) => {
      if (value !== undefined) {
        this[key] = value
      }
    })
  }
}

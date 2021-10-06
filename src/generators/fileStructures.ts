import { CodeGenerator } from './'
import { getFileName, reviseModName } from '../utils'
import { Surrounding } from '../config/config'

export class FileStructures {
  constructor (public mocksDev: boolean) {}

  getOriginFileStructures (generator: CodeGenerator) {
    const mods = {}
    const dataSource = generator.dataSource

    dataSource.mods.forEach(mod => {
      const currMod = {}

      mod.interfaces.forEach(inter => {
        currMod[getFileName(inter.name, generator.sourceConfig.surrounding)] = generator.getInterfaceContent(inter)
        currMod[getFileName('index', generator.sourceConfig.surrounding)] = generator.getModIndex(mod)
      })

      const modName = reviseModName(mod.name)
      mods[modName] = currMod
    })

    const result = {
      modules: mods
    }

    if (this.mocksDev) {
      result['.mocks'] = {
        [getFileName('api-mock', generator.sourceConfig.surrounding)]: generator.getMockDatas(),
        [getFileName('index', generator.sourceConfig.surrounding)]: generator.getInterfaceMocksContent()
      }
    }

    if (generator.sourceConfig.surrounding === Surrounding.typeScript) {
      result['api.d.ts'] = generator.getDeclaration()
    }

    return result
  }
}

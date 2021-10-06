import * as path from 'path'
import { DataSourceConfig } from './config/config'
import { CodeGenerator, FileStructures, FilesManager } from './generators/'
import { readRemoteDataSource } from './reader'
import { StandardDataSource } from './standard/'
import { getTemplate } from './utils'

/**
 * @description 查询数据源
 */
async function getRemoteDataSource (config: DataSourceConfig) {
  const remoteDataSource = await readRemoteDataSource(config)

  return remoteDataSource
}

export class Manager {
  currLocalDataSource: StandardDataSource
  currConfig: DataSourceConfig
  fileManager: FilesManager

  constructor (config: DataSourceConfig, configDir = process.cwd()) {
    this.currConfig = {
      ...config,
      outDir: path.join(configDir, config.outDir),
      modsTemplatePath: config.modsTemplatePath ? path.join(configDir, config.modsTemplatePath) : undefined
    }

    this.fileManager = new FilesManager(this.currConfig.outDir, this.currConfig.eslinttrcPath)
  }

  /**
   * @description 将需要编译的文件编译成api文件
   */
  private async generateFiles () {
    const files = this.getGeneratedFiles()
    await this.fileManager.regenerate(files)
  }

  /**
   * @description 获取编译文件
   */
  private getGeneratedFiles () {
    const generator = new CodeGenerator(
      this.currLocalDataSource,
      getTemplate(this.currConfig.modsTemplatePath),
      this.currConfig
    )

    const fileStructure = new FileStructures(this.currConfig.mocksDev)
    const files = fileStructure.getOriginFileStructures(generator)
    return files
  }

  /**
   * @description
   */
  async remoteApiJson () {
    this.currLocalDataSource = await getRemoteDataSource(this.currConfig)

    await this.generateFiles()
  }
}

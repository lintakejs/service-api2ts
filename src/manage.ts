import * as path from 'path'
import { DataSourceConfig } from './config/config'
import { FilesManager, CodeGenerator, FileStructures } from './generators/generate'
import { readRemoteDataSource } from './reader'
import { StandardDataSource } from './standard'
import { getTemplate } from './utils'

export class Manager {
  currLocalDataSource: StandardDataSource
  currConfig: DataSourceConfig
  fileManager: FilesManager
  
  constructor(config: DataSourceConfig, configDir = process.cwd()) {
    this.currConfig = {
      ...config,
      outDir: path.join(configDir, config.outDir),
      modsTemplatePath: config.modsTemplatePath ? path.join(configDir, config.modsTemplatePath) : undefined,
      modsTypeTemplatePath: config.modsTypeTemplatePath ? path.join(configDir, config.modsTypeTemplatePath) : undefined
    }
  }

  async ready() {
    this.currLocalDataSource = await this.readRemoteDataSource(this.currConfig)

    await this.regenerateFiles()
  }
  /**
   * @description 查询数据源
   */
  async readRemoteDataSource(config) {
    const remoteDataSource = await readRemoteDataSource(config);

    return remoteDataSource
  }
  /**
   * @description 将需要编译的文件编译成api文件
   */
  async regenerateFiles() {
    const files = this.getGeneratedFiles()
    await this.fileManager.regenerate(files)
  }
  /**
   * @description 获取编译文件
   */
  getGeneratedFiles() {
    this.setFilesManager()
    const files = this.fileManager.fileStructures.getFileStructures()
    return files
  }
  /**
   * @description 文件生成器
   */
  setFilesManager() {
    const generator = new CodeGenerator(this.currConfig.surrounding, this.currConfig.outDir, getTemplate(this.currConfig.modsTemplatePath), getTemplate(this.currConfig.modsTypeTemplatePath, false))
    generator.setDataSource(this.currLocalDataSource)

    const fileStructure = new FileStructures(generator, this.currConfig.surrounding)
    this.fileManager = new FilesManager(fileStructure, this.currConfig.outDir)
    this.fileManager.prettierConfig = this.currConfig.prettierConfig
  }
}
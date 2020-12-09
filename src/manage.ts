import * as fs from 'fs-extra'
import * as path from 'path'
import { DataSourceConfig } from './config/config'
import { info as debugInfo } from './debugLog'
import { FilesManager, CodeGenerator, FileStructures } from './generators/generate'
import { readRemoteDataSource } from './reader'
import { StandardDataSource } from './standard'
import { getTemplate } from './utils'

export class Manager {
  readonly lockFilename = 'api-lock.json'
  currLocalDataSource: StandardDataSource
  currConfig: DataSourceConfig
  fileManager: FilesManager
  report = debugInfo
  
  constructor(private projectRoot: string, config: DataSourceConfig, configDir = process.cwd()) {
    this.currConfig = {
      ...config,
      outDir: path.join(configDir, config.outDir),
      templatePath: config.templatePath ? path.join(configDir, config.templatePath) : undefined
    }
  }

  async ready() {
    if (this.existsLocal()) {
      this.currLocalDataSource = await this.readLocalDataSource()
    } else {
      this.currLocalDataSource = await this.readRemoteDataSource(this.currConfig)
    }

    await this.regenerateFiles()
  }
  /**
   * @description 查看本地缓存
   */
  existsLocal() {
    return fs.existsSync(path.join(this.currConfig.outDir, this.lockFilename))
  }
  /**
   * @description 保存本地缓存
   */
  async saveLock(lockContent: string) {
    try {
      const lockFilePath = path.join(this.currConfig.outDir, this.lockFilename)
      await fs.writeFile(lockFilePath, lockContent)
    } catch(e) {
      throw new Error('保存本地缓存失败')
    }
  }
  /**
   * @description 读取本地缓存文件内容
   */
  async readLockFile(): Promise<string> {
    let lockFile = path.join(this.currConfig.outDir, this.lockFilename)
    try {
      const localDataStr = await fs.readFile(lockFile, {
        encoding: 'utf8'
      })
      return localDataStr
    } catch(e) {
      throw new Error('读取本地文件失败!')
    }
  }
  /**
   * @description 读取本地数据
   */
  async readLocalDataSource() {
    try {
      this.report('读取本地数据中...')
      const localDataStr = await this.readLockFile()
      this.report('读取本地完成')
      
      const localDataObjects = JSON.parse(localDataStr) as StandardDataSource

      return localDataObjects
    } catch(e) {
      throw new Error('读取 lock 文件错误！' + e.toString())
    }
  }
  /**
   * @description 查询数据源
   */
  async readRemoteDataSource(config) {
    const remoteDataSource = await readRemoteDataSource(config, this.report);

    return remoteDataSource
  }
  /**
   * @description 编译api文件
   */
  async regenerateFiles() {
    const files = this.getGeneratedFiles()
    await this.fileManager.regenerate(files)
  }
  /**
   * @description 文件生成器
   */
  setFilesManager() {
    this.report('文件生成器创建中...')
    // const { default: Generator, FileStructures: MyFileStructures } = getTemplate(
    //   this.currConfig.templatePath
    // );
    const generator = new CodeGenerator(this.currConfig.surrounding, this.currConfig.outDir)
    generator.setDataSource(this.currLocalDataSource)

    const fileStructure = new FileStructures(generator, this.currConfig.surrounding)
    this.fileManager = new FilesManager(fileStructure, this.currConfig.outDir)
    this.fileManager.prettierConfig = this.currConfig.prettierConfig

    this.report('文件生成器创建成功！')
  }

  getGeneratedFiles() {
    this.setFilesManager()
    const files = this.fileManager.fileStructures.getFileStructures()
    return files
  }
}
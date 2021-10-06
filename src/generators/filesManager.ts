import * as _ from 'lodash'
import * as fs from 'fs-extra'
import { loadingStart, loadingStop, success } from '../debugLog'
import { format } from '../utils'

export class FilesManager {
  prettierConfig = {}

  constructor (private baseDir: string, public eslinttrcPath: string) {}
  /**
   * @description 初始化api存放路径
   */
  private initPath (path: string) {
    if (!fs.existsSync(path)) {
      fs.mkdirpSync(path)
    }
  }

  async regenerate (files: {}) {
    loadingStart('文件生成中...')
    this.initPath(this.baseDir)
    await this.generateFiles(files)
    loadingStop()
    success('文件生成成功...')
  }

  /**
   * @description 编译生成文件
   * @param files 文件内容
   * @param dir 文件路径
   */
  async generateFiles (files: Record<string, string> | string, dir = this.baseDir) {
    const currFiles = await fs.readdir(dir)

    const promises = _.map(files, async (value: string | Record<string, string>, name) => {
      const currPath = `${dir}/${name}`

      if (typeof value === 'string') {
        if (currFiles.includes(name)) {
          const state = await fs.lstat(currPath)
          if (state.isDirectory()) {
            await fs.unlink(currPath)
            return fs.writeFile(currPath, this.formatFile(value))
          } else {
            const newValue = this.formatFile(value)
            const currValue = await fs.readFile(currPath, 'utf-8')

            if (newValue !== currValue) {
              return fs.writeFile(currPath, this.formatFile(value, name))
            }

            return
          }
        } else {
          return fs.writeFile(currPath, this.formatFile(value, name))
        }
      }

      // 新路径为文件夹
      if (currFiles.includes(name)) {
        const state = await fs.lstat(currPath)

        if (state.isDirectory()) {
          return this.generateFiles(files[name], currPath)
        } else {
          await fs.unlink(currPath)
          await fs.mkdir(currPath)

          return this.generateFiles(files[name], currPath)
        }
      } else {
        await fs.mkdir(currPath)

        return this.generateFiles(files[name], currPath)
      }
    })

    await Promise.all(promises)
  }

  public formatFile (code: string, name = '') {
    if (name && name.endsWith('.json')) {
      return code
    }

    return format(code, this.prettierConfig)
  }
}

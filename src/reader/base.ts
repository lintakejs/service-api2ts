import fetch from 'node-fetch'
import * as fs from 'fs-extra'
import { loadingStart, loadingStop, success } from '../debugLog'
import { DataSourceConfig } from '../config/config'
import { StandardDataSource } from '../standard/'
import { isUrl } from '../utils'

export class OriginBaseReader {
  constructor (protected config: DataSourceConfig) {}

  /**
   * @description 数据转换，可覆盖
  */
  transform2Standard (data) {
    return data
  }

  /**
   * @description 数据获取方法（本地/远程）
   * @param config 基础配置
   */
  fetchMethod (config: DataSourceConfig) {
    return fetch(config.originUrl).then(async res => {
      const sourceData = await res.text()
      return sourceData
    })
  }

  /**
   * @description 获取远程数据
   */
  async fetchData () {
    // 获取数据源
    loadingStart('获取远程数据中...')
    const swaggerJsonStr: string = isUrl(this.config.originUrl) ? await this.fetchMethod(this.config) : await fs.readFileSync(this.config.originUrl)

    const data = await JSON.parse(swaggerJsonStr)
    loadingStop()
    success('远程数据获取成功！')

    return data
  }

  /**
   * @description 获取接口数据，并解析返回
   */
  async fetchRemoteData (): Promise<StandardDataSource> {
    try {
      const data = await this.fetchData()
      const remoteDataSource = this.transform2Standard(data)
      success('远程数据解析完毕!')
      return remoteDataSource
    } catch (e) {
      loadingStop()
      throw new Error('读取远程接口数据失败！' + e.toString())
    }
  }
}

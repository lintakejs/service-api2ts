import * as path from 'path'
import * as fs from 'fs-extra'
import * as prettier from 'prettier'
import * as ts from 'typescript'
import { Manager } from './manage'
import { error } from './debugLog'
import { DataSourceConfig, Surrounding } from './config/config'

const PROJECT_ROOT = process.cwd()

export async function generatorApi (configFile: string) {
  const configPath = path.join(PROJECT_ROOT, configFile)
  const config = DataSourceConfig.createFromConfigPath(configPath)
  const manager = new Manager(config)

  await manager.remoteApiJson()

  return manager
}
/**
 * @description 判断是否http/https的url
 * @param str 需要验证的字符串
 * @returns {boolean}
 */
export function isUrl (str: string) {
  return /(http|https):\/\/([\w.]+\/?)\S*/.test(str)
}
/**
 * @description 解析用户模板文件并执行
 * @param templatePath 用户模板
 * @param required 是否必须执行
 */
export function getTemplate (templatePath: string, required = true) {
  if (!fs.existsSync(templatePath)) {
    if (required) {
      throw new Error('不存在模板文件！')
    } else {
      return undefined
    }
  }
  const tsResult = fs.readFileSync(templatePath, 'utf8')
  const jsResult = ts.transpileModule(tsResult, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2015,
      module: ts.ModuleKind.CommonJS
    }
  })
  const resovleTemplatePath = templatePath.replace('.ts', '')
  const noCacheFix = (Math.random() + '').slice(2, 5)
  const jsName = resovleTemplatePath + noCacheFix + '.js'
  let templateResult

  try {
    fs.writeFileSync(jsName, jsResult.outputText, 'utf8')
    templateResult = require(jsName)
    fs.removeSync(jsName)
  } catch (e) {
    if (fs.existsSync(jsName)) {
      fs.removeSync(jsName)
    }
    if (!templateResult) {
      throw new Error('模板文件编译错误！')
    }
  }
  return templateResult.default
}
/**
 * @description 将空格切割字符串转为 - 切割
 * @param str 字符串
 */
export function toDashCase (str: string) {
  const dashStr = str
    .split(' ')
    .join('')
    .replace(/[A-Z]/g, p => '-' + p.toLowerCase())

  if (dashStr.startsWith('-')) {
    return dashStr.slice(1)
  }

  return dashStr
}

/**
 * @description 字符串首字母大写
 */
export function toUpperFirstLetter (text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
/**
 * @description 获取最大相同路径字符串
 * @param paths 路径列表
 * @param samePath 已存在的相同路径
 */
export function getMaxSamePath (paths: string[], samePath = ''): string {
  if (!paths.length) {
    return samePath
  }

  if (paths.some(path => !path.includes('/'))) {
    return samePath
  }

  const segs = paths.map(path => {
    const [firstSeg, ...restSegs] = path.split('/')
    return { firstSeg, restSegs }
  })

  if (segs.every((seg, index) => index === 0 || seg.firstSeg === segs[index - 1].firstSeg)) {
    return getMaxSamePath(
      segs.map(seg => seg.restSegs.join('/')),
      samePath + '/' + segs[0].firstSeg
    )
  }

  return samePath
}
/**
 * @description 从路径中获取唯一id
 * @param url 路径字符串
 * @param requestType 请求方式
 * @param samePath 最大相同路径字符串
 */
export function getIdentifierFromUrl (url: string, requestType: string, samePath = '') {
  const currUrl = url.slice(samePath.length).match(/([^\.]+)/)[0]

  return (
    requestType +
    currUrl
      .split('/')
      .map(str => {
        if (str.includes('-')) {
          str = str.replace(/(\-\w)+/g, (_match, p1) => {
            if (p1) {
              return p1.slice(1).toUpperCase()
            }
          })
        }

        if (str.match(/^{.+}$/gim)) {
          return 'By' + toUpperFirstLetter(str.slice(1, str.length - 1))
        }
        return toUpperFirstLetter(str)
      })
      .join('')
  )
}
// 部分的关键词存在java与typescript，做映射修改
const TS_KEYWORDS = ['delete', 'export', 'import', 'new', 'function']
const REPLACE_WORDS = ['remove', 'exporting', 'importing', 'create', 'functionLoad']
// 部分的关键词存在java与typescript，做映射修改

/**
 * @description 从唯一字符串中提取可识别的唯一id
 * @param operationId 唯一id
 */
export function getIdentifierFromOperatorId (operationId: string) {
  const identifier = operationId.replace(/(.+)(Using.+)/, '$1')

  const index = TS_KEYWORDS.indexOf(identifier)

  if (index === -1) {
    return identifier
  }

  return REPLACE_WORDS[index]
}
/**
 * @description 修正模块名称，避免. \ /特殊字符影响
 * @param modName 模块名称
 */
export function reviseModName (modName: string) {
  return modName
    .replace(/\//g, '.')
    .replace(/^\./, '')
    .replace(/\./g, '_')
}

/** 正则检测是否包含中文名 */
export function hasChinese (str: string) {
  return (
    str &&
    str.match(/[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uff1a\uff0c\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]|[\uff01-\uff5e\u3000-\u3009\u2026]/)
  )
}
/** 解析字符串json */
export function jsonStingTransformObject (jsStr) {
  return typeof jsStr === 'string' ? JSON.parse(jsStr) : jsStr
}
/**
 * @description 解析驼峰
 */
export function transformCamelCase (name: string) {
  let words = [] as string[]
  let result = ''

  if (name.includes('-')) {
    words = name.split('-')
  } else if (name.includes(' ')) {
    words = name.split(' ')
  } else {
    if (typeof name === 'string') {
      result = name
    } else {
      throw new Error('mod name is not a string: ' + name)
    }
  }

  if (words && words.length) {
    result = words
      .map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      })
      .join('')
  }

  result = result.charAt(0).toLowerCase() + result.slice(1)

  if (result.endsWith('Controller')) {
    result = result.slice(0, result.length - 'Controller'.length)
  }

  return result
}

/**
 * @description 获取js/ts后缀文件名
 * @param fileName 文件名
 * @param surrounding 文件类型
 */
export function getFileName (fileName: string, surrounding: string) {
  const surroundType = Surrounding[surrounding]
  switch (surroundType) {
    case 'typeScript':
      return `${fileName}.ts`
    case 'javaScript':
      return `${fileName}.js`
    default:
      return `${fileName}.ts`
  }
}
/**
 * @description 格式化文件
 * @param fileContent 文件内容字符串
 * @param prettierOpts prettier配置信息
 */
export function format (fileContent: string, prettierOpts: Record<string, string>) {
  try {
    return prettier.format(fileContent, {
      parser: 'typescript',
      trailingComma: 'all',
      singleQuote: true,
      ...prettierOpts
    })
  } catch (e) {
    error(`代码格式化报错！${e.toString()}\n代码为：${fileContent}`)
    return fileContent
  }
}

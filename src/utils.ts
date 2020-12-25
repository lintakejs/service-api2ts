import * as path from 'path'
import * as fs from 'fs-extra'
import * as prettier from 'prettier'
import * as ts from 'typescript'
import { Manager } from './manage'
import { error } from './debugLog'
import { DataSourceConfig, Surrounding } from './config/config'
import { Mod } from './standard'

const PROJECT_ROOT = process.cwd()

export async function createManager(configFile: string) {
  const configPath = path.join(PROJECT_ROOT, configFile)
  const config = DataSourceConfig.createFromConfigPath(configPath)
  const manager = new Manager(config)

  await manager.ready()

  return manager
}

export function getTemplate(templatePath: string, required = true) {
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
  } catch(e) {
    if (fs.existsSync(jsName)) {
      fs.removeSync(jsName);
    }
    if (!templateResult) {
      throw new Error('模板文件编译错误！');
    }
  }
  return templateResult.default
}

export function toDashCase(name: string) {
  const dashName = name
    .split(' ')
    .join('')
    .replace(/[A-Z]/g, p => '-' + p.toLowerCase());

  if (dashName.startsWith('-')) {
    return dashName.slice(1);
  }

  return dashName;
}


export function toUpperFirstLetter(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function getMaxSamePath(paths: string[], samePath = '') {
  if (!paths.length) {
    return samePath
  }

  if (paths.some(path => !path.includes('/'))) {
    return samePath
  }

  const segs = paths.map(path => {
    const [firstSeg, ...restSegs] = path.split('/');
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

export function getIdentifierFromUrl(url: string, requestType: string, samePath = '') {
  const currUrl = url.slice(samePath.length).match(/([^\.]+)/)[0];

  return (
    requestType +
    currUrl
      .split('/')
      .map(str => {
        if (str.includes('-')) {
          str = str.replace(/(\-\w)+/g, (_match, p1) => {
            if (p1) {
              return p1.slice(1).toUpperCase();
            }
          });
        }

        if (str.match(/^{.+}$/gim)) {
          return 'By' + toUpperFirstLetter(str.slice(1, str.length - 1));
        }
        return toUpperFirstLetter(str);
      })
      .join('')
  );
}

export function reviseModName(modName: string) {
  return modName
    .replace(/\//g, '.')
    .replace(/^\./, '')
    .replace(/\./g, '_')
}

/** 正则检测是否包含中文名 */
export function hasChinese(str: string) {
  return (
    str &&
    str.match(
      /[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uff1a\uff0c\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]|[\uff01-\uff5e\u3000-\u3009\u2026]/
    )
  );
}
/** 解析驼峰 */
export function transformCamelCase(name: string) {
  let words = [] as string[];
  let result = '';

  if (name.includes('-')) {
    words = name.split('-');
  } else if (name.includes(' ')) {
    words = name.split(' ');
  } else {
    if (typeof name === 'string') {
      result = name;
    } else {
      throw new Error('mod name is not a string: ' + name);
    }
  }

  if (words && words.length) {
    result = words
      .map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');
  }

  result = result.charAt(0).toLowerCase() + result.slice(1);

  if (result.endsWith('Controller')) {
    result = result.slice(0, result.length - 'Controller'.length);
  }

  return result;
}
/** 部分的关键词存在java与typescript */
export function transformModsName(mods: Mod[]) {
  // 检测所有接口是否存在接口名忽略大小写时重复，如果重复，以下划线命名
  mods.forEach(mod => {
    const currName = mod.name;
    const sameMods = mods.filter(mod => mod.name.toLowerCase() === currName.toLowerCase());

    if (sameMods.length > 1) {
      mod.name = transformDashCase(mod.name);
    }
  });
}
/** 将大写变成 - 连接 */
export function transformDashCase(name: string) {
  return name.replace(/[A-Z]/g, ch => '_' + ch.toLowerCase());
}
/** 获取文件名 */
export function getFileName(fileName: string, surrounding: string) {
  const surroundType = Surrounding[surrounding]
  switch(surroundType) {
    case 'typeScript':
      return `${fileName}.ts`
    case 'javaScript':
      return `${fileName}.js`
    default:
      return `${fileName}.ts`
  }
}
/** 格式化文件 */
export function format(fileContent: string, prettierOpts = {}) {
  try {
    return prettier.format(fileContent, {
      parser: 'typescript',
      trailingComma: 'all',
      singleQuote: true,
      ...prettierOpts
    });
  } catch (e) {
    error(`代码格式化报错！${e.toString()}\n代码为：${fileContent}`);
    return fileContent;
  }
}
/** 部分的关键词存在java与typescript */
const TS_KEYWORDS = ['delete', 'export', 'import', 'new', 'function'];
const REPLACE_WORDS = ['remove', 'exporting', 'importing', 'create', 'functionLoad'];

export function getIdentifierFromOperatorId(operationId: string) {
  const identifier = operationId.replace(/(.+)(Using.+)/, '$1');

  const index = TS_KEYWORDS.indexOf(identifier);

  if (index === -1) {
    return identifier;
  }

  return REPLACE_WORDS[index];
}
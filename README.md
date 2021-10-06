# service-api2ts

一个使用命令行执行api自动化构建维护工具，主要面对的痛点：
1. typescript 对于api差异化的改动频繁造成的遗漏问题。
2. 对于 api 服务多方改动引起的无效沟通过多问题。
3. 前端目前对服务器 mock 自动化不足问题。

[工具架构图](./static/service-api2ts.xmind)
## 如何使用？
首先安装插件
```nodejs
npm i service-api2ts -D
```
编写配置文件，以下涉及目录路径均已项目根目录为相对路径
```json
{
  // 远程/本地 api.json 路径，目前只支持swagger v2 与 yapi
  "originUrl": "",
  // "api.json的类型
  "originType": "SwaggerV2 | Yapi",
  // 请求远程 api.json 附带的参数，会被添加至请求body
  "originReqBody": {},
  // api库名称
  "name"?: "",
  // 本地api文件模板路径，只支持 .ts 文件
  "modsTemplatePath": "",
  // 输出文件路径
  "outDir": "",
  // 是否要生成mock文件
  "mocksDev": false,
  // 匹配相对应 path 的api执行mock生成
  "mocksModsReg": RegExp
}
```
编写modsTemplate文件，service-api2ts将api文件的生成规则交由用户自己实现，内部编译时会执行该ts文件，生成相对应的ts代码，写入文件。
```javascript
import { StandardInterface } from 'service-api2ts'
// StandardInterface 带来如下信息
// StandardInterface.bodyParamsCode 为 api body中的参数类型/集合
// StandardInterface.paramsCode 为 api query 中的参数类型/集合，query本身的特殊性，一般不会是一个完整类型
// StandardInterface.formParamsCode 为 api formData 类型的参数集合
// StandardInterface.method api 请求 method
// StandardInterface.path api 请求路径
// StandardInterface.responseType api 返回类型

export default function (inter: StandardInterface) {
  const dataType = 混合 formParamsCode | paramsCode | bodyParamsCode 类型
  return `
    export default function (data: dataType) {
      return axios.${inter.method}<${inter.responseType}>('${inter.path}', data)
    }
  `
}
```
命令行执行生成文件
```nodejs
npx api2ts create 配置文件路径
```
执行结果

![avatar](/static/demo.gif)

### 缺陷未解决
1. 多人协作带来的分支不同，同步后导致类型不对。这个问题考虑限制更新范围来解决。
2. mock不够灵活，毕竟按照简单数据类型来生成，对于数据字典等有上下映射关系的无能为力。
3. 多数据源的管理能力较弱，还是需要使用多配置文件来处理。
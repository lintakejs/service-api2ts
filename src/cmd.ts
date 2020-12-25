import * as program from 'commander'
import * as path from 'path'
import * as fs from 'fs-extra'
import { error } from './debugLog'
import { createManager } from './utils'

const packageFilePath = path.join(__dirname, '..', 'package.json')
const packageInfo = JSON.parse(fs.readFileSync(packageFilePath, 'utf8'))
const currentVersion = packageInfo.version

program.description('base swagger v2 generator api code')
program.version(currentVersion)

program.command('create [config-file]').action(async (filePath) => {
  try {
    await createManager(filePath)
  } catch(e) {
    error(e)
    process.exit(1)
  }
})

program.parse(process.argv)
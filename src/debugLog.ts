import * as ora from 'ora'
import * as chalk from 'chalk'

const spinner = ora()

export function info (info: string) {
  spinner.info(chalk.bold.blue(info))
}

export function error (info: string) {
  spinner.fail(chalk.bold.red(info))
}

export function warn (info: string) {
  spinner.warn(chalk.bold.yellow(info))
}

export function success (info: string) {
  spinner.succeed(chalk.bold.green(info))
}

export function loadingStart (info: string) {
  spinner.start(chalk.bold.blue(info))
}

export function loadingStop () {
  spinner.stop()
}

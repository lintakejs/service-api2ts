"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadingStop = exports.loadingStart = exports.success = exports.warn = exports.error = exports.info = void 0;
const ora = require("ora");
const chalk = require("chalk");
const spinner = ora();
function info(info) {
    spinner.info(chalk.bold.blue(info));
}
exports.info = info;
function error(info) {
    spinner.fail(chalk.bold.red(info));
}
exports.error = error;
function warn(info) {
    spinner.warn(chalk.bold.yellow(info));
}
exports.warn = warn;
function success(info) {
    spinner.succeed(chalk.bold.green(info));
}
exports.success = success;
function loadingStart(info) {
    spinner.start(chalk.bold.blue(info));
}
exports.loadingStart = loadingStart;
function loadingStop() {
    spinner.stop();
}
exports.loadingStop = loadingStop;
//# sourceMappingURL=debugLog.js.map
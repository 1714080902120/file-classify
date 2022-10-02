import { resolve, isAbsolute, basename } from "path";
import {
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  copyFileSync,
  readFileSync,
} from "fs";

import {
  getRandomHash,
  getSuffix,
  IGNORE_STR,
  isDir,
} from "./utils.js";

import chalk from "chalk";

export class Classify {
  constructor(options = {}) {
    const { baseDir, needJson, saveDir, ignores } = options;
    // target file base path, use current project path in default
    this.baseDir = this.resolvePath(baseDir);
    // current dir path, will change when enter other dir
    this.savePath = this.resolvePath(saveDir);
    // the target dir cur path
    this.targetDir = this.baseDir;
    // need create json file in every path
    this.needJson = needJson;
    // final json
    this.json = {};
    // ignores
    this.initIgnores(ignores);
  }

  initIgnores(ignores = "") {
    ignores = ignores.trim();
    this.ignore = new RegExp(
      `${IGNORE_STR}${ignores.length > 0 ? "|" : ""}${ignores}`,
      "i"
    );
  }

  // start to run
  async run() {
    try {
      console.log(chalk.green("start classify"));
      // create a dir in order to separate old and new
      await this.mkDir(this.savePath);
      await this.resetJSON(this.savePath);
      await this.classify(this.targetDir);
    } catch (error) {
      console.log(chalk.red("classify fail"));
    } finally {
      process.nextTick(() => {
        this.createJsonFile();
        console.log(chalk.green("classify done ."));
      });
    }
  }

  async classify(curPath) {
    try {
      const res = readdirSync(curPath);
      for (let i = 0; i < res.length; i++) {
        const name = res[i];
        const path = resolve(curPath, name);
        if (this.needIgnore(path)) {
          continue;
        } else if (isDir(path)) {
          this.classify(path);
        } else {
          await this.copy(name, curPath);
        }
      }
      return;
    } catch (error) {
      console.log(
        chalk.red(
          `something wrong when classify path: ${curPath}; error: ${error}`
        )
      );
    }
  }

  async copy(filename, path) {
    const { suffix, name } = getSuffix(filename);
    const dirPath = resolve(this.savePath, suffix);
    const filePath = resolve(path, filename);
    if (!existsSync(dirPath)) {
      await this.mkDir(dirPath);
    }

    await this.copyFile({ dirPath, filePath, filename, suffix, name });
  }

  async copyFile({ dirPath: targetDir, filePath, filename, suffix, name }) {
    let targetFilePath = resolve(targetDir, filename);

    if (!existsSync(filePath)) {
      console.log(chalk.red(`file ${filePath} isn't esist !`));
      return;
    } else if (existsSync(targetFilePath)) {
      console.log(
        chalk.red("file is exist ! i will rename by add a hash in the filename")
      );
      const randomStr = getRandomHash();
      filename = `${randomStr}${filename}`;
      name = `${randomStr}${name}`;
      targetFilePath = resolve(targetDir, filename);
    }
    await copyFileSync(filePath, targetFilePath);
    await this.writeInJson(suffix, name, filename);
  }

  async mkDir(path) {
    path = resolve(this.baseDir, path);
    if (existsSync(path)) {
      return;
    }
    await mkdirSync(path);
  }

  async writeInJson(suffix, name, filename) {
    if (!this.needJson) return;

    if (!this.json[suffix]) {
      this.json[suffix] = {};
    }
    this.json[suffix][name] = filename;
  }

  async resetJSON(path) {
    if (!this.needJson) return;
    const targetPath = resolve(path, "map.json");
    if (existsSync(targetPath)) {
      const objStr = readFileSync(targetPath).toString();
      this.json = JSON.parse(objStr);
    }
  }

  createJsonFile() {
    if (!this.needJson) return;
    const buff = Buffer.from(JSON.stringify(this.json));
    writeFileSync(resolve(this.savePath, "map.json"), buff);
  }

  resolvePath(baseDir) {
    const path = process.cwd();
    return !baseDir
      ? path
      : isAbsolute(baseDir)
      ? baseDir
      : basename(path) === baseDir
      ? path
      : resolve(path, baseDir);
  }

  needIgnore (path) {
    return this.ignore.test(path);
  }
}

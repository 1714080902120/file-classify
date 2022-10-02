import { lstatSync } from "fs";

const IMG_TYPE = /\.(png|svg|jpg|jpeg|webp|gif)$/gi;
const IGNORE = /\.git|node_modules|package.json|package-lock.json|yarn.lock|__DONE/gi;
const SUFFIX = /\.(.*)/gi;

export function isImg(name) {
  return IMG_TYPE.test(name);
}

export function error(msg) {
  throw new Error(msg);
}

export function needIgnore(path) {
  return IGNORE.test(path);
}

export function isDir(path) {
  return lstatSync(path).isDirectory();
}

export function getSuffix(name) {
  if (name.indexOf(".") === -1) {
    return {
        suffix: "unknown",
        name
    };
  } else {
    const list = name.split(".");
    const suffix = list.pop();
    return {
        suffix,
        name: list.join('.')
    }
  }
}

export function getRandomHash() {
  return Math.random().toString(36).substring(2, 7);
}

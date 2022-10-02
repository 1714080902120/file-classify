import inquirer from "inquirer";
import { basename } from "path";

export function question(path) {
  return inquirer.prompt([
    {
      type: "input",
      name: "baseDir",
      message: "copy target dir",
      default: basename(path),
    },
    {
      type: 'input',
      name: 'saveDir',
      message: 'save target dir',
      default: '../__DONE'
    },
    {
      type: "confirm",
      name: "needJson",
      message: "need a json file which is a map for all files?",
      default: true,
    },
  ]);
}

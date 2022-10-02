import { Command } from 'commander';
import { question } from '../lib/question.js';
import { Classify } from '../index.js'

const program = new Command();

program.name('classify-file')
.description('a tool can auto classify your file, and create a json file finally')
.option('-D, --default', 'use default options')
.action(async (options) => {
    const path = process.cwd();
    let param = {
        baseDir: path,
        needJson: true,
        saveDir: '../__DONE'
    }

    if (!options.default) {
        param = await question(path);
    }
    
    const classify = new Classify(param);
    await classify.run()
})


program.command('classify-file')
.description('the command to classify your file')




program.parse(process.argv);
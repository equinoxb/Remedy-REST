import handlebars from 'handlebars'
import fs from 'fs'
import {logger} from './logs/logger.js'
import cfg from './config.js'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function WriteTACCases(data){ 
    let template = handlebars.compile(fs.readFileSync(cfg.templateFileName).toString())
    fs.readdirSync(path.join(__dirname, '/templates/partials/')).forEach(file => {
        handlebars.registerPartial(file.split('.')[0], handlebars.compile(fs.readFileSync(path.join(__dirname, `/templates/partials/${file}`)).toString()))
      })
    let outputString = template(data)
    fs.writeFileSync(cfg.fileName, outputString)
    logger.info("Data write to the file " + cfg.fileName)
} 
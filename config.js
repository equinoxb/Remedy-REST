import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

 const CONFIG ={
    userName: process.env.REMEDY_USERNAME,
    password: process.env.REMEDY_PASSWORD,
    baseUrl: process.env.REMEDY_BASEURL,
    days: process.env.DAYS,
    fileName: path.resolve(process.env.FILENAME),
    templateFileName: process.env.TEMPLATE_PATH ? path.resolve(process.env.TEMPLATE_PATH) : './templates/layout/template.hbs',
    chunks: process.env.CHUNKS,
};

export default CONFIG


import { Login, Logout, Pagination, cases } from './functions.js'
import  {logger}  from './logs/logger.js'
import { WriteTACCases } from './handlebars.js'
import cfg from './config.js'

async function Main(){
    try{
        if(!cfg.userName || !cfg.password || !cfg.fileName || !cfg.chunks || !cfg.days || !cfg.baseUrl) throw new Error("Incorrect config file")
        const JWT = await Login()
        await Pagination(JWT)
        await WriteTACCases(cases)
        await Logout(JWT)
    }
    catch(e){
        logger.error("Произошла ошибка: " + e)
    }
}
await Main()
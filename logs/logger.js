import log4js from 'log4js'

log4js.configure({
    appenders: {
      fileAppender: {type: 'file', filename: './logs/app.log'},
      console: {type: 'console'}
    },
    categories: {default: {appenders: ['fileAppender', 'console'], level: 'info'}},
  });
  
  export const logger = log4js.getLogger();
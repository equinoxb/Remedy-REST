import rp from 'request-promise'
import {logger} from './logs/logger.js'
import cfg from './config.js'

export async function Login() {
  let data = ''
  let options = {
  'method': 'POST',
  'url': `${cfg.baseUrl}/jwt/login`,
  resolveWithFullResponse: true,
  'headers': {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  form: {
    'username': cfg.userName,
    'password': cfg.password
    }
  };

  let response = await rp(options)
  if(response.statusCode != 200){
      throw new Error(response.statusCode)
    }
  else {      
    logger.info(`JWT received. Status Code: ${response.statusCode} ${response.statusMessage}`);
    data = response.body
     }
  return data
}

export async function Pagination(JWT){
  let limit = 0
  let data= {}
  let counter = 0
  let type = ''
  
  for(let offset = 0; limit <= offset; offset = offset + parseInt(cfg.chunks)){
    limit = cfg.chunks
    type = 'TAC'
    data = JSON.parse(await getData(JWT, offset, limit, type))
    counter += parseInt(cfg.chunks)
    logger.info(`Number of TAC CallID: ${counter}`)
    await ArrData(data, type)
    if(data.entries.length != limit){
      limit = 0
      counter = 0
      break
    } 
  }
  
  for(let offset = 0; limit <= offset; offset = offset + parseInt(cfg.chunks)){
    limit = cfg.chunks
    type = 'RMA'
    data = JSON.parse(await getData(JWT, offset, limit, type))
    counter += data.entries.length
    logger.info(`Number of RMA CallID: ${counter}`)
    await ArrData(data, type)
    if(data.entries.length != limit){
      limit = 0
      counter = 0
      break
    }
  }

  for(let offset = 0; limit <= offset; offset = offset + parseInt(cfg.chunks)){
    limit = cfg.chunks
    type = 'Vendor'
    data = JSON.parse(await getData(JWT, offset, limit, type))
    counter += data.entries.length
    logger.info(`Number of Vendor CallID: ${counter}`)
    await ArrData(data, type)
    if(data.entries.length != limit) {
      limit = 0
      counter = 0
      break
    }
  }

  for(let offset = 0; limit <= offset; offset = offset + parseInt(cfg.chunks)){
    limit = cfg.chunks
    type = 'Onsite'
    data = JSON.parse(await getData(JWT, offset, limit, type))
    counter += data.entries.length
    logger.info(`Number of Onsite TaskID: ${counter}`)
    await ArrData(data, type)
    if(data.entries.length != limit){
      limit = 0
      counter = 0
      return
    }
  }
}

async function getData(JWT, offset, limit, type){
  let data = ''
  let url = ''
  let currentDate = new Date()
  currentDate.setDate(currentDate.getDate() - cfg.days)
  let closedDate = '%27CloseTimestamp%27%3C'+ encodeURIComponent('"'+ currentDate.toISOString().split('.')[0]+'.000+0000'+'"')
  let closedDateVend = '%27LastUpdate%27%3C'+ encodeURIComponent('"'+ currentDate.toISOString().split('.')[0]+'.000+0000'+'"')
  let closedDateOnsite = '%27ActualEndTime%27%3C'+ encodeURIComponent('"'+ currentDate.toISOString().split('.')[0]+'.000+0000'+'"')
  switch(type){
    case 'TAC': 
      url = cfg.baseUrl + `/arsys/v1/entry/ACS:TACCase?fields=values(RequestID, CASEID)&offset=${offset}&limit=${limit}&q=${closedDate}AND%27Progress%27+%3D+%22CLOSED%22`
      break
    case 'RMA': 
      url = cfg.baseUrl + `/arsys/v1/entry/ACS:RMACase?fields=values(RequestID, CASEID)&offset=${offset}&limit=${limit}&q=${closedDate}AND%27Progress%27+%3D+%22END%22`
      break
    case 'Vendor': 
      url = cfg.baseUrl + `/arsys/v1/entry/ACS:VendorCase?fields=values(RequestID)&offset=${offset}&limit=${limit}&q=${closedDateVend}AND%27Progress%27+%3D+%22CLOSED%22`
      break
    case 'Onsite': 
      url = cfg.baseUrl + `/arsys/v1/entry/ACS:OnsiteTask?fields=values(Task ID)&offset=${offset}&limit=${limit}&q=${closedDateOnsite}AND%27Progress%27+%3D+%22Closed%22`
      break
  }
  
    let options = {
    'method': 'GET',
    'url': url,
     resolveWithFullResponse: true,
    'headers': {
      'Authorization': `AR-JWT ${JWT}`,
      'Content-Type': 'application/json'
    }
  };

  let response = await rp(options)
    if(response.statusCode != 200){
      throw new Error(response.statusCode)
    }
    else {      
      logger.info(`Data received. Status Code: ${response.statusCode} ${response.statusMessage}`);
      data = response.body
    }
    return data
}

export let cases = {
  TAC: [],
  RMA: [],
  Vendor: [],
  Onsite: [],
}

async function ArrData(data, type){
  for (let i = 0; data.entries.length > i; i++) {
    for (const [key, value] of Object.entries(data.entries[i])) {
      switch(type){
        case 'TAC': 
          cases.TAC.push({CallIdTAC: value["RequestID"], CaseIdTAC: value["CASEID"]})
          break
        case 'RMA': 
          cases.RMA.push({CallIdRMA: value["RequestID"], CaseIdRMA: value["CASEID"]})
          break
        case 'Onsite': 
          cases.Onsite.push({TASKIdOnsite: value["Task ID"]})
          break
        case 'Vendor': 
          cases.Vendor.push({RequestIdVendor: value["RequestID"]})
          break
      }   
    }
  }
  logger.info("Data added to the array")
}

export async function Logout(JWT) {
  let options = {
    'method': 'POST',
    'url': `${cfg.baseUrl}/jwt/logout`,
    resolveWithFullResponse: true,
    'headers': {
      'Authorization': `AR-JWT ${JWT}`
    },
    form: {}
  };

  let response = await rp(options)
    if(response.statusCode != 204){
      throw new Error(response.statusCode)
    }
    else {      
      logger.info(`Logout. Status Code: ${response.statusCode} ${response.statusMessage}`);
    }
}
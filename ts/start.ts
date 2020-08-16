/* eslint-disable no-console */
import { FileBox } from 'file-box' // 发送文件的模块
import XLSX from 'xlsx' // 操作Excel的模块
import { log } from 'wechaty' // wechat
import { Robot } from './robot' // 机器人类
const pkg = require('../package.json')

// 创建微信机器人实例，第一个参数token，第二个参数微信名
const botsArr:any[] = []
pkg.bots.map((bot: any) => {
  botsArr.push(new Robot(bot.token, bot.name).start())
})
async function start () {
  const robots = await Promise.all(botsArr)
  const botObjs:any = {} // 创建机器人对象，方便后面读取
  robots.map((bot:any) => {
    botObjs[bot['wechatName']] = bot
  })
  log.info('----------全部微信号登录成功,开启自动发言模式----------')
  const workbook:any = XLSX.readFile('../MsgFile2.xlsx') // 读取xlsx文件
  const rowLength = Number(workbook.Sheets.Sheet1['!ref'].split(':')[1].substr(1)) // 表格行数长度
  let countDownTime:any = 0
  for (let i = 2; i <= rowLength; i++) { // 循环Excel表格读取数据，默认第二行开始读
    if (workbook.Sheets.Sheet1['A' + i]['v'] === '暂停') { // 开始下一段剧本
      log.info(`----------当前计划执行完毕，下一段剧本将在：${workbook.Sheets.Sheet1['B' + i]['w']} 开启----------`)
      // 0时区，时间需要+8.计算出下一次发言需要经过几毫秒
      const d:any = new Date(workbook.Sheets.Sheet1['B' + i]['w'])
      const dNow:any = new Date()
      const dTrans:any = new Date(d.setHours(d.getHours() + 8))
      const dNowTrans:any = new Date(dNow.setHours(dNow.getHours() + 8))
      countDownTime =  dTrans - dNowTrans
      i++ // 跳到下一行
    } else { // 正常按顺序读
      countDownTime = workbook.Sheets.Sheet1['B' + i]['v'] * 1000 // 每条文本的发言间隔时间
    }
    let room = await botObjs[workbook.Sheets.Sheet1['C' + i]['v']].Room.find({ topic: workbook.Sheets.Sheet1['A' + i]['v'] }) // 对应的微信所在的房间
    await new Promise((resolve, reject) => { // 间隔设定的时间发送消息
      try {
        setTimeout(() => {
          const text = workbook.Sheets.Sheet1['D' + i]['v']
          if (text.startsWith('[图]')) { // 图片消息
            const fileBox = FileBox.fromFile(`../images/${text.substr(3)}`)
            room.say(fileBox)
            log.info(`--${text}--`)
          } else if (text.startsWith('[@')) { // @消息
            const txt = (text.split(']'))[1] // 要发送的消息
            const cont = ((text.split(']'))[0]).substr(2) // 要@的联系人
            botObjs[workbook.Sheets.Sheet1['C' + i]['v']].Contact.find({ name: cont }).then((contact: any) => {
              log.info(`--${txt} @${contact}--`)
              return room.say(txt, contact)
            }).catch((err: string) => log.warn(err))
          } else if (text.startsWith('[推送微信]')) { // 推送联系人
            const cont = (text.split(']'))[1] // 要推送的联系人
            botObjs[workbook.Sheets.Sheet1['C' + i]['v']].Contact.find({ name: cont }).then((contact: any) => {
              log.info(`-- 推送：${contact} --`)
              return room.say(contact)
            }).catch((err: string) => log.warn(err))
          } else {
            room.say(text) // 在房间里面发言
            log.info(`--${text}--`)
          }
          resolve()
        }, countDownTime)
      } catch (err) {
        reject(err)
      }
    })
  }
  log.info('----------任务执行完毕----------')
}
start().then(res => res).catch((err) => { throw err })

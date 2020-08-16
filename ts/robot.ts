import { PuppetPadplus } from 'wechaty-puppet-padplus' // wechat-puppet
import { Wechaty, ScanStatus, log } from 'wechaty' // wechat

class Robot { // 机器人类

  token: string // 微信的token
  name: string // wechaty名
  bot: any //  bot实例
  constructor (token:string, name: string) { // 启动时一个微信只能用一个token，即一个token对应一个name
    this.token = token
    this.name = name
    const puppet = new PuppetPadplus({ // 创建padplus实例 https://github.com/wechaty/wechaty-puppet-padplus
      token,
    })
    this.bot = new Wechaty({
      name,
      puppet,
    })
    this.bot.wechatName = name
  }
  start ():any {
    return new Promise((resolve, reject):void => {
      try {
        this.bot.on('scan', (qrcode: string | number | boolean, status: ScanStatus) => {
          if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
            require('qrcode-terminal').generate(qrcode, { small: true })  // show qrcode on console
            const qrcodeImageUrl = [
              'https://wechaty.github.io/qrcode/',
              encodeURIComponent(qrcode),
            ].join('')
            log.info(`请扫码，上面为(${this.name})的二维码: 状态：${status === ScanStatus.Waiting ? '等待' : status === ScanStatus.Timeout ? '超时' : '未知'}- 二维码地址：${qrcodeImageUrl}`)
          }
        })
        this.bot.on('login', (user: any) => {
          log.info('--微信：', '%s 登录成功--', user)
          resolve(this.bot)
        })
        this.bot.on('logout', (user: any) => {
          log.info('--微信：', '%s 登出--', user)
        })
        this.bot.start()
      } catch (err) {
        reject(err)
      }
    })
  }

}
export { Robot }

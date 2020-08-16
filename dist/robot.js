"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Robot = void 0;
const wechaty_puppet_padplus_1 = require("wechaty-puppet-padplus"); // wechat-puppet
const wechaty_1 = require("wechaty"); // wechat
class Robot {
    constructor(token, name) {
        this.token = token;
        this.name = name;
        const puppet = new wechaty_puppet_padplus_1.PuppetPadplus({
            token,
        });
        this.bot = new wechaty_1.Wechaty({
            name,
            puppet,
        });
        this.bot.wechatName = name;
    }
    start() {
        return new Promise((resolve, reject) => {
            try {
                this.bot.on('scan', (qrcode, status) => {
                    if (status === wechaty_1.ScanStatus.Waiting || status === wechaty_1.ScanStatus.Timeout) {
                        require('qrcode-terminal').generate(qrcode, { small: true }); // show qrcode on console
                        const qrcodeImageUrl = [
                            'https://wechaty.github.io/qrcode/',
                            encodeURIComponent(qrcode),
                        ].join('');
                        wechaty_1.log.info(`请扫码，上面为(${this.name})的二维码: 状态：${status === wechaty_1.ScanStatus.Waiting ? '等待' : status === wechaty_1.ScanStatus.Timeout ? '超时' : '未知'}- 二维码地址：${qrcodeImageUrl}`);
                    }
                });
                this.bot.on('login', (user) => {
                    wechaty_1.log.info('--微信：', '%s 登录成功--', user);
                    resolve(this.bot);
                });
                this.bot.on('logout', (user) => {
                    wechaty_1.log.info('--微信：', '%s 登出--', user);
                });
                this.bot.start();
            }
            catch (err) {
                reject(err);
            }
        });
    }
}
exports.Robot = Robot;
//# sourceMappingURL=robot.js.map
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
const file_box_1 = require("file-box"); // 发送文件的模块
const xlsx_1 = __importDefault(require("xlsx")); // 操作Excel的模块
const wechaty_1 = require("wechaty"); // wechat
const robot_1 = require("./robot"); // 机器人类
const pkg = require('../package.json');
// 创建微信机器人实例，第一个参数token，第二个参数微信名
const botsArr = [];
pkg.bots.map((bot) => {
    botsArr.push(new robot_1.Robot(bot.token, bot.name).start());
});
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        const robots = yield Promise.all(botsArr);
        const botObjs = {}; // 创建机器人对象，方便后面读取
        robots.map((bot) => {
            botObjs[bot['wechatName']] = bot;
        });
        wechaty_1.log.info('----------全部微信号登录成功,开启自动发言模式----------');
        const workbook = xlsx_1.default.readFile('../MsgFile2.xlsx'); // 读取xlsx文件
        const rowLength = Number(workbook.Sheets.Sheet1['!ref'].split(':')[1].substr(1)); // 表格行数长度
        let countDownTime = 0;
        for (let i = 2; i <= rowLength; i++) { // 循环Excel表格读取数据，默认第二行开始读
            if (workbook.Sheets.Sheet1['A' + i]['v'] === '暂停') { // 开始下一段剧本
                wechaty_1.log.info(`----------当前计划执行完毕，下一段剧本将在：${workbook.Sheets.Sheet1['B' + i]['w']} 开启----------`);
                // 0时区，时间需要+8.计算出下一次发言需要经过几毫秒
                const d = new Date(workbook.Sheets.Sheet1['B' + i]['w']);
                const dNow = new Date();
                const dTrans = new Date(d.setHours(d.getHours() + 8));
                const dNowTrans = new Date(dNow.setHours(dNow.getHours() + 8));
                countDownTime = dTrans - dNowTrans;
                i++; // 跳到下一行
            }
            else { // 正常按顺序读
                countDownTime = workbook.Sheets.Sheet1['B' + i]['v'] * 1000; // 每条文本的发言间隔时间
            }
            let room = yield botObjs[workbook.Sheets.Sheet1['C' + i]['v']].Room.find({ topic: workbook.Sheets.Sheet1['A' + i]['v'] }); // 对应的微信所在的房间
            yield new Promise((resolve, reject) => {
                try {
                    setTimeout(() => {
                        const text = workbook.Sheets.Sheet1['D' + i]['v'];
                        if (text.startsWith('[图]')) { // 图片消息
                            const fileBox = file_box_1.FileBox.fromFile(`../images/${text.substr(3)}`);
                            room.say(fileBox);
                            wechaty_1.log.info(`--${text}--`);
                        }
                        else if (text.startsWith('[@')) { // @消息
                            const txt = (text.split(']'))[1]; // 要发送的消息
                            const cont = ((text.split(']'))[0]).substr(2); // 要@的联系人
                            botObjs[workbook.Sheets.Sheet1['C' + i]['v']].Contact.find({ name: cont }).then((contact) => {
                                wechaty_1.log.info(`--${txt} @${contact}--`);
                                return room.say(txt, contact);
                            }).catch((err) => wechaty_1.log.warn(err));
                        }
                        else if (text.startsWith('[推送微信]')) { // 推送联系人
                            const cont = (text.split(']'))[1]; // 要推送的联系人
                            botObjs[workbook.Sheets.Sheet1['C' + i]['v']].Contact.find({ name: cont }).then((contact) => {
                                wechaty_1.log.info(`-- 推送：${contact} --`);
                                return room.say(contact);
                            }).catch((err) => wechaty_1.log.warn(err));
                        }
                        else {
                            room.say(text); // 在房间里面发言
                            wechaty_1.log.info(`--${text}--`);
                        }
                        resolve();
                    }, countDownTime);
                }
                catch (err) {
                    reject(err);
                }
            });
        }
        wechaty_1.log.info('----------任务执行完毕----------');
    });
}
start().then(res => res).catch((err) => { throw err; });
//# sourceMappingURL=start.js.map
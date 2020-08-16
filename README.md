多个微信配置： 
  1. 当前目录找到package.json文件
  2. 配置bots里面的数据就可以了,一个微信对应一个{}里面的内容，最后一个{}不需要逗号(,)结尾
      "bots": [
        {
          "token": "puppet_padplus_XXXXXXXXXX",
          "name": "微信名"
        },
        {
          "token": "puppet_padplus_XXXXXXXXXX",
          "name": "微信名"
        }
      ]
聊天xlsx文件的格式：
  1. 在当前目录新建名字为MsgFile.xlsx的文件
  2. 格式按照给的那个MsgFile.xlsx配置

启动：
  找到
  "scripts": {
    "start": "node dist/start.js"
  }
  鼠标指到start上，右键运行脚本
  第一次启动需要每个微信扫对应的二维码，后面就不需要扫二维码了
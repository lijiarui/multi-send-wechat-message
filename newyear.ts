import {
    Wechaty
    , Contact
} from 'wechaty'
import log from './logger'

let taskFuncList: Function[] = []
let taskNum = 1

const profile = process.env.TEST_PROFILE
const msg = process.env.MSG

if (profile && msg) {
  const bot = Wechaty.instance({ profile: profile })
  let botName = ''

  bot
    .on('login', function (this, user) {
        botName = user.name()
        processTaskList(taskFuncList)
        setTimeout(_ => {
          send(msg, bot)
        }, 10 * 1000)
        log.info('Bot', `${user.name()} logined`)
    })
    .on('logout', user => {
        log.info('Bot', `${user.name()} logouted`)
    })
    .on('error', e => {
        log.info('Bot', 'error: %s', e)
    })
    .on('scan', (urlstring, code) => {
        if (!/201|200/.test(String(code))) {
            let loginUrl = urlstring.replace(/\/qrcode\//, '/l/')
            require('qrcode-terminal').generate(loginUrl)
        }
        console.log(`${urlstring}\n[${code}] Scan QR Code in above url to login: `)
    })

  bot.init()
    .catch(e => {
        log.error('Bot', 'init() fail: %s', e)
        bot.quit()
        process.exit(-1)
    })
} else {
  throw new Error('cannot find profile and msg')
}

async function send(msg, bot): Promise<void> {
  const contactList = await Contact.findAll()

  log.info('Bot', '#######################')
  log.info('Bot', 'Contact number: %d\n', contactList.length)

  for (let i = 0; i < contactList.length; i++ ) {
    addTaskFunc(async function(){
        const contact = contactList[i]
        await contact.ready()
        contact.say(msg)
    })
  }
  setTimeout(_ => {
    bot.quit()
    process.exit(-1)
  }, (contactList.length + 10) * 1000)
}

function addTaskFunc(taskFunc: Function) {
    taskFunc['taskName'] = 'sendMessage'
    taskFunc['taskSerialNum'] = taskNum++
    taskFuncList.push(taskFunc)
}

function processTaskList(tasklist: Function[]) {
    let interval = 1 // default interval
    if (tasklist.length > 0) {
        const taskFunc = tasklist.shift()
        if (taskFunc) {
            taskFunc()
            log.info(`${taskFunc['taskSerialNum']} exec!`)
            if (tasklist.length === 0) {
                log.info(`${taskFunc['taskName']} Task Done`)
            }
        } else {
            log.info(`processTaskList: pop task empty?`)
        }
    }
    setTimeout(_ => {processTaskList(taskFuncList)}, interval * 1000)
}

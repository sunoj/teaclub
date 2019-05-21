import {DateTime} from 'luxon'
import { getLoginState } from './account'
import { getSetting, readableTime } from './utils'

const priceProUrl = "https://msitepp-fm.jd.com/rest/priceprophone/priceProPhoneMenu"
const frequencyOptionText = {
  '2h': "每2小时",
  '5h': "每5小时",
  'daily': "每天",
  'never': "从不"
}
const mapFrequency = {
  '2h': 2 * 60,
  '5h': 5 * 60,
  'daily': 24 * 60,
  'never': 99999
}

const tasks = [
  {
    id: '1',
    src: {
      m: 'https://market.m.taobao.com/app/tmall-wireless/tjb-2018/index/index.html',
    },
    title: '金币庄园',
    description: "淘金币每日签到领取",
    mode: 'iframe',
    key: "coin",
    type: ['m'],
    checkin: true,
    frequencyOption: ['daily', 'never'],
    frequency: 'daily'
  },
  {
    id: '6',
    src: {
      pc: 'https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm',
    },
    title: '订单里程',
    description: "每个淘宝订单可以领取3个飞猪里程（每月可领5次）",
    mode: 'iframe',
    key: "order-fliggy",
    type: ['pc'],
    checkin: true,
    frequencyOption: ['daily', 'never'],
    frequency: 'daily'
  },
  {
    id: '5', // 失效
    src: {
      m: 'https://market.m.taobao.com/apps/market/tjb/core-member2.html',
    },
    title: '天天抽奖',
    description: "淘金币天天抽奖",
    mode: 'iframe',
    key: "coin-lottery",
    type: ['m'],
    checkin: true,
    frequencyOption: ['daily', 'never'],
    frequency: 'daily',
    deprecated: true
  },
  {
    id: '2',
    src: {
      pc: 'https://www.fliggy.com/mytrip/',
    },
    baseUrl: "https://www.fliggy.com/mytrip/",
    title: '飞猪里程1',
    description: "每日签到领取飞猪里程",
    mode: 'iframe',
    key: "fliggy-mytrip",
    type: ['pc'],
    checkin: true,
    frequencyOption: ['daily', 'never'],
    frequency: 'daily'
  },
  {
    id: '3',
    src: {
      pc: 'https://www.fliggy.com/mytrip/?tvm=tvip',
    },
    title: '飞猪里程2',
    description: "每日签到领取飞猪里程",
    mode: 'iframe',
    key: "fliggy-tvip",
    type: ['pc'],
    checkin: true,
    frequencyOption: ['daily', 'never'],
    frequency: 'daily'
  },
  {
    id: '4',
    src: {
      m: 'https://h5.m.taobao.com/trip/rx-member/index/index.html?_projVer=0.1.25',
    },
    title: '飞猪里程3',
    description: "飞猪移动页每日签到里程",
    mode: 'iframe',
    key: "rx-member",
    type: ['m'],
    checkin: true,
    frequencyOption: ['daily', 'never'],
    frequency: 'daily'
  }
]

// 根据登录状态选择任务模式
let findTaskPlatform = function (task) {
  let loginState = getLoginState()
  let platform = null
  if (loginState.class == 'alive') {
    platform = task.type[0];
  }
  return platform
}

let getTask = function (taskId, currentPlatform) {
  let taskParameters = getSetting('teaclub:task-parameters', [])
  let parameters = (taskParameters && taskParameters.length > 0) ? taskParameters.find(t => t.id == taskId.toString()) : {}
  let task = Object.assign({}, tasks.find(t => t.id == taskId.toString()), parameters)
  let taskStatus = {}
  taskStatus.platform = findTaskPlatform(task);
  taskStatus.frequency = getSetting(`task-${taskId}_frequency`, task.frequency)
  taskStatus.last_run_at = localStorage.getItem(`task-${task.id}_lasttime`) ? parseInt(localStorage.getItem(`task-${task.id}_lasttime`)) : null
  taskStatus.last_run_description = taskStatus.last_run_at ? "上次运行： " + readableTime(DateTime.fromMillis(Number(taskStatus.last_run_at))) : "从未执行";
  // 如果是签到任务，则读取签到状态
  if (task.checkin) {
    let checkinRecord = getSetting(`checkin_${task.key}`, null)
    if (checkinRecord && checkinRecord.date == DateTime.local().toFormat("o")) {
      taskStatus.checked = true
      taskStatus.checkin_description = "完成于：" + readableTime(DateTime.fromISO(checkinRecord.time)) + (checkinRecord.value ? "，领到：" + checkinRecord.value : "");
    }
  }
  // 订单里程任务每月5次
  if (task.id == "6") {
    let month = new Date().getMonth()
    let monthStatus = localStorage.getItem(`order-fliggy-${month}`)
    if (monthStatus && monthStatus == 'Y') {
      taskStatus.checked = true
      taskStatus.checkin_description = "本月已领取五次"
    }
  }
  // 如果限定平台
  if (currentPlatform) {
    if (task.type && task.type.indexOf(currentPlatform) < 0) {
      taskStatus.unavailable = true
    }
  }
  // 选择运行平台
  if (!task.url) {
    taskStatus.url = taskStatus.platform ? task.src[taskStatus.platform] : task.src[task.type[0]];
  }
  // 如果任务无可运行平台
  if (!taskStatus.platform) {
    taskStatus.suspended = true;
    taskStatus.platform = task.type[0];
  }
  return Object.assign(task, taskStatus)
}

let getTasks = function (currentPlatform) {
  let taskList = tasks.map((task) => {
    return getTask(task.id, currentPlatform)
  })
  return taskList.filter(task => !(task.unavailable || task.deprecated));
}

module.exports = {
  priceProUrl,
  frequencyOptionText,
  mapFrequency,
  tasks,
  getTask,
  getTasks,
  findTaskPlatform
};

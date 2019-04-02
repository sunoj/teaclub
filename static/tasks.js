import {getLoginState} from './account'

module.exports = {
  frequencyOptionText: {
    '2h': "每2小时",
    '5h': "每5小时",
    'daily': "每天",
    'never': "从不"
  },
  mapFrequency: {
    '2h': 2 * 60,
    '5h': 5 * 60,
    'daily': 24 * 60,
    'never': 99999
  },
  tasks: [
    {
      id: '1',
      src: {
        m: 'https://market.m.taobao.com/app/tmall-wireless/tjb-2018/index/index.html',
      },
      title: '金币庄园',
      description: "淘金币每日签到领取",
      mode: 'iframe',
      key: "coin",
      platform: "m",
      type: ['m'],
      checkin: true,
      frequencyOption: ['daily', 'never'],
      frequency: 'daily'
    },
    {
      id: '2',
      src: {
        pc: 'https://www.fliggy.com/mytrip/',
      },
      url: 'https://www.fliggy.com/mytrip/',
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
      url: 'https://www.fliggy.com/mytrip/?tvm=tvip',
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
    },
  ],
  // 根据登录状态选择任务模式
  findJobPlatform: function (job) {
    let loginState = getLoginState()
    let platform = null
    for (var i = 0; i < job.type.length; i++) {
      if (loginState.class == 'alive') {
        platform = job.type[i];
        break;
      }
    }
    return platform
  }
};
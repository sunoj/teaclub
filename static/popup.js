import * as _ from "lodash"
$ = window.$ = window.jQuery = require('jquery')
import {DateTime} from 'luxon'
import tippy from 'tippy.js'
import weui from 'weui.js'
import Vue from '../node_modules/vue/dist/vue.esm.js'

import {tasks, frequencyOptionText, findJobPlatform} from './tasks'
import {getSetting, versionCompare, readableTime} from './utils'
import {getLoginState} from './account'

function tippyElement(el) {
  setTimeout(() => {
    let title = el.getAttribute('title')
    if (title) {
      tippy(el, {
        content: title
      })
    }
  }, 10);
}

Vue.directive('tippy', {
  componentUpdated: tippyElement,
  inserted: tippyElement
})

Vue.directive('autoSave', {
  bind(el, binding) {
    function revertValue(el) {
      let current = getSetting(el.name, null);
      if (el.type == 'checkbox') {
        if (current == "checked") {
          el.checked = true
        } else {
          el.checked = false
        }
      } else if (el.type == 'select-one'){
        el.value = current || el.options[0].value
      } else {
        el.value = current
      }
    }
    function saveToLocalStorage(el, binding) {
      if (el.type == 'checkbox') {
        if (el.checked) {
          localStorage.setItem(el.name, "checked")
        } else {
          localStorage.removeItem(el.name)
        }
        if (binding.value.bindData) {
          popupVM[binding.value.bindData] = el.checked
        }
      } else {
        localStorage.setItem(el.name, el.value)
      }
      weui.toast("设置已保存", 500)
    }
    revertValue(el)
    el.addEventListener('change', function(event) {
      if (binding.value && binding.value.notice && el.checked) {
        weui.confirm(binding.value.notice, function(){
          saveToLocalStorage(el, binding)
        }, function(){
          event.preventDefault();
          setTimeout(() => {
            revertValue(el)
          }, 50);
        }, {
          title: '选项确认'
        });
      } else {
        saveToLocalStorage(el, binding)
      }
    });
  }
})

$.each(['show', 'hide'], function (i, ev) {
  var el = $.fn[ev];
  $.fn[ev] = function () {
    this.trigger(ev);
    return el.apply(this, arguments);
  };
});

let recommendServices = [
  {
    link: "https://cloud.tencent.com/redirect.php?redirect=1025&cps_key=8c3eff7793dd70781315d9b5c9727c39&from=console",
    title: "腾讯云新客礼包",
    description: "新客户无门槛领取2775元代金券",
    class: "el-tag el-tag--success"
  },
  {
    link: "https://www.boslife.me/aff.php?aff=435",
    title: "科学上网服务",
    description: "小明使用2年的科学上网服务",
    class: "el-tag el-tag--warning"
  },
  {
    link: "https://promotion.aliyun.com/ntms/yunparter/invite.html?userCode=sqj7d3bm",
    title: "阿里云优惠券",
    description: "领取阿里云全品类优惠券",
    class: "el-tag"
  },
]

var popupVM = new Vue({
  el: '#popup',
  data: {
    tasks: [],
    messages: [],
    followedTagIds: getSetting('followedTagIds', []),
    skuPriceList: {},
    recommendedLinks: [],
    newDiscounts: false,
    frequencyOptionText: frequencyOptionText,
    recommendServices: getSetting('recommendServices', recommendServices),
    currentVersion: '{{version}}',
    newChangelog: (versionCompare(getSetting('changelog_version', '2.0'), '{{version}}') < 0),
    hiddenPromotionIds: getSetting('hiddenPromotionIds', []),
    selectedTab: null,
    discountList: null,
    selectTag: null,
    newVersion: getSetting('newVersion', null),
    numbers: [ 1, 2, 3, 4, 5 ],
    loginStateDescription: "未能获取登录状态",
    loginState: {
      default: true,
      m: {
        state: "unknown"
      },
      pc: {
        state: "unknown"
      }
    },
    discountTab: 'featured'
  },
  mounted: async function () {
    // 查询最新优惠
    let response = await fetch("https://teaclub.zaoshu.so/discount/last?app=teaclub")
    let lastDiscount = await response.json();
    let readDiscountAt = localStorage.getItem('readDiscountAt')
    if (!readDiscountAt || new Date(lastDiscount.createdAt) > new Date(readDiscountAt)) {
      this.newDiscounts = true
    }
  },
  computed: {
    followed: function () {
      return this.selectTag && this.followedTagIds.length > 0 && this.followedTagIds.indexOf(this.selectTag.id) > -1
    }
  },
  methods: {
    retryTask: function (task, hideNotice = false) {
      chrome.runtime.sendMessage({
        action: "runTask",
        hideNotice: hideNotice,
        taskId: task.id
      }, function(response) {
        if (!hideNotice) {
          weui.toast('手动运行成功', 3000);
        }
      });
    },
    backup_picture: function (e) {
      e.currentTarget.src = "https://jjbcdn.zaoshu.so/web/img_error.png"
    },
    selectType: function (type) {
      this.selectedTab = type
    },
    dismiss: function (order) {
      this.hiddenPromotionIds.push(order.id)
      localStorage.setItem('hiddenPromotionIds', JSON.stringify(this.hiddenPromotionIds))
      this.$forceUpdate()
    },
    getDiscounts: async function (condition) {
      this.newDiscounts = false
      this.discountList = null
      let queryParams = new URLSearchParams(condition)
      let response = await fetch(`https://teaclub.zaoshu.so/discount?${queryParams.toString()}`)
      let discounts = await response.json();
      this.discountList = discounts.map(function (discount) {
        discount.displayTime = readableTime(DateTime.fromISO(discount.createdAt))
        return discount
      })
      localStorage.setItem('readDiscountAt', new Date())
      this.$forceUpdate()
    },
    filterByTag: async function (tag) {
      this.discountTab = null
      this.discountList = null
      let response = await fetch(`https://teaclub.zaoshu.so/discount/tag/${tag.id}`)
      let data = await response.json();
      this.selectTag = data.tag
      this.discountList = data.discounts.map(function (discount) {
        discount.displayTime = readableTime(DateTime.fromISO(discount.createdAt))
        return discount
      })
      localStorage.setItem('readDiscountAt', new Date())
      this.$forceUpdate()
    },
    unfollowTag: async function (tag) {
      this.followedTagIds = this.followedTagIds.filter(tagId => tagId != tag.id)
      localStorage.setItem('followedTagIds', JSON.stringify(this.followedTagIds))
    },
    followTag: async function (tag) {
      let followedTagIds = this.followedTagIds
      followedTagIds.push(tag.id)
      console.log('followedTagIds', followedTagIds, this.followedTagIds)
      localStorage.setItem('followedTagIds', JSON.stringify(this.followedTagIds))
    },
    switchTab: async function (type) {
      this.discountTab = type
      this.selectTag = null
      switch (type) {
        case "featured":
          this.getDiscounts({
            all: false
          })
          break;
        case "concerned":
          if (this.followedTagIds.length > 0) {
            this.getDiscounts({
              tagIds: this.followedTagIds.join(',')
            })
          } else {
            this.discountList = []
          }
          break;
        case "hot":
          this.getDiscounts({
            hot: true
          })
          break;
        default:
          break;
      }
    },
    showChangelog: function () {
      this.newChangelog = false
      localStorage.setItem('changelog_version', $(this).data('version'))
      weui.dialog({
        title: '更新记录',
        content: `<iframe id="changelogIframe" frameborder="0" src="https://teaclub.zaoshu.so/changelog?buildId={{buildid}}&browser={{browser}}&app=teaclub" style="width: 100%;min-height: 350px;"></iframe>`,
        className: 'changelog',
        buttons: [{
          label: '完成',
          type: 'primary'
        }]
      })
    }
  }
})


// 接收消息
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  switch (message.action) {
    case 'new_message':
      let lastUnreadCount = $("#unreadCount").text()
      $("#unreadCount").text(Number(lastUnreadCount) + 1).fadeIn()
      popupVM.messages = makeupMessages(JSON.parse(message.data))
      break;
    case 'loginState_updated':
      dealWithLoginState()
      break;
    default:
      break;
  }
});

function showJEvent(rateLimit) {
  if (rateLimit) {
    let today = DateTime.local().toFormat("o")
    let showRecommendState = getSetting('showRecommendState', {
      date: today,
      times: 0
    })
    if (showRecommendState.date == today) {
      if (showRecommendState.times > rateLimit.limit) {
        return console.log('展示次数超限')
      } else {
        showRecommendState.times = showRecommendState.times + 1
      }
    } else {
      showRecommendState.date = today
      showRecommendState.times = 1
    }
    localStorage.setItem('showRecommendState', JSON.stringify(showRecommendState))
  }
  // 加载反馈
  if (!$("#specialEventIframe").attr('src') || $("#specialEventIframe").attr('src') == '') {
    $("#specialEventIframe").attr('src', "https://teaclub.zaoshu.so/recommend")
    setTimeout(function () {
      $('.iframe-loading').hide()
    }, 800)
  }
  $("#specialEventDialags").show()
}

// 任务列表
function getTaskList() {
  return _.map(_.reject(tasks, ['hide', true]), (task) => {
    task.last_run_at = getSetting(`task-${task.id}_lasttime`, null)
    task.frequencySetting = getSetting(`task-${task.id}_frequency`, task.frequency)
    task.last_run_description = task.last_run_at ?'上次运行： ' + readableTime(DateTime.fromMillis(Number(task.last_run_at))) : '从未执行'
    // 如果是签到任务，则读取签到状态
    if (task.checkin) {
      let checkinRecord = getSetting('checkin_' + task.key, null)
      if (checkinRecord && checkinRecord.date == DateTime.local().toFormat("o")) {
        task.checked = true
        task.checkin_description = '完成于：' + readableTime(DateTime.fromISO(checkinRecord.time)) + ( checkinRecord.value ? '，领到：' + checkinRecord.value : '')
      }
    }
    // 选择运行平台
    task.platform = findJobPlatform(task)
    if (!task.url) {
      task.url = task.platform ? task.src[task.platform] : task.src[task.type[0]]
    }
    if (!task.platform) {
      task.suspended = true
      task.platform = task.type[0]
    }
    return task
  })
}

// 消息已读
function readMessage() {
  $("#unreadCount").fadeOut()
  chrome.runtime.sendMessage({
    text: "clearUnread"
  }, function (response) {
    console.log("Response: ", response);
  });
}

// 处理登录状态
function dealWithLoginState() {
  let stateText = {
    "failed": "失败",
    "alive": "有效",
    "unknown": "未知"
  }
  let loginState = getLoginState()
  popupVM.loginState = loginState
  popupVM.tasks = getTaskList()

  function getStateDescription(loginState, type) {
    return stateText[loginState[type].state] + (loginState[type].message ? `（ ${loginState[type].message} 上次检查： ${readableTime(DateTime.fromISO(loginState[type].time))} ）` : '')
  }

  popupVM.loginStateDescription = ("PC网页版登录" + getStateDescription(loginState, 'pc') + "，移动网页版登录" + getStateDescription(loginState, 'm'))

  $("#loginState").removeClass("alive").removeClass("failed").removeClass("warning")
  $("#loginState").addClass(loginState.class)
}

function makeupMessages(messages) {
  if (messages) {
    return messages.reverse().map(function (message) {
      if (message.type == 'coupon') {
        message.coupon = JSON.parse(message.content)
      }
      message.time = readableTime(DateTime.fromISO(message.time))
      return message
    })
  } else {
    return []
  }
}

function getMessages() {
  let messages = JSON.parse(localStorage.getItem('messages'))
  messages = makeupMessages(messages)
  popupVM.messages = messages
}

$( document ).ready(function() {
  var unreadCount = localStorage.getItem('unreadCount') || 0
  const displayRecommend = localStorage.getItem('displayRecommend')
  const displayRecommendRateLimit = getSetting('displayRecommendRateLimit', {
    rate: 7,
    limit: 1
  })
  let windowWidth = Number(document.body.offsetWidth)
  let time = Date.now().toString()
  // 渲染通知
  getMessages()

  // 标记已读
  readMessage()

  // 渲染设置
  popupVM.tasks = getTaskList()
  popupVM.recommendedLinks = getSetting("recommendedLinks", [])

  // tippy
  tippy('.tippy')

  // 处理登录状态
  dealWithLoginState()


  $('body').width(windowWidth-1)
  // 窗口 resize
  setTimeout(() => {
    $('body').width(windowWidth)
  }, 100);

  if (unreadCount > 0) {
    $("#unreadCount").text(unreadCount).fadeIn()
  }

  // 查询推荐设置
  $.getJSON("https://teaclub.zaoshu.so/recommend/settings", function (json) {
    if (json.display) {
      localStorage.setItem('displayRecommend', json.display)
    }
    if (json.ratelimit) {
      localStorage.setItem('displayRecommendRateLimit', JSON.stringify(json.ratelimit))
    }
    if (json.announcements && json.announcements.length > 0) {
      localStorage.setItem('announcements', JSON.stringify(json.announcements))
    }
    if (json.recommendedLinks && json.recommendedLinks.length > 0) {
      localStorage.setItem('recommendedLinks', JSON.stringify(json.recommendedLinks))
    } else {
      localStorage.removeItem('recommendedLinks')
    }
    if (json.recommendServices && json.recommendServices.length > 0) {
      localStorage.setItem('recommendServices', JSON.stringify(json.recommendServices))
    }
  });

  // 查询最新版本
  $.getJSON("https://teaclub.zaoshu.so/updates?buildid={{buildid}}&browser={{browser}}&app=teaclub", function (lastVersion) {
    if (!lastVersion) return localStorage.removeItem('newVersion')
    let skipBuildId = localStorage.getItem('skipBuildId')
    let localBuildId = skipBuildId || "{{buildid}}"
    // 如果有新版
    if (localBuildId < lastVersion.buildId) {
      localStorage.setItem('newVersion', lastVersion.versionCode)
      // 如果新版是主要版本，而且当前版本需要被提示
      if (lastVersion.major && localBuildId < lastVersion.noticeBuildId) {
        let noticeDialog = weui.dialog({
          title: `${lastVersion.title} <span class="dismiss">&times;</span>` || '有版本更新',
          content: `${lastVersion.changelog}
            <div class="changelog">
              <span class="time">${lastVersion.time}</span>` +
             (lastVersion.blogUrl ? `<a class="blog" href="${lastVersion.blogUrl}" target="_blank">了解更多</a>` : '') +
            `</div>`,
          className: 'update',
          buttons: [{
            label: '不再提醒',
            type: 'default',
            onClick: function () {
              localStorage.setItem('skipBuildId', lastVersion.buildId)
            }
          }, {
            label: '下载更新',
            type: 'primary',
            onClick: function () {
              chrome.tabs.create({
                url: lastVersion.downloadUrl || "https://teaclub.zaoshu.so/updates/latest?browser={{browser}}&app=teaclub"
              })
            }
          }]
        });
        $(".update .dismiss").on("click", function () {
          noticeDialog.hide()
        })
      }
    } else {
      localStorage.removeItem('newVersion')
    }
  });

  // 是否已存在弹窗
  function isNoDialog(){
    return ($(".js_dialog:visible").length < 1) && ($(".weui-dialog:visible").length < 1)
  }

  // 常规弹窗延迟200ms
  setTimeout(() => {
    // 只有在没有弹框 且 打开了推荐 取 1/5 的几率弹出推荐
    if (isNoDialog() && displayRecommend == 'true' && time[time.length - 1] > displayRecommendRateLimit.rate) {
      showJEvent(displayRecommendRateLimit)
    }
  }, 200);


  $('.settings .weui-navbar__item').on('click', function () {
    $(this).addClass('weui-bar__item_on').siblings('.weui-bar__item_on').removeClass('weui-bar__item_on');
    var type = $(this).data('type')
    $('.settings_box').hide()
    $('.settings_box.' + type).show()
  });

  $('.contents .weui-navbar__item').on('click', function () {
    $(this).addClass('weui-bar__item_on').siblings('.weui-bar__item_on').removeClass('weui-bar__item_on');
    var type = $(this).data('type')
    if (type == 'messages') {
      readMessage()
    }
    $('.contents-box').hide()
    $('.contents-box.' + type).show()
  });

  $(document).on("click", ".openMobilePage", function () {
    chrome.runtime.sendMessage({
      action: "openUrlAsMoblie",
      url: $(this).data('url')
    }, function (response) {
      console.log("Response: ", response);
    });
  })

  $(".showAlipayRedpack").on("click", function () {
    weui.dialog({
      title: '扫码领红包',
      content: `<img src="https://jjbcdn.zaoshu.so/chrome/alipayred.png" style="width: 270px;"></img>`,
      className: 'redpack',
      buttons: [{
        label: '完成',
        type: 'primary'
      }]
    })
  })

  $(".weui-dialog__ft a").on("click", function () {
    $("#dialogs").hide()
    $("#listenAudio").hide()
    $("#changeLogs").hide()
  })

  $("#dialogs .js-close").on("click", function () {
    $("#dialogs").hide()
  })
})

// 防止缩放
chrome.tabs.getZoomSettings(function (zoomSettings) {
  if (zoomSettings.defaultZoomFactor > 1 && zoomSettings.scope == 'per-origin' && zoomSettings.mode == 'automatic') {
    let zoomPercent = (100 / (zoomSettings.defaultZoomFactor * 100)) * 100;
    document.body.style.zoom = zoomPercent + '%'
  }
})

import * as _ from "lodash"
$ = window.$ = window.jQuery = require('jquery')
import {DateTime} from 'luxon'
import tippy from 'tippy.js'
import weui from 'weui.js'
import Vue from 'vue'

import {getSetting} from './utils'

$.each(['show', 'hide'], function (i, ev) {
  var el = $.fn[ev];
  $.fn[ev] = function () {
    this.trigger(ev);
    return el.apply(this, arguments);
  };
});

import App from '../components/app.vue';
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
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



// 消息已读
function readMessage() {
  chrome.runtime.sendMessage({
    text: "clearUnread"
  }, function (response) {
    console.log("Response: ", response);
  });
}


$( document ).ready(function() {
  const displayRecommend = localStorage.getItem('displayRecommend')
  const displayRecommendRateLimit = getSetting('displayRecommendRateLimit', {
    rate: 7,
    limit: 1
  })
  let windowWidth = Number(document.body.offsetWidth)
  let time = Date.now().toString()
  // 标记已读
  readMessage()

  // tippy
  tippy('.tippy')

  $('body').width(windowWidth-1)
  // 窗口 resize
  setTimeout(() => {
    $('body').width(windowWidth)
  }, 100);

  // 查询推荐设置
  $.getJSON("https://teaclub.zaoshu.so/recommend/settings?buildid={{buildid}}&browser={{browser}}&app=teaclub", function (json) {
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

import * as _ from "lodash"
$ = window.$ = window.jQuery = require('jquery')
import 'weui'
import weui from 'weui.js'
import Vue from 'vue'
import microtip from 'microtip/microtip.css'

import '../static/style/popup.css'

$.each(['show', 'hide'], function (i, ev) {
  var el = $.fn[ev];
  $.fn[ev] = function () {
    this.trigger(ev);
    return el.apply(this, arguments);
  };
});

import App from './components/app.vue';
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})

// 消息已读
function readMessage() {
  chrome.runtime.sendMessage({
    text: "clearUnread"
  }, function (response) {
    console.log("Response: ", response);
  });
}


$( document ).ready(function() {
  // 标记已读
  readMessage()

  // 查询最新版本
  $.getJSON(`https://teaclub.zaoshu.so/updates?buildid=${process.env.BUILDID}&browser=${process.env.BROWSER}&app=teaclub`, function (lastVersion) {
    if (!lastVersion) return localStorage.removeItem('newVersion')
    let skipBuildId = localStorage.getItem('skipBuildId')
    let localBuildId = skipBuildId || process.env.BUILDID
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
                url: lastVersion.downloadUrl || `https://teaclub.zaoshu.so/updates/latest?browser=${process.env.BROWSER}&app=teaclub`
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


  $('.settings .weui-navbar__item').on('click', function () {
    $(this).addClass('weui-bar__item_on').siblings('.weui-bar__item_on').removeClass('weui-bar__item_on');
    var type = $(this).data('type')
    $('.settings_box').hide()
    $('.settings_box.' + type).show()
  });

  $(document).on("click", ".openMobilePage", function () {
    chrome.runtime.sendMessage({
      action: "openUrlAsMobile",
      url: $(this).data('url')
    }, function (response) {
      console.log("Response: ", response);
    });
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

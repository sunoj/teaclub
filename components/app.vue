<template>
  <div>
    <div class="settings">
      <div class="weui-tab">
        <div :class="`${scienceOnline} weui-navbar`">
          <div class="weui-navbar__item weui-bar__item_on" data-type="frequency_settings">任务设置</div>
          <div class="weui-navbar__item" data-type="other_settings">高级设置</div>
        </div>
        <div class="weui-tab__panel">
          <form
            id="settings"
            data-persist="garlic"
            data-domain="true"
            data-destroy="false"
            method="POST"
          >
            <div class="frequency_settings settings_box">
              <div class="weui-cells weui-cells_form">
                <div
                  class="weui-cell weui-cell_select weui-cell_select-after"
                  v-for="task in taskList"
                  :key="task.id"
                >
                  <div class="weui-cell__bd job-m">
                    <span :title="task.description" v-tippy>
                      <a
                        v-if="task.platform == 'm'"
                        class="openMobilePage"
                        :data-url="task.baseUrl || task.url"
                      >{{task.title}}</a>
                      <a v-else :href="task.url" target="_blank">{{task.title}}</a>
                    </span>
                    <span
                      v-show="task.suspended && !task.checked"
                      v-tippy
                      title="未知登录状态，请点击任务名称手动运行"
                    >
                      <i class="job-state weui-icon-waiting-circle"></i>
                    </span>
                    <i
                      v-show="task.checked"
                      v-tippy
                      :title="task.checkin_description"
                      class="today weui-icon-success-circle"
                    ></i>
                    <i
                      v-show="!task.checked && !task.suspended"
                      @click="retryTask(task)"
                      class="reload-icon"
                      v-tippy
                      :title="task.last_run_description"
                    ></i>
                  </div>
                  <div class="weui-cell__bd">
                    <select class="weui-select" v-auto-save :name="`task-${task.id}_frequency`">
                      <option
                        v-for="option in task.frequencyOption"
                        :value="option"
                        :key="option"
                      >{{ frequencyOptionText[option] }}</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="other_actions">
                <div class="recommendation">
                  <h3 style="text-align: center;color: #666;">服务推荐</h3>
                  <p class="recommendServices">
                    <span
                      :class="service.class"
                      v-for="service in recommendServices"
                      :key="service.title"
                    >
                      <a
                        target="_blank"
                        v-tippy
                        :title="service.description"
                        :href="service.link"
                      >{{service.title}}</a>
                    </span>
                  </p>
                  <div class="recommendedLink">
                    <p v-for="link in recommendedLinks" :key="link.title">
                      <a
                        v-if="link.mobile"
                        class="openMobilePage"
                        :style="link.style"
                        :data-url="link.url"
                      >{{link.title}}</a>
                      <a
                        v-else
                        :href="link.url"
                        :style="link.style"
                        class="weui-form-preview__btn weui-form-preview__btn_primary"
                        target="_blank"
                      >{{link.title}}</a>
                    </p>
                  </div>
                </div>
              </div>
              <div class="tips bottom-tips"></div>
            </div>
            <div class="other_settings settings_box" style="display: none">
              <div class="weui-cells weui-cells_form">
                <div class="weui-cell weui-cell_switch">
                  <div class="weui-cell__bd">停用自动找券</div>
                  <div class="weui-cell__ft">
                    <input
                      class="weui-switch"
                      v-auto-save
                      type="checkbox"
                      name="disable_find_coupon"
                    >
                  </div>
                </div>
                <div class="weui-cell weui-cell_switch">
                  <div class="weui-cell__bd">停止“找同款”</div>
                  <div class="weui-cell__ft">
                    <input
                      class="weui-switch"
                      v-auto-save
                      type="checkbox"
                      name="disable_same_goods"
                    >
                  </div>
                </div>
                <div class="weui-cell weui-cell_switch">
                  <div class="weui-cell__bd">不再提示签到通知</div>
                  <div class="weui-cell__ft">
                    <input class="weui-switch" v-auto-save type="checkbox" name="mute_checkin">
                  </div>
                </div>
                <div class="weui-cell weui-cell_switch">
                  <div class="weui-cell__bd">
                    <span
                      data-tippy-placement="top-start"
                      class="tippy"
                      data-tippy-content="开启后不再晚上12点至凌晨6点发送浏览器通知"
                    >开启夜晚防打扰</span>
                  </div>
                  <div class="weui-cell__ft">
                    <input class="weui-switch" type="checkbox" v-auto-save name="mute_night">
                  </div>
                </div>
              </div>
              <div class="other_actions">
                <p
                  class="tips"
                  style="text-align: center;"
                >茶友会当前版本为预览版，相关功能并不完善，若有功能建议或反馈，请写邮件至：ming@tiny.group</p>
              </div>
              <p
                class="text-tips version showChangelog tippy"
                @click="showChangelog"
                data-tippy-content="点击查看版本更新记录"
              >
                当前版本：{{currentVersion}}
                <span class="weui-badge weui-badge_dot" v-if="newChangelog"></span>
                <span class="weui-badge new-version" v-if="newVersion">有新版</span>
              </p>
            </div>
          </form>
        </div>
      </div>
      <div class="bottom-box">
        <div class="avatar">
          <a
            id="loginState"
            :class="`login-state ${loginState.class}`"
            :target="loginState.class != 'alive' ? '_blank' : '_self'"
            :href="loginState.class != 'alive' ? 'https://i.taobao.com/my_taobao.htm' : ''"
            :title="loginStateDescription"
            v-tippy
          ></a>
        </div>
        <links></links>
      </div>
    </div>
    <div class="contents">
      <div class="weui-tab">
        <div class="weui-navbar">
          <div :class="`weui-navbar__item ${contentType == 'messages' ? 'weui-bar__item_on' : ''}`" @click="switchContentType('messages')">
            最近通知
            <span class="weui-badge" v-if="unreadCount > 0">{{unreadCount}}</span>
          </div>
          <div :class="`weui-navbar__item zaoshu-tab ${contentType == 'discounts' ? 'weui-bar__item_on' : ''}`" @click="switchContentType('discounts')">
            <img src="../static/image/zaoshu.png" alt="" class="zaoshu-icon">
            枣树集惠
            <span
              class="weui-badge weui-badge_dot new-discounts"
              v-if="newDiscounts"
            ></span>
          </div>
        </div>
        <div class="weui-tab__panel">
          <div id="messages" v-if="contentType == 'messages'" class="weui-cells contents-box messages">
            <div class="message-items" v-if="messages && messages.length > 0">
              <li v-for="(message, index) in messages" :key="index">
                <div
                  :class="`weui-panel__bd message-item type-${message.type}`"
                  v-show="!selectedTab || selectedTab == message.type"
                >
                  <div class="weui-media-box weui-media-box_text">
                    <h4 class="weui-media-box__title message">
                      <i :class="`${message.type} ${message.reward}`"></i>
                      {{message.title}}
                    </h4>
                    <p class="weui-media-box__desc">{{message.content}}</p>
                    <ul class="weui-media-box__info">
                      <li class="weui-media-box__info__meta">时间: {{message.time}}</li>
                    </ul>
                  </div>
                </div>
              </li>
            </div>
            <div class="no_message" v-else>暂时还没有未读消息</div>
          </div>
          <discounts v-if="contentType == 'discounts'"/>
        </div>
      </div>
      <div class="bottom">
        <div class="weui-tabbar">
          <a
            class="showChangelog weui-tabbar__item"
            @click="showChangelog"
            v-tippy
            title="查看茶友会最近更新记录"
            style="position: relative;"
          >
            <img src="../static/image/update.png" alt="" class="weui-tabbar__icon">
            <p class="weui-tabbar__label">
              最近更新
              <span
                class="weui-badge weui-badge_dot"
                style="position: absolute;top: 0;right: 4em;"
                v-if="newChangelog"
              ></span>
              <span
                class="weui-badge"
                style="position: absolute;top: -.4em;right: 2em;"
                v-if="newVersion"
              >有新版</span>
            </p>
          </a>
          <a
            id="openGithub"
            class="weui-tabbar__item"
            href="https://github.com/sunoj/teaclub"
            v-tippy
            title="点击查看本插件的全部代码"
            target="_blank"
          >
            <img src="../static/image/github.png" alt="" class="weui-tabbar__icon">
            <p class="weui-tabbar__label">源代码</p>
          </a>
        </div>
      </div>
    </div>
    <div class="dialogs">
      <guide v-if="showGuide" :login-state="loginState"></guide>
      <popup v-if="showPopup" @close="showPopup = false"></popup>
    </div>
  </div>
</template>

<script>
import * as _ from "lodash";
import tippy from "tippy.js";
import weui from "weui.js";
import Vue from "vue";

import { DateTime } from "luxon";
import { getLoginState } from "../static/account";
import { tasks, frequencyOptionText, getTasks } from "../static/tasks";
import { getSetting, versionCompare, readableTime } from "../static/utils";
import { stateText, recommendServices } from "../static/variables";

function tippyElement(el) {
  setTimeout(() => {
    let title = el.getAttribute("title");
    if (title) {
      if (el._tippy) {
        el._tippy.setContent(title);
      } else {
        tippy(el, {
          content: title
        });
      }
    }
  }, 50);
}

Vue.directive("tippy", {
  componentUpdated: tippyElement,
  inserted: tippyElement
});

Vue.directive("autoSave", {
  bind(el, binding, vnode) {
    function revertValue(el) {
      let current = getSetting(el.name, null);
      if (el.type == "checkbox") {
        if (current == "checked") {
          el.checked = true;
        } else {
          el.checked = false;
        }
      } else if (el.type == "select-one") {
        el.value = current || el.options[0].value;
      } else {
        el.value = current;
      }
    }
    function saveToLocalStorage(el, binding) {
      if (el.type == "checkbox") {
        if (el.checked) {
          localStorage.setItem(el.name, "checked");
        } else {
          localStorage.removeItem(el.name);
        }
      } else {
        localStorage.setItem(el.name, el.value);
      }
      weui.toast("设置已保存", 500);
    }
    revertValue(el);
    el.addEventListener("change", function(event) {
      if (binding.value && binding.value.notice && el.checked) {
        weui.confirm(
          binding.value.notice,
          function() {
            saveToLocalStorage(el, binding);
          },
          function() {
            event.preventDefault();
            setTimeout(() => {
              revertValue(el);
            }, 50);
          },
          {
            title: "选项确认"
          }
        );
      } else {
        saveToLocalStorage(el, binding);
      }
    });
  }
});

import loading from "./loading.vue";
import discounts from "./discounts.vue";
import guide from "./guide.vue";
import popup from './popup.vue';
import links from './links.vue';

export default {
  name: "App",
  components: { loading, discounts, guide, popup, links },
  data() {
    return {
      taskList: [],
      messages: [],
      skuPriceList: {},
      recommendedLinks: getSetting("recommendedLinks", []),
      stateText: stateText,
      newDiscounts: false,
      showPopup: true,
      frequencyOptionText: frequencyOptionText,
      recommendServices: getSetting("recommendServices", recommendServices),
      currentVersion: "{{version}}",
      contentType: 'messages',
      newChangelog:
        versionCompare(getSetting("changelog_version", "2.0"), "{{version}}") <
        0,
      hiddenPromotionIds: getSetting("hiddenPromotionIds", []),
      unreadCount: getSetting("unreadCount", null),
      selectedTab: null,
      scienceOnline: false,
      newVersion: getSetting("newVersion", null),
      loginStateDescription: "未能获取登录状态",
      olduser: getSetting('oldUser', false),
      showGuideAt: getSetting('showGuideAt', false),
      loginState: {
        default: true,
        m: {
          state: "unknown"
        },
        pc: {
          state: "unknown"
        }
      },
      discountTab: "featured"
    };
  },
  computed: {
    showGuide: function() {
      if (!this.olduser && !this.showGuideAt) {
        return true
      } else {
        return false
      }
    }
  },
  mounted: async function() {
    // 准备数据
    this.getTaskList();

    // 渲染通知
    setTimeout(() => {
      this.renderMessages()
    }, 50);

    // 查询最新优惠
    setTimeout(() => {
      this.getLastDiscount()
    }, 100);

    // 测试是否科学上网
    setTimeout(() => {
      this.tryGoogle()
    }, 200);

    this.dealWithLoginState()

    // 接收消息
    chrome.runtime.onMessage.addListener((
      message,
      sender,
      sendResponse
    ) => {
      switch (message.action) {
        case "messages_updated":
          this.renderMessages(message.messages);
          break;
        case "loginState_updated":
          this.dealWithLoginState();
          setTimeout(() => {
            this.getTaskList();
          }, 1000);
          break;
        default:
          break;
      }
    });
  },
  methods: {
    tryGoogle: async function() {
      let response = await fetch("https://www.googleapis.com/discovery/v1/apis?name=abusiveexperiencereport");
      if ( response.status == "200" ) {
        this.scienceOnline = true;
      } else {
        this.scienceOnline = false;
      }
    },
    switchContentType: function(type) {
      this.contentType = type
      switch (type) {
        case "messages":
          this.renderMessages()
          this.readMessages()
          break;
        case "discounts":
          this.readDiscounts()
          break;
        default:
          break;
      }

    },
    getLastDiscount: async function() {
      let response = await fetch("https://teaclub.zaoshu.so/discount/last");
      let lastDiscount = await response.json();
      let readDiscountAt = localStorage.getItem("readDiscountAt");
      if (
        !readDiscountAt ||
        new Date(lastDiscount.createdAt) > new Date(readDiscountAt)
      ) {
        this.newDiscounts = true;
      }
    },
    retryTask: function(task, hideNotice = false) {
      chrome.runtime.sendMessage(
        {
          action: "runTask",
          hideNotice: hideNotice,
          taskId: task.id
        },
        function(response) {
          if (!hideNotice) {
            if (response.result == "success") {
              weui.toast("手动运行成功", 3000);
            } else if (response.message) {
              weui.alert(response.message, { title: '任务暂未运行' })
            }
          }
        }
      );
    },
    // 任务列表
    getTaskList: function() {
      this.taskList = getTasks()
    },
    // 处理登录状态
    dealWithLoginState: function() {
      let loginState = getLoginState();
      this.loginState = loginState;

      if (loginState.class == "failed") {
        weui.dialog({
          title: '淘宝账号登录失效',
          content: `<p>账号登录失效后，签到任务将无法运行</p>`,
          className: 'login-failed',
          buttons: [
            {
              label: '去登录',
              type: 'primary',
              onClick: function(){
                chrome.runtime.sendMessage({
                  action: "openLogin",
                }, function(response) {
                  console.log("Response: ", response);
                });
              }
            },
            {
              label: '知道了',
              type: 'default'
            }
          ]
        })
      }

      function getStateDescription(loginState, type) {
        return (
          stateText[loginState[type].state] +
          (loginState[type].message
            ? `（ ${loginState[type].message} 上次检查： ${readableTime(
                DateTime.fromISO(loginState[type].time)
              )} ）`
            : "")
        );
      }

      this.loginStateDescription =
        "PC网页版登录" +
        getStateDescription(loginState, "pc") +
        "，移动网页版登录" +
        getStateDescription(loginState, "m");
    },
    renderMessages: function(messages) {
      if (!messages) {
        messages = getSetting('message', [])
        chrome.runtime.sendMessage({ action: "getMessages" })
      }
      this.messages = messages.map(function(message) {
        if (message.type == "coupon") {
          message.coupon = message.content;
        }
        message.time = readableTime(message.timestamp ? DateTime.fromMillis(message.timestamp) : DateTime.fromISO(message.time));
        return message;
      });
    },
    showLoginState: function() {
      $("#loginNotice").show();
    },
    selectType: function(type) {
      this.selectedTab = type;
    },
    readMessages: function () {
      this.unreadCount = 0
      chrome.runtime.sendMessage({
        text: "clearUnread"
      }, function (response) {
        console.log("Response: ", response);
      });
    },
    readDiscounts: function() {
      this.newDiscounts = false;
    },
    showChangelog: function() {
      this.newChangelog = false;
      localStorage.setItem("changelog_version", this.currentVersion);
      weui.dialog({
        title: "更新记录",
        content: `<iframe id="changelogIframe" frameborder="0" src="https://teaclub.zaoshu.so/changelog?buildId={{buildid}}&browser={{browser}}&app=teaclub" style="width: 100%;min-height: 350px;"></iframe>`,
        className: "changelog",
        buttons: [
          {
            label: "完成",
            type: "primary"
          }
        ]
      });
    }
  }
};
</script>

<style scoped>
.messages, .discounts{
  overflow: hidden;
  height: 510px;
  width: 431px;
}
.message-items {
  margin-top: 10px;
  height: 504px;
  overflow-y: auto;
}
.order-good.suspended {
  opacity: 0.5;
}
.weui-navbar.true .weui-navbar__item.weui-bar__item_on{
  background-image: linear-gradient(180deg,#09bb07,#06a90c94);
}
</style>
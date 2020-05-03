<template>
  <div class="guide">
    <div class="js_dialog" style="opacity: 1;" v-if="step > 0">
      <div class="weui-mask"></div>
      <div class="weui-dialog">
        <div class="testbox step-1" v-if="step == 1">
          <div class="weui-dialog__hd">
            <strong class="weui-dialog__title">恭喜安装成功！</strong>
          </div>
          <div class="weui-dialog__bd">
            <p>感谢你使用茶友会！以下是一些简单的介绍：</p>
            <p>茶友会是一个<a href="https://github.com/sunoj/teaclub" target="_blank">公开源代码</a>的浏览器插件。它能自动搜索淘宝商品的渠道优惠券，还内置一系列替你进行签到、领飞猪里程的小任务。</p>
            <p>由于淘宝网页经常更新，茶友会受其影响可能部分功能有时变得不可用，因此茶友会会经常更新以保持功能正常。如果你使用的不是 <a href="https://chrome.google.com/webstore/detail/igedhbjllcmgidlmhclmphmhlllkibkb" target="_blank">Chrome 拓展商店</a> 安装，强烈建议您使用上述渠道安装，只有这样你才能获得官方的自动更新。</p>
          </div>
          <div class="weui-dialog__ft">
            <a class="weui-dialog__btn weui-dialog__btn_primary answer" @click="step = 2">继续</a>
          </div>
        </div>
        <div class="testbox step-2" v-if="step == 2">
          <div class="weui-dialog__hd">
            <strong class="weui-dialog__title">登录账号</strong>
          </div>
          <div class="weui-dialog__bd">
            <p>如你所知，茶友会是一个浏览器插件。在你的授权下，茶友会代替你自动访问淘宝的网页来执行一系列操作。 </p>
            <p>很显然，
              <b>茶友会需要您登录淘宝才能完成你指定的工作</b>。由于淘宝的登录有效期较短，你通常需要每天登录一次淘宝账号才能保证签到任务自动运行。
            </p>
            <p>当登录失效时，茶友会将会提醒你。除非你重新登录，否则茶友会将无法继续完成任何工作。</p>
          </div>
          <div class="weui-dialog__ft">
            <a v-if="loginState.class == 'unknown'" :class="`weui-dialog__btn weui-dialog__btn_primary answer`" @click="done('openLogin')">现在登录</a>
            <a class="weui-dialog__btn weui-dialog__btn_primary answer" @click="done">知道了</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getSetting } from "../utils";

export default {
  name: "guide",
  props: ["loginState"],
  data() {
    return {
      step: 1
    };
  },
  methods: {
    done: async function(action) {
      this.step = 0
      localStorage.setItem('showGuideAt', new Date())
      if (action == 'openLogin') {
        chrome.runtime.sendMessage({
          action: "openLogin",
        }, function(response) {
          console.log("Response: ", response);
        });
      }
    }
  }
};
</script>

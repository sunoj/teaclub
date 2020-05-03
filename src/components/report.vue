<template>
  <div class="report-problem" :ref="`report-${discount.id}`" v-show="discount.focus">
    <div class="report-icon" @click="showList">
      <span>i</span>
    </div>
    <div :class="`weui-cells weui-cells_radio ${leftList ? 'turn-left': ''}`" v-if="show">
      <label class="weui-cell weui-check__label" :for="`report-${discount.id}_expired`">
        <div class="weui-cell__bd">
          <p>优惠失效</p>
        </div>
        <div class="weui-cell__ft">
          <input
            type="radio"
            v-model="code"
            value="expired"
            class="weui-check"
            :name="`report-${discount.id}`"
            :id="`report-${discount.id}_expired`"
          >
          <span class="weui-icon-checked"></span>
        </div>
      </label>
      <label class="weui-cell weui-check__label" :for="`report-${discount.id}_soldout`">
        <div class="weui-cell__bd">
          <p>告罄缺货</p>
        </div>
        <div class="weui-cell__ft">
          <input
            type="radio"
            v-model="code"
            value="soldout"
            :name="`report-${discount.id}`"
            class="weui-check"
            :id="`report-${discount.id}_soldout`"
          >
          <span class="weui-icon-checked"></span>
        </div>
      </label>
      <label class="weui-cell weui-check__label" :for="`report-${discount.id}_wronglink`">
        <div class="weui-cell__bd">
          <p>链接错误</p>
        </div>
        <div class="weui-cell__ft">
          <input
            type="radio"
            v-model="code"
            :name="`report-${discount.id}`"
            value="wronglink"
            class="weui-check"
            :id="`report-${discount.id}_wronglink`"
          >
          <span class="weui-icon-checked"></span>
        </div>
      </label>
      <button class="report-btn" @click="sendReport" v-show="code">发送反馈</button>
    </div>
  </div>
</template>

<script>
import weui from "weui.js";
export default {
  name: "report",
  props: ["discount"],
  data() {
    return {
      code: null,
      show: false,
      leftList: false
    };
  },
  methods: {
    showList: async function() {
      this.show = !this.show;
      if (this.$refs[`report-${this.discount.id}`].offsetLeft > 300) {
        this.leftList = true;
      }
    },
    sendReport: async function() {
      try {
        let response = await fetch(
        `https://jjb.zaoshu.so/discount/${this.discount.id}`,
        {
          body: JSON.stringify({
            code: this.code
          }),
          cache: 'no-cache',
          headers: {
            "content-type": "application/json"
          },
          method: "POST",
          mode: "cors",
          redirect: "follow"
        }
      );
      let result = await response.json();
      } catch (error) {
        console.error(error)
      }
      weui.toast("感谢反馈", 500);
    }
  }
};
</script>
<style scoped>
.report-problem {
  position: absolute;
  display: inline-block;
  margin-left: 5px;
}

.report-problem .weui-cells {
  width: 160px;
  margin-top: 5px;
  border: 1px solid #e0e0e0;
  border-top: 0;
  border-bottom: 0;
  font-size: 14px;
  font-weight: normal;
}

.report-problem .weui-cells.turn-left {
  margin-left: -120px;
}

.report-btn {
  width: 100%;
  background: #fdf295;
  height: 32px;
  border: 0;
  cursor: pointer;
}

.report-icon span {
  border: 1px solid #ccc;
  width: 16px;
  height: 16px;
  border-radius: 10px;
  display: block;
  text-align: center;
  font-size: 14px;
  color: #3a3a3a;
  margin-top: 3px;
  line-height: 17px;
  cursor: pointer;
  background: #eee;
  font-family: monospace;
}
</style>

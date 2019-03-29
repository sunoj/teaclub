<template>
  <div id="discounts" class="weui-cells contents-box discounts">
    <div class="top-bar">
      <div class="tabs">
        <ul class="tab-list">
          <li class="tabs-item">
            <a
              :class="discountTab == 'featured' ? 'tabs-link is-active' : 'tabs-link'"
              @click="switchTab('featured')"
            >精选</a>
          </li>
          <li class="tabs-item">
            <a
              :class="discountTab == 'concerned' ? 'tabs-link is-active' : 'tabs-link'"
              @click="switchTab('concerned')"
            >关注</a>
          </li>
          <li class="tabs-item">
            <a
              :class="discountTab == 'hot' ? 'tabs-link is-active' : 'tabs-link'"
              @click="switchTab('hot')"
            >热榜</a>
          </li>
        </ul>
      </div>
      <div class="select-tag" v-if="selectTag">
        <div class="tag-box">
          <span class="tag-name">{{selectTag.name}}</span>
        </div>
        <a
          v-if="followed"
          class="weui-btn weui-btn_mini weui-btn_plain-disabled"
          @click="unfollowTag(selectTag)"
        >取消</a>
        <a
          v-else
          class="weui-btn weui-btn_mini weui-btn_plain-primary"
          @click="followTag(selectTag)"
        >关注</a>
      </div>
      <div class="search" v-else>
        <input v-model="keyword" placeholder="请输入关键词" v-on:keyup.enter="search"/>
        <i v-if="showClear"
          class="circle-close"
          @click="clear"
        >&times;</i>
      </div>
    </div>
    <div class="discount-list" v-if="discountList">
      <div class="discounts-box" v-for="discount in discountList" :key="discount.id">
        <div :class="discount.pinned ? 'discount pinned' : 'discount'">
          <a class="title" :href="`${discount.goodLink}`" target="_blank">
            <span class="merchant" v-if="discount.merchant">
              <img :src="discount.merchant.icon" :alt="discount.merchant.name">
            </span>
            {{discount.title}}
            <span class="discount_price">{{discount.price}}</span>
          </a>
          <div class="description">
            <img
              v-if="discount.photo"
              :src="`${discount.photo}`"
              @error.once="backup_picture($event)"
              class="discount-photo backup_picture"
              :alt="discount.title"
            >
            <p>{{discount.description}}</p>
          </div>
          <div class="tags">
            <span
              class="tag"
              v-for="tag in discount.tags"
              :key="tag.id"
              @click="filterByTag(tag)"
            >{{tag.name}}</span>
          </div>
          <div class="weui-cell__ft">
            <span class="time">{{discount.displayTime}}</span>
            <a
              v-if="discount.couponLink"
              class="get-coupon"
              v-tippy
              :title="discount.couponName"
              :href="`${discount.couponLink}`"
              target="_blank"
            >优惠券</a>
            <a class="go-buy" :href="`${discount.goodLink}`" target="_blank">去购买</a>
          </div>
        </div>
      </div>
      <div v-if="discountTab == 'concerned' && followedTagIds.length < 1" class="no_message">
        <h4>暂时还没有关注任何标签</h4>
        <p class="tips">点击优惠信息中的标签可以筛选并关注标签哦</p>
      </div>
      <div v-if="keyword && discountList.length < 1" class="no_message">
        <h4>没有找到任何优惠</h4>
        <p class="tips">为了保证结果有效性，只展示近两周的优惠</p>
      </div>
      <div v-if="discountList.length > 0" class="self-recommendation">
        <p class="tips">商家自荐/优惠爆料可联系微信：cindywchat</p>
      </div>
    </div>
    <div class="laoding" v-else>
      <laoding/>
    </div>
  </div>
</template>

<script>
import { DateTime } from "luxon";
import { getSetting, readableTime } from "../static/utils";
import laoding from "./laoding.vue";

export default {
  name: "discounts",
  components: { laoding },
  data() {
    return {
      followedTagIds: getSetting("followedTagIds", []),
      discountTab: "featured",
      discountList: null,
      selectTag: null,
      keyword: null
    };
  },
  mounted: async function() {
    this.getDiscounts();
  },
  computed: {
    followed: function() {
      return (
        this.selectTag &&
        this.followedTagIds.length > 0 &&
        this.followedTagIds.indexOf(this.selectTag.id) > -1
      );
    },
    showClear: function () {
      return this.keyword && this.keyword.length > 0
    }
  },
  methods: {
    backup_picture: function(e) {
      e.currentTarget.src = "https://jjbcdn.zaoshu.so/web/img_error.png";
    },
    getDiscounts: async function(condition) {
      this.discountList = null;
      this.selectTag = null;
      let queryParams = new URLSearchParams(condition);
      let response = await fetch(
        `https://teaclub.zaoshu.so/discount?${queryParams.toString()}`
      );
      let discounts = await response.json();
      this.discountList = discounts.map(function(discount) {
        discount.displayTime = readableTime(
          DateTime.fromISO(discount.createdAt)
        );
        return discount;
      });
      localStorage.setItem("readDiscountAt", new Date());
      this.$forceUpdate();
    },
    search: async function() {
      this.getDiscounts({
        keyword: this.keyword,
      });
    },
    clear: async function() {
      this.keyword = null
      this.switchTab('featured')
    },
    filterByTag: async function(tag) {
      this.discountTab = null;
      this.discountList = null;
      let response = await fetch(
        `https://teaclub.zaoshu.so/discount/tag/${tag.id}`
      );
      let data = await response.json();
      this.selectTag = data.tag;
      this.discountList = data.discounts.map(function(discount) {
        discount.displayTime = readableTime(
          DateTime.fromISO(discount.createdAt)
        );
        return discount;
      });
      localStorage.setItem("readDiscountAt", new Date());
      this.$forceUpdate();
    },
    unfollowTag: async function(tag) {
      this.followedTagIds = this.followedTagIds.filter(
        tagId => tagId != tag.id
      );
      localStorage.setItem(
        "followedTagIds",
        JSON.stringify(this.followedTagIds)
      );
    },
    followTag: async function(tag) {
      let followedTagIds = this.followedTagIds;
      followedTagIds.push(tag.id);
      localStorage.setItem(
        "followedTagIds",
        JSON.stringify(this.followedTagIds)
      );
    },
    switchTab: async function(type) {
      this.discountTab = type;
      this.selectTag = null;
      switch (type) {
        case "featured":
          this.getDiscounts({
            all: false
          });
          break;
        case "concerned":
          if (this.followedTagIds.length > 0) {
            this.getDiscounts({
              tagIds: this.followedTagIds.join(",")
            });
          } else {
            this.discountList = [];
          }
          break;
        case "hot":
          this.getDiscounts({
            hot: true
          });
          break;
        default:
          break;
      }
    }
  }
};
</script>

<style scoped>
.tabs {
  height: 40px;
  width: 200px;
  background: #fff;
  float: left;
}

.tab-list {
  margin-bottom: 0;
  box-shadow: none;
  padding-top: 0.2em;
  padding-left: 0.2em;
}

.tab-list li {
  list-style-type: none;
}

.tab-list .tabs-item {
  display: inline-block;
  padding: 0 15px;
}

.tab-list .tabs-link {
  position: relative;
  display: inline-block;
  padding: 12px 0;
  font-size: 16px;
  line-height: 22px;
  color: #1a1a1a;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
}

.tabs-link.is-active {
  font-weight: 600;
}

.tabs-link.is-active::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 3px;
  background: #921714;
  content: "";
}
.tags {
  overflow: hidden;
  text-overflow: ellipsis;
  width: 55%;
  height: 26px;
}
.tag {
  font-size: 12px;
  background: #eee;
  color: #696969;
  cursor: pointer;
  padding: 0.5em;
  margin-right: 0.5em;
}

.top-bar {
  position: fixed;
  width: 430px;
  height: 47px;
  background: #fff;
  border-bottom: 1px solid #f0f2f7;
  z-index: 10;
}

.select-tag, .search {
  width: 230px;
  float: right;
  line-height: 50px;
  font-size: 14px;
  text-align: right;
  position: relative;
}

.search input{
  -webkit-appearance: none;
  background-color: #fff;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
  color: #606266;
  display: inline-block;
  font-size: inherit;
  height: 30px;
  line-height: 30px;
  outline: none;
  padding: 0 15px;
  transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  width: 70%;
  margin-top: 12px;
  margin-right: 6px;
}

.search input:focus {
    outline: none;
    border-color: #409eff;
}

.search .circle-close{
  position: absolute;
  right: 12px;
  color: #ccc;
  padding: 0 2px;
  cursor: pointer;
}

.tag-box{
  width: 140px;
  text-align: right;
  float: left;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -moz-box-orient: vertical;
  -webkit-box-orient: vertical;
}

.select-tag span.tag-name {
  font-size: 14px;
  background: #eee;
  padding: 6px 8px;
  vertical-align: middle;
  color: #737373;
  height: 30px;
  line-height: 30px;
  margin-top: 11px;
}

.select-tag a.weui-btn {
  vertical-align: middle;
  margin-right: 1em;
  padding-right: 16px;
}
.discount-list {
  margin-top: 50px;
  overflow-y: auto;
  height: 465px;
}
.laoding {
  margin-top: 45px;
}
</style>
